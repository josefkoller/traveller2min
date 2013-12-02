# traveller2min

#= require <stochastic_optimization>
#= require <differential_evolution>
#= require <particle_swarm_optimization>
#= require <performance_functions>

# GRAPHICAL USER INTERFACE, using c3dl-js-library, 3D graphical output and keyboard, mouse input
(->
  (->
    addLine = undefined
    addVectors = undefined
    add_axis = undefined
    clear_lines = undefined
    best_marker = undefined
    scale_lines = undefined
    parameter = undefined
    drawMeshgrid = undefined
    scene = undefined
    vector_on_axis = undefined
    z_scaling = 1
    lines = []
    axis_length = undefined
    traveller_main = (canvas_name) ->
      camera = undefined
      camera_light = undefined
      canvas = undefined
      configure_camera = undefined
      create_collada = undefined
      create_light = undefined
      generation = undefined
      options = undefined
      renderer = undefined
      traveller = undefined
      camera = undefined
      camera_light = undefined
      canvas = undefined
      configure_camera = undefined
      create_collada = undefined
      create_light = undefined
      renderer = undefined
      canvas = document.getElementById(canvas_name)
      scene = new c3dl.Scene()
      scene.setCanvasTag canvas_name
      renderer = new c3dl.WebGL()
      renderer.createRenderer canvas
      renderer.setLighting true
      scene.setAmbientLight [0, 0, 0, 0]
      scene.setBackgroundColor [0.0, 0.0, 0.0]
      scene.setRenderer renderer
      scene.init canvas_name
      return  unless renderer.isReady()
      vector_on_axis = (axis, length) ->
        length = length or 1
        return [length, 0, 0]  if axis is "x"
        return [0, length, 0]  if axis is "y"
        [0, 0, length]  if axis is "z"

      add_axis = (scene, axis, axis_length) ->
        color = undefined
        second_line_point = undefined
        color = undefined
        second_line_point = undefined
        color = vector_on_axis(axis)
        second_line_point = vector_on_axis(axis, axis_length)
        addLine scene, [0, 0, 0], second_line_point, color

      axis_length = 2
      add_axis scene, "x", axis_length
      add_axis scene, "y", axis_length
      add_axis scene, "z", axis_length
      camera = new c3dl.FreeCamera()
      scene.setCamera camera
      configure_camera = (camera, axis) ->
        direction = undefined
        new_position = undefined
        position = undefined
        rotation_speed = undefined
        velocity = undefined
        if axis is "x"
          camera.setPosition [-1, 0, 0]
          return camera.setLookAtPoint([0, 0, 0])
        camera.setPosition [-0.3, 0.1, -0.3]  if axis is "y"
        if axis is "z"
          camera.setPosition [0, 0, -1]
          return camera.setLookAtPoint([0, 0, 0])
        rotation_speed = Math.PI / 16
        if axis is "a"
          camera.yaw rotation_speed
          return
        if axis is "d"
          camera.yaw -rotation_speed
          return
        if axis is "u"
          factor = 2
          z_scaling = z_scaling * factor
          scale_lines factor
          return
        if axis is "i"
          factor = 0.5
          z_scaling = z_scaling * factor
          scale_lines factor
          return
        if axis is "r"
          run_evolution scene
          return
        if axis is 'm' # go no minimum
          return unless best_marker
          marker_coordinates = best_marker.getCoordinates()
          min = [marker_coordinates[0], marker_coordinates[1], marker_coordinates[2]]
          camera.setLookAtPoint min
          return
        position = camera.getPosition()
        direction = camera.getDir()
        velocity = 0.5
        velocity = velocity * -1  if axis is "s"
        new_position = [position[0] + direction[0] * velocity, position[1] + direction[1] * velocity, position[2] + direction[2] * velocity]
        camera.setPosition new_position

      configure_camera camera, "z"
      scene.setKeyboardCallback (event) ->
        d = undefined
        key_mapping = undefined
        p = undefined
        text = undefined
        key_mapping = undefined
        key_mapping =
          88: "x"
          89: "y"
          90: "z"
          87: "w"
          83: "s"
          65: "a"
          68: "d"
          85: "u"
          73: "i"
          82: 'r'
          77: 'm'
        configure_camera scene.getCamera(), key_mapping[event.keyCode]
        float_presenter = (float) -> float.toFixed(3)
        vector_presenter = (vector) -> "#{float_presenter(vector[0])}|#{float_presenter(vector[1])}|#{float_presenter(vector[2])}"
        text = "position: #{vector_presenter(camera.getPosition())}<br/> direction: #{vector_presenter(camera.getDir())}"
        $("#camera_display").html text
        false
      camera.setPosition [10, 3, -8]
      camera.setLookAtPoint [0, 0, 0]
      scene.startScene()
      scene.setPickingCallback on_scene_object_picking
      scene.setPickingPrecision c3dl.PICK_PRECISION_BOUNDING_VOLUME

    on_scene_object_picking = (picking_result) ->
      picked_objects = picking_result.getObjects()
      used_button = picking_result.getButtonUsed()
      for picked_object in picked_objects
        if used_button == 1
          coordinates = picked_object.getCoordinates()
          if coordinates
            alert(coordinates[1])


    drawMeshgrid = (scene) ->
      color1 = undefined
      color2 = undefined
      h = undefined
      i = undefined
      point1 = undefined
      point2 = undefined
      s = undefined
      x = undefined
      y = undefined
      z = undefined
      clear_lines scene
      lines = []
      add_axis scene, "x", axis_length
      add_axis scene, "y", axis_length * z_scaling
      add_axis scene, "z", axis_length
      color1 = [1, 0, 0]
      color2 = [0, 0, 1]
      xmin = parameter.search_space[0].min
      xmax = parameter.search_space[0].max
      search_space2 = parameter.search_space[1] or (min: 0, max:0)
      ymin = search_space2.min
      ymax = search_space2.max
      xh = xmax - xmin
      yh = ymax - ymin
      s = 20
      xs = (xmax-xmin)/s
      ys = 1
      if ymax > ymin
        ys = (ymax-ymin)/s
      y = ymin
      min = {}
      min.z = undefined
      while y <= ymax
        x = xmin
        while x <= xmax
          X = [x,y]
          z = parameter.objective(X);
          z = z / 100000 * z_scaling
          if min.z == undefined or z < min.z
            min.x = x
            min.y = y
            min.z = z
          point1 = [x, 0, y]
          point2 = [x, z, y]
          addLine scene, point1, point2, color1, color2
          x = x + xs
        y = y + ys

      $("#meshgrid_display").html "min by meshgrid: #{min.x}|#{min.z}|#{min.y}"

    clear_lines = (scene) ->
      for line in lines
        scene.removeObjectFromScene line

    scale_lines = (factor) ->
      for line in lines
        scale_line line, factor

    scale_line = (line, factor) ->
      coordinates = line.getCoordinates()
      z = coordinates[4]
      z *= factor
      point1 = [coordinates[0], coordinates[1], coordinates[2]]
      point2 = [coordinates[3], z, coordinates[5]]
      line.setCoordinates(point1, point2)

    addLine = (scene, point1, point2, color, color2, width) ->
      color2 = color  unless color2
      line = new c3dl.Line()
      line.setCoordinates point1, point2
      line.setColors color, color2
      line.setWidth (width or 1)
      lines.push line
      scene.addObjectToScene line
      line

    generation_color1 = [0.8, 0.9, 0]
    generation_color2 = [0, 0.2, 0.8]
    generation_width = 1
    death_color1 = [0.2, 0.3, 0]
    death_color2 = [0, 0.6, 0.3]
    death_width = 1
    best_color1 = [0.9, 0.1, 0.0]
    best_color2 = [0.9, 0.1, 0.0]
    best_width = 6

    add_particle_line = (scene, particle) ->
      x = particle.parameter_value[0]
      y = particle.parameter_value[1] or 0
      z = particle.objective_value
      z = 4 - (z / 100000 * z_scaling)
      point1 = [x,0,y]
      point2 = [x,z,y]
      line = addLine scene, point1, point2, generation_color1, generation_color2, generation_width
      particle.line = line

    kill_particle_line = (scene, particle, iteration_progress) ->
      color1 = [0,0,0]
      c = 255 * iteration_progress
      color2 = [c,c,c]
      particle.line.setColors color1, color2
      particle.line.setWidth death_width
      scale_line particle.line, 0.5
      unless SHOW_DEATH_PARTICLE
        scene.removeObjectFromScene(particle.line)
      particle.line = null

    best_particle_changes = (scene, particle) ->
      return unless particle.line
      coordinates = particle.line.getCoordinates()
      point1 = [coordinates[0], 0, coordinates[2]]
      point2 = [coordinates[0], -3, coordinates[2]]
      if best_marker == undefined
        best_marker = addLine scene, point1, point2, best_color1, best_color2, best_width
      else
        best_marker.setCoordinates point1, point2

    run_evolution = (scene) ->
      clear_lines scene
      best_marker = undefined
      parameter = parameter10 # PARAMETER SELECTION p_s
      $('#objective_name').html(parameter.objective_name)
      $('#number_of_particles').html(parameter.number_of_particles)
      $('#number_of_iterations').html(parameter.number_of_iterations)
      $('#objective').html(parameter.objective.toString())
      $('#search_space').html('')
      for search_space in parameter.search_space
        element = $('<li>')
        element.append('min: ' + search_space.min + ' max: ' + search_space.max)
        $('#search_space').append(element)
      parameter.scene = scene
      parameter.on_particle_creation = (particle) ->
        add_particle_line(parameter.scene, particle)
      parameter.on_best_particle_changes = (particle) ->
        best_particle_changes(parameter.scene, particle)
      parameter.on_particle_death = (particle,iteration_progress) ->
        kill_particle_line(parameter.scene, particle, iteration_progress)
      drawMeshgrid scene
      algorithm =new differential_evolution(parameter) # ALGORITHM SELECTION a_s
      algorithm.run()

    c3dl.addMainCallBack traveller_main, "traveller_canvas"
  ).call this
).call this
