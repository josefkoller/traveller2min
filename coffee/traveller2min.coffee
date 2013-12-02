# differential evolution algorithm

ITERATION_SLEEP = 1/40 * 1000 # milliseconds
DISPLAY_ITERATION_INFO = true
SHOW_DEATH_PARTICLE = false

parameter1 = {}
parameter1.objective_name = 'beales'
parameter1.objective = (X) ->
  x = X[0]
  y = X[1]
  square(1.5 - x + x * y) + square(2.25 - x + x * y * y) + square(2.625 - x + x * y * y * y)
parameter1.search_space = [(min: -4.5, max: 4.5),(min: -4.5, max: 4.5)]
parameter1.number_of_dimensions = 2
parameter1.number_of_particles = 64 
parameter1.number_of_iterations = 30

parameter2 = {}
parameter2.objective_name = 'rosenbrock'
parameter2.objective = (X) ->
	x = X[0]
	y = X[1]
	(100*square(y-x*x)+square(y-1))
parameter2.search_space = [(min: -0.5, max: 3),(min: -1.5, max: 2.0)]
parameter2.number_of_dimensions = 2
parameter2.number_of_particles = 64
parameter2.number_of_iterations = 50

parameter3 = {}
parameter3.objective_name = 'goldstein-price'
parameter3.objective = (X) ->
  x = X[0]
  y = X[1]
  (1+square(x+y+1)*(19-14*x+3*x*x-14*y+6*x*y+3*y*y))*(30+square(2*x-3*y)*(18-32*x+12*x*x+48*y-36*x*y+27*y*y))
parameter3.search_space = [(min: -1.5, max: 1.5),(min: -1.5, max: 1.5)]
parameter3.number_of_dimensions = 2
parameter3.number_of_particles = 64
parameter3.number_of_iterations = 200

parameter4 = {}
parameter4.objective_name = 'bukin function n. 6'
parameter4.objective = (X) ->
  x = X[0]
  y = X[1]
  (100*Math.sqrt(Math.abs(y-0.01*x*x))+0.01*Math.abs(x+10))
parameter4.search_space = [(min: -15, max: -5),(min: -3, max: 3)]
parameter4.number_of_dimensions = 2
parameter4.number_of_particles = 256
parameter4.number_of_iterations = 1000

parameter5 = {}
parameter5.objective_name = 'ackleys'
parameter5.objective = (X) ->
  x = X[0]
  y = X[1]
  (-20*Math.exp(-0.2*Math.sqrt(0.5*(x*x+y*y)))-Math.exp(0.5*(Math.cos(2*Math.PI*x)+Math.cos(2*Math.PI*y)))+20+Math.exp(1))
parameter5.search_space = [(min: -5, max: 5),(min: -5, max: 5)]
parameter5.number_of_dimensions = 2
parameter5.number_of_particles = 64
parameter5.number_of_iterations = 200

parameter6 = {}
parameter6.objective_name = 'matyas'
parameter6.objective = (X) ->
  x = X[0]
  y = X[1]
  (0.26*(x*x+y*y)-0.48*x*y)
parameter6.search_space = [(min: -10, max: 10),(min: -10, max: 10)]
parameter6.number_of_dimensions = 2
parameter6.number_of_particles = 64
parameter6.number_of_iterations = 200

parameter7 = {}
parameter7.objective_name = 'hoelder table'
parameter7.objective = (X) ->
  x = X[0]
  y = X[1]
  (-Math.abs(Math.sin(x)*Math.cos(y)*Math.exp(Math.abs(1-(Math.sqrt(x*x+y*y)/Math.PI)))))
parameter7.search_space = [(min: -10, max: 10),(min: -10, max: 10)]
parameter7.number_of_dimensions = 2
parameter7.number_of_particles = 64
parameter7.number_of_iterations = 400

parameter8 = {}
parameter8.objective_name = 'schaffer function n.3'
parameter8.objective = (X) ->
  x = X[0]
  y = X[1]
  (0.5+(square(Math.sin(x*x-y*y))-0.5)/square(1+0.001*(x*x+y*y)))
parameter8.search_space = [(min: -100, max: 100),(min: -100, max: 100)]
parameter8.number_of_dimensions = 2
parameter8.number_of_particles = 64 
parameter8.number_of_iterations = 800 

parameter9 = {}
parameter9.objective_name = 'styblinski-tang'
parameter9.objective = (X) ->
  z = 0
  for x in X
    z += x*x*x*x - 16*x*x + 5*x
  z*0.5
parameter9.search_space = []
for i in [1..20]
  parameter9.search_space.push(min: -5, max: 5)
parameter9.number_of_dimensions = parameter9.search_space.length
parameter9.number_of_particles = 2000
parameter9.number_of_iterations = 200

parameter10 = {}
parameter10.objective_name = 'six-hump camel back'
parameter10.objective = (X) ->
  x = X[0]
  y = X[1]
  x2 = x*x
  x4 = x2*x2
  y2 = y*y
  (4 - 2.1*x2 + x4/3)*x2 + x*y + (-4 + 4*y2)*y2
parameter10.search_space = [
  ( min: -3, max: 3 ),
  ( min: -3, max: 3 )
]
parameter10.number_of_dimensions = 2
parameter10.number_of_particles = 64

parameter11 = {}
parameter11.objective_name = 'drop wave'
parameter11.objective = (X) ->
  x = X[0]
  #y = X[1]
  gsum = x*x # + y*y
  -(1 + Math.cos(12*Math.sqrt(gsum))) / (0.5*gsum + 2)
