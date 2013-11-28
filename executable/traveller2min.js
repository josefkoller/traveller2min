(function() {
  (function() {
    var addLine, addVectors, add_axis, axis_length, drawF1, lines, scene, square, traveller_main, vector_on_axis, z_scaling;
    addLine = void 0;
    addVectors = void 0;
    square = void 0;
    traveller_main = void 0;
    scene = void 0;
    drawF1 = void 0;
    z_scaling = 1;
    lines = [];
    axis_length = void 0;
    add_axis = void 0;
    vector_on_axis = void 0;
    traveller_main = function(canvas_name) {
      var camera, camera_light, canvas, configure_camera, create_collada, create_light, generation, options, renderer, traveller;
      camera = void 0;
      camera_light = void 0;
      canvas = void 0;
      configure_camera = void 0;
      create_collada = void 0;
      create_light = void 0;
      renderer = void 0;
      canvas = document.getElementById(canvas_name);
      scene = new c3dl.Scene();
      scene.setCanvasTag(canvas_name);
      renderer = new c3dl.WebGL();
      renderer.createRenderer(canvas);
      renderer.setLighting(true);
      scene.setAmbientLight([0, 0, 0, 0]);
      scene.setBackgroundColor([0.0, 0.0, 0.0]);
      scene.setRenderer(renderer);
      scene.init(canvas_name);
      if (!renderer.isReady()) {
        return;
      }
      vector_on_axis = function(axis, length) {
        length = length || 1;
        if (axis === "x") {
          return [length, 0, 0];
        }
        if (axis === "y") {
          return [0, length, 0];
        }
        if (axis === "z") {
          return [0, 0, length];
        }
      };
      add_axis = function(scene, axis, axis_length) {
        var color, second_line_point;
        color = void 0;
        second_line_point = void 0;
        color = vector_on_axis(axis);
        second_line_point = vector_on_axis(axis, axis_length);
        return addLine(scene, [0, 0, 0], second_line_point, color);
      };
      axis_length = 2;
      add_axis(scene, "x", axis_length);
      add_axis(scene, "y", axis_length);
      add_axis(scene, "z", axis_length);
      camera = new c3dl.FreeCamera();
      scene.setCamera(camera);
      configure_camera = function(camera, axis) {
        var direction, new_position, position, rotation_speed, velocity;
        if (axis === "x") {
          camera.setPosition([-1, 0, 0]);
          return camera.setLookAtPoint([0, 0, 0]);
        }
        if (axis === "y") {
          camera.setPosition([-0.3, 0.1, -0.3]);
        }
        if (axis === "z") {
          camera.setPosition([0, 0, -1]);
          return camera.setLookAtPoint([0, 0, 0]);
        }
        rotation_speed = Math.PI / 16;
        if (axis === "a") {
          camera.yaw(rotation_speed);
          return;
        }
        if (axis === "d") {
          camera.yaw(-rotation_speed);
          return;
        }
        if (axis === "u") {
          z_scaling = z_scaling * 2;
          drawF1(scene);
          return;
        }
        if (axis === "i") {
          z_scaling = z_scaling * 0.5;
          drawF1(scene);
          return;
        }
        position = camera.getPosition();
        direction = camera.getDir();
        velocity = 0.5;
        if (axis === "s") {
          velocity = velocity * -1;
        }
        new_position = [position[0] + direction[0] * velocity, position[1] + direction[1] * velocity, position[2] + direction[2] * velocity];
        camera.setPosition(new_position);
        return camera.setLookAtPoint([0, 0, 0]);
      };
      configure_camera(camera, "z");
      scene.setKeyboardCallback(function(event) {
        var d, key_mapping, p, text;
        key_mapping = void 0;
        key_mapping = {
          88: "x",
          89: "y",
          90: "z",
          87: "w",
          83: "s",
          65: "a",
          68: "d",
          85: "u",
          73: "i"
        };
        configure_camera(scene.getCamera(), key_mapping[event.keyCode]);
        p = camera.getPosition();
        d = camera.getDir();
        text = "pos: (" + p[0] + "," + p[1] + "," + p[2] + "); " + "dir:  (" + d[0] + "," + d[1] + "," + d[2] + ")";
        $("#traveller_display").html(text);
        return false;
      });
      camera.setPosition([10, 3, -8]);
      camera.setLookAtPoint([0, 0, 0]);
      create_light = function(scene, diffuse_color) {
        var light;
        light = void 0;
        light = new c3dl.PositionalLight();
        light.setDiffuse(diffuse_color);
        light.setOn(true);
        scene.addLight(light);
        return {
          light: light,
          move: function(position) {
            return this.light.setPosition(position);
          }
        };
      };
      camera_light = create_light(scene, [1, 2, 3]);
      traveller = {
        light: camera_light,
        move: function(position) {
          this.geometry.move(position);
          return this.light.move(position);
        },
        display: function(position) {
          var p, text;
          p = void 0;
          text = void 0;
          p = [position[0].toFixed(2), position[1].toFixed(2), position[2].toFixed(2)];
          text = "" + photon_index + ": x=" + p[0] + ",y=" + p[1] + ",z=" + p[2];
          return $("#traveller_display").html(text);
        }
      };
      scene.startScene();
      drawF1(scene);
      generation = [];
      options = {};
      return options.color;
    };
    drawF1 = function(scene) {
      var color1, color2, h, i, point1, point2, s, x, y, z, _results;
      i = 0;
      while (i < lines.length) {
        scene.removeObjectFromScene(lines[i]);
        i = i + 1;
      }
      lines = [];
      add_axis(scene, "x", axis_length);
      add_axis(scene, "y", axis_length * z_scaling);
      add_axis(scene, "z", axis_length);
      color1 = [1, 0, 0];
      color2 = [0, 0, 1];
      h = 4.5;
      s = 0.5;
      y = -h;
      _results = [];
      while (y <= h) {
        x = -h;
        while (x <= h) {
          z = square(1.5 - x + x * y) + square(2.25 - x + x * y * y) + square(2.625 - x + x * y * y * y);
          z = z / 100000 * z_scaling;
          point1 = [x, 0, y];
          point2 = [x, z, y];
          addLine(scene, point1, point2, color1, color2);
          x = x + s;
        }
        _results.push(y = y + s);
      }
      return _results;
    };
    addLine = function(scene, point1, point2, color, color2) {
      var line;
      line = void 0;
      if (!color2) {
        color2 = color;
      }
      line = new c3dl.Line();
      line.setCoordinates(point1, point2);
      line.setColors(color, color2);
      line.setWidth(4);
      lines.push(line);
      scene.addObjectToScene(line);
      return line;
    };
    square = function(x) {
      return x * x;
    };
    return c3dl.addMainCallBack(traveller_main, "traveller_canvas");
  }).call(this);

}).call(this);
