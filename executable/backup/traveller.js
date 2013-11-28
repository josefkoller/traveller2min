(function() {
  var PHOTON_COUNT, addLine, addVectors, ai, clear_photon_lines, dotVectors, draw_start_end_line, fire, launch_photon, photon_end_point, photon_index, photon_lines, power, random, renderPhotonsTravell, scaleVector, scene, traveller, traveller_main, wait_and_fire;
  var drawF1;
  var z_scaling = 1;
  var lines = [];

  ai = 0;

  photon_index = 0;

  PHOTON_COUNT = 1e6;

  photon_lines = [];

  photon_end_point = null;

  scene = null;

  traveller = null;

  traveller_main = function(canvas_name) {
    var add_axis, axis_length, camera, camera_light, canvas, configure_camera, create_collada, create_light, renderer, vector_on_axis;

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
    create_collada = function(scene, filename, scaling, position, diffuse_color) {
      var collada, material;

      collada = new c3dl.Collada();
      collada.init(filename);
      collada.scale([scaling, scaling, scaling]);
      collada.translate(position);
      material = new c3dl.Material();
      material.setDiffuse(diffuse_color);
      collada.setMaterial(material);
      scene.addObjectToScene(collada);
      return {
        collada: collada,
        move: function(position) {
          return collada.setPosition(position);
        }
      };
    };
    vector_on_axis = function(axis, length) {
      length = length || 1;
      if (axis === 'x') {
        return [length, 0, 0];
      }
      if (axis === 'y') {
        return [0, length, 0];
      }
      if (axis === 'z') {
        return [0, 0, length];
      }
    };
    add_axis = function(scene, axis, axis_length) {
      var color, second_line_point;

      color = vector_on_axis(axis);
      second_line_point = vector_on_axis(axis, axis_length);
      return addLine(scene, [0, 0, 0], second_line_point, color);
    };
    axis_length = 2;
    add_axis(scene, 'x', axis_length);
    add_axis(scene, 'y', axis_length);
    add_axis(scene, 'z', axis_length);
    camera = new c3dl.FreeCamera();
    scene.setCamera(camera);
    configure_camera = function(camera, axis) {
      if (axis === 'x') {
        camera.setPosition([-1, 0, 0]);
        return camera.setLookAtPoint([0, 0, 0]);
      }
      if (axis === 'y') {
        camera.setPosition([-0.3, 0.1, -0.3]);
      }
      if (axis === 'z') {
        camera.setPosition([0, 0, -1]);
        return camera.setLookAtPoint([0, 0, 0]);
      }

      rotation_speed = Math.PI/16;
      if (axis === 'a') {
        camera.yaw(rotation_speed);
        return;
      }
      if (axis === 'd') {
        camera.yaw(-rotation_speed);
        return;
      }
      if (axis === 'u') {
        z_scaling = z_scaling * 2;
        drawF1(scene);
        return;
      }
      if (axis === 'i') {
        z_scaling = z_scaling * 0.5;
        drawF1(scene);
        return;
      }
      
      // moving straight ahead or back...
      var position = camera.getPosition();
      var direction = camera.getDir();
      var velocity = 0.5;
      if (axis === 's') 
        velocity = velocity * -1;
      
      var new_position = [
          position[0] + direction[0] * velocity,
          position[1] + direction[1] * velocity,
          position[2] + direction[2] * velocity];
      camera.setPosition(new_position);
      camera.setLookAtPoint([0, 0, 0]);
    };
    configure_camera(camera, 'z');
    scene.setKeyboardCallback(function(event) {
      var key_mapping;

      key_mapping = {
        88: 'x',
        89: 'y',
        90: 'z',
        87: 'w',
        83: 's',
        65: 'a',
        68: 'd',
        85: 'u',
        73: 'i'
      };
      configure_camera(scene.getCamera(), key_mapping[event.keyCode]);

      p = camera.getPosition();
      d = camera.getDir();
      text = "pos: ("+p[0]+","+p[1]+","+p[2]+"); " +
       "dir:  ("+d[0]+","+d[1]+","+d[2]+")";
      $('#traveller_display').html(text);

      return false;
    });
    camera.setPosition([10, 3, -8]);
    camera.setLookAtPoint([0, 0, 0]);
    create_light = function(scene, diffuse_color) {
      var light;

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

        p = [position[0].toFixed(2), position[1].toFixed(2), position[2].toFixed(2)];
        text = "" + photon_index + ": x=" + p[0] + ",y=" + p[1] + ",z=" + p[2];
        return $('#traveller_display').html(text);
      }
    };
    scene.startScene();
    //return launch_photon(scene);


    drawF1(scene);
  };
  drawF1 = function(scene) {
    //clear
    for(var i = 0; i < lines.length; i=i+1) {
        scene.removeObjectFromScene(lines[i]);
        lines = [];
    }

    /*
    // axis
    var axis_length = 5;    
    add_axis(scene, 'x', axis_length);
    add_axis(scene, 'y', axis_length);
    add_axis(scene, 'z', axis_length);
    */

    // background function....
    color1 = [1, 0, 0];
    color2 = [0, 0, 1];
    h = 4.5;
    s = 0.5;
    for(y=-h; y <= h; y=y+s) {
      for(x=-h;  x<= h; x=x+s) {
         z = power(1.5 - x + x*y,2) +
            power(2.25 - x + x*y*y,2) +
            power(2.625 - x + x*y*y*y,2);
         z = z / 100000 * z_scaling;
         point1 = [x,0,y];
         point2 = [x,z,y];
         addLine(scene, point1, point2, color1, color2);
      }
    }
  };
  launch_photon = function(scene) {
    if (++photon_index > PHOTON_COUNT) {
      return;
    }
    renderPhotonsTravell(scene);
    return wait_and_fire(scene);
  };

  wait_and_fire = function() {
    return setTimeout(fire, 1);
  };

  fire = function() {
    draw_start_end_line();
    clear_photon_lines();
    return launch_photon(scene);
  };

  clear_photon_lines = function() {
    return photon_end_point = null;
  };

  draw_start_end_line = function() {
    var color1, color2, coords1, point1, point2;

    coords1 = photon_end_point;
    point1 = [coords1[0], coords1[1], coords1[2]];
    point2 = [0, 0, 0];
    color1 = [1, 0, 0];
    color2 = [1, 0, 1];
    return addLine(scene, point1, point2, color1, color2);
  };

  addLine = function(scene, point1, point2, color, color2) {
    var line;

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

  scaleVector = function(vector, factor) {
    return [vector[0] * factor, vector[1] * factor, vector[2] * factor];
  };

  addVectors = function(vector1, vector2) {
    return [vector1[0] + vector2[0], vector1[1] + vector2[1], vector1[2] + vector2[2]];
  };

  dotVectors = function(vector1, vector2) {
    return vector1[0] * vector2[0] + vector1[1] * vector2[1] + vector1[2] * vector2[2];
  };

  power = function(base, exponent) {
    var i, result, _i;

    result = 1;
    for (i = _i = 1; 1 <= exponent ? _i <= exponent : _i >= exponent; i = 1 <= exponent ? ++_i : --_i) {
      result *= base;
    }
    return result;
  };

  random = function() {
    return Math.random();
  };

  renderPhotonsTravell = function(scene) {
    var PHOTON_WEIGHT_INCREASE_PROBALITY, PHOTON_WEIGHT_THRESHOLD, albedo, cos_psi, cos_theta, dr, g, g2, line_color, mu_a, mu_s, n, new_photon_direction, new_photon_position, photon_direction, photon_position, photon_state, photon_velocity, photon_weight, probality_absorbed, psi, radial_beam_size, sin_psi, sin_theta, step, step_count, travell_length, z_size, _results;

    mu_a = 1;
    mu_s = 300;
    g = 0.9;
    g2 = g * g;
    n = 1.33;
    photon_state = 'alive';
    photon_weight = 1.0;
    photon_position = [0, 0, 0];
    photon_direction = [1, 0, 0];
    photon_velocity = 800;
    step_count = 2000;
    radial_beam_size = 2;
    dr = radial_beam_size / step_count;
    albedo = mu_s / (mu_s + mu_a);
    step = 0;
    _results = [];
    while (photon_state === 'alive' && (step++) < step_count) {
      cos_theta = 2 * random() - 1;
      sin_theta = Math.sqrt(1 - power(cos_theta, 2));
      psi = 2 * Math.PI * random();
      photon_direction = [sin_theta * Math.cos(psi), sin_theta * Math.sin(psi), cos_theta];
      travell_length = -Math.log(random()) / (mu_a + mu_s);
      new_photon_position = addVectors(photon_position, scaleVector(photon_direction, travell_length));
      line_color = [photon_weight, 1, 1];
      photon_end_point = new_photon_position;
      traveller.display(new_photon_position);
      photon_position = new_photon_position;
      probality_absorbed = photon_weight * (1 - albedo);
      photon_weight -= probality_absorbed;
      if (g === 0) {
        cos_theta = 2 * random() - 1;
      } else {
        cos_theta = (1 + g2 - power((1 - g2) / (1 - g + 2 * g * random()), 2)) / (2 * g);
      }
      sin_theta = Math.sqrt(1 - power(cos_theta, 2));
      psi = 2 * Math.PI * random();
      cos_psi = Math.cos(psi);
      if (psi < Math.PI) {
        sin_psi = Math.sqrt(1 - power(cos_psi, 2));
      } else {
        sin_psi = -Math.sqrt(1 - power(cos_psi, 2));
      }
      z_size = Math.sqrt(1 - power(photon_direction[2], 2));
      new_photon_direction = [sin_theta * (photon_direction[0] * photon_direction[2] + cos_psi - photon_direction[1] * sin_psi) / z_size + photon_direction[0] * cos_theta, sin_theta * (photon_direction[1] * photon_direction[2] + cos_psi - photon_direction[0] * sin_psi) / z_size + photon_direction[1] * cos_theta, -sin_theta * cos_psi * z_size + photon_direction[2] * cos_theta];
      photon_direction = new_photon_direction;
      PHOTON_WEIGHT_THRESHOLD = 0.01;
      PHOTON_WEIGHT_INCREASE_PROBALITY = 0.1;
      if (photon_weight < PHOTON_WEIGHT_THRESHOLD) {
        if (random() <= PHOTON_WEIGHT_INCREASE_PROBALITY) {
          _results.push(photon_weight /= PHOTON_WEIGHT_INCREASE_PROBALITY);
        } else {
          _results.push(photon_state = 'dead');
        }
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  c3dl.addMainCallBack(traveller_main, "traveller_canvas");

}).call(this);
