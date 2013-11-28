# traveller

#c3dl.addModel('sphere.dae')
#c3dl.addModel('cylinder.dae')

ai = 0                  # animation index
photon_index = 0
PHOTON_COUNT = 1e6
photon_lines = []
photon_end_point = null
scene = null
traveller = null

traveller_main = (canvas_name) ->
  canvas = document.getElementById(canvas_name)
  scene = new c3dl.Scene()
  scene.setCanvasTag(canvas_name)

  renderer = new c3dl.WebGL()
  renderer.createRenderer(canvas)

  renderer.setLighting(true)
  scene.setAmbientLight([0,0,0,0])
  scene.setBackgroundColor([0.0, 0.0, 0.0])

  scene.setRenderer(renderer)
  scene.init(canvas_name)

  return unless renderer.isReady()

  #render(scene)
  create_collada = (scene,filename,scaling,position,diffuse_color) ->
    collada = new c3dl.Collada()
    collada.init(filename)
    collada.scale([scaling,scaling,scaling])
    collada.translate(position)
    material = new c3dl.Material()
    material.setDiffuse(diffuse_color)
    collada.setMaterial(material)
    scene.addObjectToScene(collada)
    return {
      collada:collada,
      move : (position) ->
        collada.setPosition(position)
    }
    #cylinder = create_collada(scene,
    #'cylinder.dae', 0.02, [0,0,0], [0,1,0.1//])
    
# sphere = create_collada(scene,
#'sphere.dae', 0.002, [0,0,0], [1,1,0.1])

  #render axis
  vector_on_axis = (axis, length) ->
    length = length || 1
    if axis is 'x'
      return [length,0,0]
    if axis is 'y'
      return [0,length,0]
    if axis is 'z'
      return [0,0,length]
  add_axis = (scene, axis, axis_length) ->
    color = vector_on_axis(axis)
    second_line_point = vector_on_axis(axis, axis_length)
    addLine(scene, [0,0,0], second_line_point, color)
  axis_length = 2
  add_axis(scene, 'x', axis_length)
  add_axis(scene, 'y', axis_length)
  add_axis(scene, 'z', axis_length)

  camera = new c3dl.FreeCamera()
  scene.setCamera(camera)
  configure_camera = (camera, axis) ->
    if axis is 'x'
      camera.setPosition([-1,0,0])
    if axis is 'y'
      camera.setPosition([-0.3,0.1,-0.3])
    if axis is 'z'
      camera.setPosition([0,0,-1])
    camera.setLookAtPoint([0,0,0])
  configure_camera(camera, 'z')
  scene.setKeyboardCallback( (event) ->
    key_mapping = {88:'x',89:'y',90:'z'}
    configure_camera(scene.getCamera(), key_mapping[event.keyCode])
  )
  camera.setPosition([-0.2,0.1,-0.2])
  camera.setLookAtPoint([0,0,0])

  create_light = (scene, diffuse_color) ->
    light = new c3dl.PositionalLight()
    light.setDiffuse(diffuse_color)
    light.setOn(true)
    scene.addLight(light)
    return {
      light : light,
      move : (position) ->
        this.light.setPosition(position)
    }
  camera_light = create_light(scene, [1,2,3])
  traveller = {
    #    geometry : sphere,
    light : camera_light,
    move : (position) ->
       this.geometry.move(position)
       this.light.move(position)
    display : (position) ->
      p = [position[0].toFixed(2),
        position[1].toFixed(2),
        position[2].toFixed(2)]
      text = "#{photon_index}: x=#{p[0]},y=#{p[1]},z=#{p[2]}"
      $('#traveller_display').html text
  }
  scene.startScene()
  launch_photon(scene)

launch_photon = (scene) ->
  if ++photon_index > PHOTON_COUNT
    return
  renderPhotonsTravell(scene)
  wait_and_fire scene

wait_and_fire = () ->
  setTimeout fire, 1

fire = () ->
  draw_start_end_line()
  clear_photon_lines()
  launch_photon scene

clear_photon_lines = () ->
  photon_end_point = null
  #for line in photon_lines
  #  scene.removeObjectFromScene(line)
  #photon_lines = []

