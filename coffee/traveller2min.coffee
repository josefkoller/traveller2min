# differential evolution algorithm

# TODO: convergence tests
class Particle 
  constructor: (parameter_value, objective_value) ->
    @parameter_value = parameter_value
    @objective_value = objective_value
class ParticleStorage
  constructor: (parameter) ->
    @parameter = parameter
  shuffle:  ->
    @particles = new Array()
    @current_best_particle = null
    i = 0
    while i < @parameter.number_of_particles
      @add_random_particle()
      i++

  check_best_particle: (new_particle) ->
    return  if @current_best_particle? and @current_best_particle.objective_value < new_particle.objective_value
    @current_best_particle = new_particle

  add: (parameter_value, objective_value) ->
    particle = new Particle(parameter_value, objective_value)
    @check_best_particle particle
    @particles.push particle
    @parameter.on_particle_creation particle

  check_parameter_value_in_search_space: (parameter_value) ->
    i = 0
    while i < parameter_value.length
      dimension_value = parameter_value[i]
      search_space = @parameter.search_space[i]
      return @create_random_parameter_value() if dimension_value < search_space.min or dimension_value > search_space.max
      i++
    parameter_value


  create_random_parameter_value: () ->
    parameter_value = new Array()
    xi = 0
    while xi < @parameter.number_of_dimensions
      search_space = @parameter.search_space[xi]
      width = search_space.max - search_space.min
      parameter_value_xi = search_space.min + width * Math.random()
      parameter_value.push parameter_value_xi
      xi++
    parameter_value

  add_random_particle: ->
    parameter_value = @create_random_parameter_value()
    objective_value = @parameter.objective(parameter_value)
    @add parameter_value, objective_value

  
  # TODO: make create function, check distance, quasi-random
  pick_random_particle: ->
    index = Math.round(Math.random() * (@particles.length - 1))
    @particles[index]

  for_each: (particle_action) ->
    i = 0

    while i < @particles.length
      particle = @particles[i]
      particle_action particle, this
      i++
run = ->
  algorithm = new differential_evolution()
  algorithm.run()
objective1 = (x) ->
  x * x

square = (x) ->
  x * x

objective2 = (X) ->
  x = X[0]
  y = X[1]
  square(1.5 - x + x * y) + square(2.25 - x + x * y * y) + square(2.625 - x + x * y * y * y)

class differential_evolution
  constructor: (parameter) ->
    @parameter = parameter or {}
    @parameter.objective = parameter.objective or objective1
    @parameter.search_space = parameter.search_space or [(min: -1, max: 1)]
    @parameter.number_of_dimensions = parameter.number_of_dimensions or 1
    @parameter.number_of_particles = parameter.number_of_particles or 100
    @parameter.number_of_iterations = parameter.number_of_iterations or 10
    @parameter.mutation_factor1 = parameter.mutation_factor1 or 0.7
    @parameter.mutation_factor2 = parameter.mutation_factor2 or 0.9
    @parameter.cross_over_ratio = parameter.cross_over_ratio or 0.8
  run: =>
    @initialize()
    while @start_iteration()
      @mutation()
      @recombination()
      @selection()
    @termination()

  initialize: => 
    @particles = new ParticleStorage(@parameter)
    @particles.shuffle()
    @current_iteration = 0

  start_iteration: () ->
    return false  if @current_iteration is @parameter.number_of_iterations
    @current_iteration++
    true

  mutation: ->
    particle_mutation = (parameter, current, random1, random2, best) ->
      child = new Array()
      xi = 0

      while xi < parameter.number_of_dimensions
        child_xi = current[xi] + parameter.mutation_factor1 * (random2[xi] - random1[xi]) + parameter.mutation_factor2 * (best[xi] - current[xi])
        child.push child_xi
        xi++
      child

    @particles.for_each (particle, particles) ->
      random1 = particles.pick_random_particle()
      random2 = particles.pick_random_particle()
      best = particles.current_best_particle
      child_parameter_value = particle_mutation(particles.parameter, particle.parameter_value, random1.parameter_value, random2.parameter_value, best.parameter_value)
      child_parameter_value = particles.check_parameter_value_in_search_space child_parameter_value
      child_objective_value = particles.parameter.objective(child_parameter_value)
      particle.child = new Particle(child_parameter_value, child_objective_value)


  recombination: =>
    @particles.for_each (particle, particles) ->
      particle.cross_over = Math.random() < particles.parameter.cross_over_ratio


  selection: => 
    @particles.for_each (particle, particles) ->
      (particles.parameter.on_particle_creation(particle) if particle.fight())


  termination: =>
    best = @particles.current_best_particle
    text = "Best particle at termination: " + best.to_string()
    $("#termination_display").html text

Particle::dominates = (other) ->
  @objective_value < other.objective_value

Particle::fight = ->
  if @cross_over and @child.dominates(this)
    @parameter_value = @child.parameter_value
    @objective_value = @child.objective_value
    return true
  false

Particle::to_string = ->
  parameter_value = "("
  for dimension_value in @parameter_value
     parameter_value += dimension_value + ", "
  parameter_value += ")" 
  "parameter value: " + parameter_value + ", objective value: " + @objective_value















