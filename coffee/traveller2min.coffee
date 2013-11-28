
	# moving straight ahead or back...

	#clear

	# axis

	# background function....
	(->
	  addLine = undefined
	  addVectors = undefined
	  objective1 = undefined
	  clear_lines = undefined
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
		z_scaling = z_scaling * 2
		drawF1 scene
		return
	      if axis is "i"
		z_scaling = z_scaling * 0.5
		drawF1 scene
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
		p = [position[0].toFixed(2), position[1].toFixed(2), position[2].toFixed(2)]
		text = "" + photon_index + ": x=" + p[0] + ",y=" + p[1] + ",z=" + p[2]
		$("#traveller_display").html text

	    scene.startScene()
	    drawF1 scene
	    generation = []
	    options = {}
	    options.color

	  drawF1 = (scene) ->
            clear_lines scene
	    add_axis scene, "x", axis_length
	    add_axis scene, "y", axis_length * z_scaling
	    add_axis scene, "z", axis_length
	    color1 = [1, 0, 0]
	    color2 = [0, 0, 1]
	    h = 4.5
	    s = 0.5
	    y = -h
	    while y <= h
	      x = -h
	      while x <= h
	z = objective1 x,y
        z = z / 100000 * z_scaling
        point1 = [x, 0, y]
        point2 = [x, z, y]
        addLine scene, point1, point2, color1, color2
        x = x + s
      y = y + s

  objective1 = (x,y) ->
    z = square(1.5 - x + x * y) + square(2.25 - x + x * y * y) + square(2.625 - x + x * y * y * y)

  clearLines = (scene) ->
    for line in lines
      scene.removeObjectFromScene line
      lines = []
  addLine = (scene, point1, point2, color, color2) ->
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

  c3dl.addMainCallBack traveller_main, "traveller_canvas"
).call this