draw_start_end_line = () ->
  coords1 = photon_end_point
  point1 = [coords1[0], coords1[1], coords1[2]]
  point2 = [0,0,0]
  color1 = [1,0,0]
  color2 = [1,0,1]
  addLine(scene, point1, point2, color1, color2)

addLine = (scene, point1, point2, color, color2) ->
  if not color2
    color2 = color
  line = new c3dl.Line()
  line.setCoordinates(point1, point2)
  line.setColors(color, color2)
  line.setWidth(2)
  scene.addObjectToScene(line)
  return line

scaleVector = (vector, factor) ->
  [vector[0] * factor, vector[1] * factor, vector[2] * factor]
addVectors = (vector1, vector2) ->
  [vector1[0] + vector2[0], vector1[1] + vector2[1], vector1[2] + vector2[2] ]
dotVectors = (vector1, vector2) ->
  vector1[0] * vector2[0] + vector1[1] * vector2[1] + vector1[2] * vector2[2]
power = (base, exponent) ->
  result = 1
  for i in [1..exponent]
    result *= base
  result

random = ->
  Math.random()

renderPhotonsTravell = (scene) ->
  # medium optical properties
  mu_a = 1 # 1/cm
  mu_s = 300
  g = 0.9
  g2 = g*g
  n = 1.33

  #launch
  photon_state = 'alive'
  photon_weight = 1.0
  photon_position = [0, 0, 0]
  photon_direction = [1, 0, 0]
  photon_velocity = 800

  step_count = 2000
  radial_beam_size = 2
  dr = radial_beam_size / step_count
  albedo = mu_s / (mu_s + mu_a)

  step = 0
  while photon_state == 'alive' and (step++) < step_count
    cos_theta = 2 * random() - 1
    sin_theta = Math.sqrt(1 - power(cos_theta, 2))
    psi = 2 * Math.PI * random()
    photon_direction = [
      sin_theta * Math.cos(psi),
      sin_theta * Math.sin(psi),
      cos_theta]
    travell_length = -Math.log(random()) / (mu_a + mu_s)
    # hop
    new_photon_position = addVectors(photon_position,
      scaleVector(photon_direction, travell_length))
    line_color = [photon_weight, 1, 1]

    photon_end_point = new_photon_position
    traveller.display new_photon_position

    #photon_line = addLine(scene, photon_position, new_photon_position, line_color)
    #photon_lines.push(photon_line)
    photon_position = new_photon_position
    # drop
    probality_absorbed = photon_weight * (1 - albedo)
    photon_weight -= probality_absorbed
    # spin
    if g is 0
      cos_theta = 2 * random() - 1
    else
      cos_theta = (1+g2 - power((1-g2)/(1-g+2*g*random()), 2))/(2*g)
    sin_theta = Math.sqrt(1 - power(cos_theta,2))
    psi = 2*Math.PI * random()
    cos_psi = Math.cos(psi)
    if psi < Math.PI
      sin_psi = Math.sqrt(1-power(cos_psi, 2))
    else
      sin_psi = -Math.sqrt(1-power(cos_psi, 2))
    z_size = Math.sqrt(1-power(photon_direction[2], 2))

    new_photon_direction = [
      sin_theta * (photon_direction[0]*photon_direction[2] + cos_psi - photon_direction[1]*sin_psi) / z_size + photon_direction[0] * cos_theta,
      sin_theta * (photon_direction[1]*photon_direction[2] + cos_psi - photon_direction[0]*sin_psi) / z_size + photon_direction[1] * cos_theta,
      -sin_theta * cos_psi * z_size + photon_direction[2] * cos_theta]
    photon_direction = new_photon_direction

    PHOTON_WEIGHT_THRESHOLD = 0.01
    PHOTON_WEIGHT_INCREASE_PROBALITY = 0.1
    if photon_weight < PHOTON_WEIGHT_THRESHOLD
      if random() <= PHOTON_WEIGHT_INCREASE_PROBALITY
        photon_weight /= PHOTON_WEIGHT_INCREASE_PROBALITY
      else
        photon_state = 'dead'

      
  # terminate?
  # n Photons
  # output

c3dl.addMainCallBack(traveller_main, "traveller_canvas");