(->
  (->
    addLine = undefined
    addVectors = undefined
    add_axis = undefined
    clear_lines = undefined
    scale_lines = undefined
    axis_length = undefined
    drawF1 = undefined
    lines = undefined
    scene = undefined
    square = undefined
    traveller_main = undefined
    vector_on_axis = undefined
    z_scaling = undefined
    addLine = undefined
    addVectors = undefined
    square = undefined
    traveller_main = undefined
    scene = undefined
    drawF1 = undefined
    z_scaling = 1
    lines = []
    axis_length = undefined
    add_axis = undefined
    vector_on_axis = undefined
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
        if axis is "space"
          run_evolution scene
          # first_line = lines[0]
          # first_line.setColors([0.2,0.4,0],[1,1,1] )
          # first_line.setCoordinates([0,0,0], [10,10,10])
          return
        position = camera.getPosition()
        direction = camera.getDir()
        velocity = 0.5
        velocity = velocity * -1  if axis is "s"
        new_position = [position[0] + direction[0] * velocity, position[1] + direction[1] * velocity, position[2] + direction[2] * velocity]
        camera.setPosition new_position
        camera.setLookAtPoint [0, 0, 0]

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
          32: 'space'
        configure_camera scene.getCamera(), key_mapping[event.keyCode]
        p = camera.getPosition()
        d = camera.getDir()
        text = "pos: (" + p[0] + "," + p[1] + "," + p[2] + "); " + "dir:  (" + d[0] + "," + d[1] + "," + d[2] + ")"
        $("#traveller_display").html text
        false

      camera.setPosition [10, 3, -8]
      camera.setLookAtPoint [0, 0, 0]
      create_light = (scene, diffuse_color) ->
        light = undefined
        light = undefined
        light = new c3dl.PositionalLight()
        light.setDiffuse diffuse_color
        light.setOn true
        scene.addLight light
        light: light
        move: (position) ->
          @light.setPosition position

      camera_light = create_light(scene, [1, 2, 3])
      traveller =
        light: camera_light
        move: (position) ->
          @geometry.move position
          @light.move position

        display: (position) ->
          p = undefined
          text = undefined
          p = undefined
          text = undefined
          p = [position[0].toFixed(2), position[1].toFixed(2), position[2].toFixed(2)]
          text = "" + photon_index + ": x=" + p[0] + ",y=" + p[1] + ",z=" + p[2]
          $("#traveller_display").html text

      scene.startScene()
      # drawF1 scene
      generation = []
      options = {}
      options.color

    drawF1 = (scene) ->
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
      _results = undefined
      clear_lines scene
      lines = []
      add_axis scene, "x", axis_length
      add_axis scene, "y", axis_length * z_scaling
      add_axis scene, "z", axis_length
      color1 = [1, 0, 0]
      color2 = [0, 0, 1]
      h = 4.5
      s = 0.5
      y = -h
      _results = []
      min = {}
      min.z = undefined
      while y <= h
        x = -h
        while x <= h
          z = square(1.5 - x + x * y) + square(2.25 - x + x * y * y) + square(2.625 - x + x * y * y * y)
          z = z / 100000 * z_scaling
          if min.z == undefined or z < min.z
            min.x = x
            min.y = y
            min.z = z
          point1 = [x, 0, y]
          point2 = [x, z, y]
          addLine scene, point1, point2, color1, color2
          x = x + s
        _results.push y = y + s
      $("#termination_display").html "min: #{min.x}|#{min.z}|#{min.y}"
      _results

    clear_lines = (scene) ->
      for line in lines
        scene.removeObjectFromScene line

    scale_lines = (factor) ->
      for line in lines
        coordinates = line.getCoordinates()
        z = coordinates[4]	
        z *= factor
        point1 = [coordinates[0], coordinates[1], coordinates[2]]
        point2 = [coordinates[3], z, coordinates[5]]
        line.setCoordinates(point1, point2)

    addLine = (scene, point1, point2, color, color2) ->
      line = undefined
      line = undefined
      color2 = color  unless color2
      line = new c3dl.Line()
      line.setCoordinates point1, point2
      line.setColors color, color2
      line.setWidth 4
      lines.push line
      scene.addObjectToScene line
      line

    square = (x) ->
      x * x

    add_particle_line = (scene, particle) ->
      color1 = [0.8, 0.9, 0]
      color2 = [0, 0.2, 0.8]
      x = particle.parameter_value[0]
      y = particle.parameter_value[1] or 0
      z = particle.objective_value 
      z = (z / 100000 * z_scaling)
      point1 = [x,0,y]
      point2 = [x,z,y]
      addLine scene, point1, point2, color1, color2

    run_evolution = (scene) ->
      clear_lines scene
      parameter = {}
      parameter.scene = scene
      parameter.on_particle_creation = (particle) ->
        add_particle_line(parameter.scene, particle)
      parameter.on_best_particle_changes = (particle) ->
        add_particle_line(parameter.scene, particle)
      parameter.objective = (X) ->
        x = X[0]
        y = X[1]
        square(1.5 - x + x * y) + square(2.25 - x + x * y * y) + square(2.625 - x + x * y * y * y)
      parameter.search_space = [(min: -4.5, max: 4.5),(min: -4.5, max: 4.5)]
      parameter.number_of_dimensions = 2
      parameter.number_of_particles = 64
      parameter.number_of_iterations = 64
      algorithm =new differential_evolution(parameter)
      algorithm.run()

    c3dl.addMainCallBack traveller_main, "traveller_canvas"
  ).call this
).call this