search_space11 = ( min: -Math.PI*2, max: Math.PI*2 )
parameter11.search_space = [search_space11, search_space11]
parameter11.number_of_dimensions = 1
parameter11.number_of_particles = 64
parameter11.number_of_iterations = 100


# Particle class...
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
    shuffling_i = 0
    while shuffling_i < @parameter.number_of_particles
      @add_random_particle()
      shuffling_i++

  check_best_particle: (new_particle) ->
    return  if @current_best_particle? and @current_best_particle.objective_value < new_particle.objective_value
    @parameter.on_best_particle_changes(new_particle) 
    @current_best_particle = new_particle

  add: (parameter_value, objective_value) ->
    particle = new Particle(parameter_value, objective_value)
    @particles.push particle
    @parameter.on_particle_creation particle
    @check_best_particle particle

  check_parameter_value_in_search_space: (parameter_value) ->
    parameter_i = 0
    while parameter_i < parameter_value.length
      dimension_value = parameter_value[parameter_i]
      search_space = @parameter.search_space[parameter_i]
      return @create_random_parameter_value() if dimension_value < search_space.min or dimension_value > search_space.max
      parameter_i++
    parameter_value


  create_random_parameter_value: () ->
    parameter_value = new Array()
    ri = 0
    while ri < @parameter.number_of_dimensions
      search_space = @parameter.search_space[ri]
      width = search_space.max - search_space.min
      parameter_value_xi = search_space.min + width * Math.random()
      parameter_value.push parameter_value_xi
      ri++
    parameter_value

  add_random_particle: ->
    parameter_value = @create_random_parameter_value()
    objective_value = @parameter.objective(parameter_value)
    @add parameter_value, objective_value

  
  # TODO: make create function, check distance, quasi-random
  pick_random_particle: ->
    index = Math.round(Math.random() * (@particles.length - 1))
    @particles[index]

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
    $('#termination_display').html "running..."
    @initialize()
    @iteration()

  iteration: () ->
    if DISPLAY_ITERATION_INFO
      $('#iteration_display').html "<br/>iteration: #{@current_iteration}/#{@parameter.number_of_iterations}"
    @mutation()
    @recombination()
    @selection()
    that = this
    if(@start_iteration())
      window.setTimeout((() -> that.iteration()), ITERATION_SLEEP)
    else
      @termination()

  initialize: => 
    @particles = new ParticleStorage(@parameter)
    @particles.shuffle()
    @current_iteration = 0

  start_iteration: () ->
    return false  if @current_iteration is @parameter.number_of_iterations
    @iteration_progress = @current_iteration / @parameter.number_of_iterations
    @current_iteration++
    true

  mutation: =>
    particle_mutation = (parameter, current, random1, random2, best) ->
      child = new Array()
      xi = 0
      while xi < parameter.number_of_dimensions
        child_xi = current[xi] + parameter.mutation_factor1 * (random2[xi] - random1[xi]) + parameter.mutation_factor2 * (best[xi] - current[xi])
        child.push child_xi
        xi++
      child
    for particle in @particles.particles
      random1 = @particles.pick_random_particle()
      random2 = @particles.pick_random_particle()
      best = @particles.current_best_particle
      child_parameter_value = particle_mutation(@parameter, particle.parameter_value, random1.parameter_value, random2.parameter_value, best.parameter_value)
      child_parameter_value = @particles.check_parameter_value_in_search_space child_parameter_value
      child_objective_value = @parameter.objective(child_parameter_value)
      particle.child = new Particle(child_parameter_value, child_objective_value)

  recombination: =>
    for particle in @particles.particles
      particle.cross_over = Math.random() < @parameter.cross_over_ratio

  selection: =>
    child_wins = 0
    for particle in @particles.particles
      if particle.cross_over and particle.child.dominates(particle)
        child_wins++
        @parameter.on_particle_death(particle, @iteration_progress)
        particle.parameter_value = particle.child.parameter_value
        particle.objective_value = particle.child.objective_value
        @parameter.on_particle_creation(particle)
        @particles.check_best_particle(particle)
    if DISPLAY_ITERATION_INFO
      $('#iteration_display').append "<br/>#{child_wins}/#{@particles.particles.length} wins"

  termination: =>
    best = @particles.current_best_particle
    text = "FINISHED!<br/>Best particle at termination:<br/>" + best.to_string()
    $("#termination_display").html text

Particle::dominates = (other) ->
  @objective_value < other.objective_value


Particle::to_string = ->
  display_float = (float) ->
     if float < 0.0000001
       0
     float
  parameter_value = "("
  for dimension_value in @parameter_value
     parameter_value += display_float(dimension_value) + ", "
  parameter_value += ")"
  objective_value = display_float @objective_value
  "parameter value: " + parameter_value + "<br/>objective value: " + objective_value











(->
  (->
    addLine = undefined
    addVectors = undefined
    add_axis = undefined
    clear_lines = undefined
    best_marker = undefined
    scale_lines = undefined
    axis_length = undefined
    parameter = undefined
    drawMeshgrid = undefined
    lines = undefined
    scene = undefined
    square = undefined
    traveller_main = undefined
    vector_on_axis = undefined
    z_scaling = undefined
    addVectors = undefined
    square = undefined
    traveller_main = undefined
    scene = undefined
    drawMeshgrid = undefined
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

    square = (x) ->
      x * x

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
      parameter = parameter11 # PARAMETER SELECTION
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
      algorithm =new differential_evolution(parameter)
      algorithm.run()

    c3dl.addMainCallBack traveller_main, "traveller_canvas"
  ).call this
).call this
