(function() {
  var DISPLAY_ITERATION_INFO, ITERATION_SLEEP, Particle, ParticleStorage, SHOW_DEATH_PARTICLE, differential_evolution, i, parameter1, parameter10, parameter11, parameter12, parameter2, parameter3, parameter4, parameter5, parameter6, parameter7, parameter8, parameter9, search_space11, search_space12, square, _i,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  ITERATION_SLEEP = 1 / 40 * 1000;

  DISPLAY_ITERATION_INFO = true;

  SHOW_DEATH_PARTICLE = false;

  Particle = (function() {
    function Particle(parameter_value, objective_value) {
      this.parameter_value = parameter_value;
      this.objective_value = objective_value;
    }

    return Particle;

  })();

  ParticleStorage = (function() {
    function ParticleStorage(parameter) {
      this.parameter = parameter;
    }

    ParticleStorage.prototype.shuffle = function() {
      var shuffling_i, _results;
      this.particles = new Array();
      this.current_best_particle = null;
      shuffling_i = 0;
      _results = [];
      while (shuffling_i < this.parameter.number_of_particles) {
        this.add_random_particle();
        _results.push(shuffling_i++);
      }
      return _results;
    };

    ParticleStorage.prototype.check_best_particle = function(new_particle) {
      if ((this.current_best_particle != null) && this.current_best_particle.objective_value < new_particle.objective_value) {
        return;
      }
      this.parameter.on_best_particle_changes(new_particle);
      return this.current_best_particle = new_particle;
    };

    ParticleStorage.prototype.add = function(parameter_value, objective_value) {
      var particle;
      particle = new Particle(parameter_value, objective_value);
      this.particles.push(particle);
      this.parameter.on_particle_creation(particle);
      return this.check_best_particle(particle);
    };

    ParticleStorage.prototype.check_parameter_value_in_search_space = function(parameter_value) {
      var dimension_value, parameter_i, search_space;
      parameter_i = 0;
      while (parameter_i < parameter_value.length) {
        dimension_value = parameter_value[parameter_i];
        search_space = this.parameter.search_space[parameter_i];
        if (dimension_value < search_space.min || dimension_value > search_space.max) {
          return this.create_random_parameter_value();
        }
        parameter_i++;
      }
      return parameter_value;
    };

    ParticleStorage.prototype.create_random_parameter_value = function() {
      var parameter_value, parameter_value_xi, ri, search_space, width;
      parameter_value = new Array();
      ri = 0;
      while (ri < this.parameter.number_of_dimensions) {
        search_space = this.parameter.search_space[ri];
        width = search_space.max - search_space.min;
        parameter_value_xi = search_space.min + width * Math.random();
        parameter_value.push(parameter_value_xi);
        ri++;
      }
      return parameter_value;
    };

    ParticleStorage.prototype.add_random_particle = function() {
      var objective_value, parameter_value;
      parameter_value = this.create_random_parameter_value();
      objective_value = this.parameter.objective(parameter_value);
      return this.add(parameter_value, objective_value);
    };

    ParticleStorage.prototype.pick_random_particle = function() {
      var index;
      index = Math.round(Math.random() * (this.particles.length - 1));
      return this.particles[index];
    };

    return ParticleStorage;

  })();

  differential_evolution = (function() {
    function differential_evolution(parameter) {
      this.termination = __bind(this.termination, this);
      this.selection = __bind(this.selection, this);
      this.recombination = __bind(this.recombination, this);
      this.mutation = __bind(this.mutation, this);
      this.initialize = __bind(this.initialize, this);
      this.run = __bind(this.run, this);
      this.parameter = parameter || {};
      this.parameter.objective = parameter.objective || objective1;
      this.parameter.search_space = parameter.search_space || [
        {
          min: -1,
          max: 1
        }
      ];
      this.parameter.number_of_dimensions = parameter.number_of_dimensions || 1;
      this.parameter.number_of_particles = parameter.number_of_particles || 100;
      this.parameter.number_of_iterations = parameter.number_of_iterations || 10;
      this.parameter.mutation_factor1 = parameter.mutation_factor1 || 0.7;
      this.parameter.mutation_factor2 = parameter.mutation_factor2 || 0.9;
      this.parameter.cross_over_ratio = parameter.cross_over_ratio || 0.8;
    }

    differential_evolution.prototype.run = function() {
      $('#termination_display').html("running...");
      this.initialize();
      return this.iteration();
    };

    differential_evolution.prototype.iteration = function() {
      var that;
      if (DISPLAY_ITERATION_INFO) {
        $('#iteration_display').html("<br/>iteration: " + this.current_iteration + "/" + this.parameter.number_of_iterations);
      }
      this.mutation();
      this.recombination();
      this.selection();
      that = this;
      if (this.start_iteration()) {
        return window.setTimeout((function() {
          return that.iteration();
        }), ITERATION_SLEEP);
      } else {
        return this.termination();
      }
    };

    differential_evolution.prototype.initialize = function() {
      this.particles = new ParticleStorage(this.parameter);
      this.particles.shuffle();
      return this.current_iteration = 0;
    };

    differential_evolution.prototype.start_iteration = function() {
      if (this.current_iteration === this.parameter.number_of_iterations) {
        return false;
      }
      this.iteration_progress = this.current_iteration / this.parameter.number_of_iterations;
      this.current_iteration++;
      return true;
    };

    differential_evolution.prototype.mutation = function() {
      var best, child_objective_value, child_parameter_value, particle, particle_mutation, random1, random2, _i, _len, _ref, _results;
      particle_mutation = function(parameter, current, random1, random2, best) {
        var child, child_xi, xi;
        child = new Array();
        xi = 0;
        while (xi < parameter.number_of_dimensions) {
          child_xi = current[xi] + parameter.mutation_factor1 * (random2[xi] - random1[xi]) + parameter.mutation_factor2 * (best[xi] - current[xi]);
          child.push(child_xi);
          xi++;
        }
        return child;
      };
      _ref = this.particles.particles;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        particle = _ref[_i];
        random1 = this.particles.pick_random_particle();
        random2 = this.particles.pick_random_particle();
        best = this.particles.current_best_particle;
        child_parameter_value = particle_mutation(this.parameter, particle.parameter_value, random1.parameter_value, random2.parameter_value, best.parameter_value);
        child_parameter_value = this.particles.check_parameter_value_in_search_space(child_parameter_value);
        child_objective_value = this.parameter.objective(child_parameter_value);
        _results.push(particle.child = new Particle(child_parameter_value, child_objective_value));
      }
      return _results;
    };

    differential_evolution.prototype.recombination = function() {
      var particle, _i, _len, _ref, _results;
      _ref = this.particles.particles;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        particle = _ref[_i];
        _results.push(particle.cross_over = Math.random() < this.parameter.cross_over_ratio);
      }
      return _results;
    };

    differential_evolution.prototype.selection = function() {
      var child_wins, particle, _i, _len, _ref;
      child_wins = 0;
      _ref = this.particles.particles;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        particle = _ref[_i];
        if (particle.cross_over && particle.child.dominates(particle)) {
          child_wins++;
          this.parameter.on_particle_death(particle, this.iteration_progress);
          particle.parameter_value = particle.child.parameter_value;
          particle.objective_value = particle.child.objective_value;
          this.parameter.on_particle_creation(particle);
          this.particles.check_best_particle(particle);
        }
      }
      if (DISPLAY_ITERATION_INFO) {
        return $('#iteration_display').append("<br/>" + child_wins + "/" + this.particles.particles.length + " wins");
      }
    };

    differential_evolution.prototype.termination = function() {
      var best, text;
      best = this.particles.current_best_particle;
      text = "FINISHED!<br/>Best particle at termination:<br/>" + best.to_string();
      return $("#termination_display").html(text);
    };

    return differential_evolution;

  })();

  Particle.prototype.dominates = function(other) {
    return this.objective_value < other.objective_value;
  };

  Particle.prototype.to_string = function() {
    var dimension_value, display_float, objective_value, parameter_value, _i, _len, _ref;
    display_float = function(float) {
      if (float < 0.0000001) {
        0;
      }
      return float;
    };
    parameter_value = "(";
    _ref = this.parameter_value;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      dimension_value = _ref[_i];
      parameter_value += display_float(dimension_value) + ", ";
    }
    parameter_value += ")";
    objective_value = display_float(this.objective_value);
    return "parameter value: " + parameter_value + "<br/>objective value: " + objective_value;
  };

  square = function(x) {
    return x * x;
  };

  parameter1 = {};

  parameter1.objective_name = 'beales';

  parameter1.objective = function(X) {
    var x, y;
    x = X[0];
    y = X[1];
    return square(1.5 - x + x * y) + square(2.25 - x + x * y * y) + square(2.625 - x + x * y * y * y);
  };

  parameter1.search_space = [
    {
      min: -4.5,
      max: 4.5
    }, {
      min: -4.5,
      max: 4.5
    }
  ];

  parameter1.number_of_dimensions = 2;

  parameter1.number_of_particles = 64;

  parameter1.number_of_iterations = 30;

  parameter2 = {};

  parameter2.objective_name = 'rosenbrock';

  parameter2.objective = function(X) {
    var x, y;
    x = X[0];
    y = X[1];
    return 100 * square(y - x * x) + square(y - 1);
  };

  parameter2.search_space = [
    {
      min: -0.5,
      max: 3
    }, {
      min: -1.5,
      max: 2.0
    }
  ];

  parameter2.number_of_dimensions = 2;

  parameter2.number_of_particles = 64;

  parameter2.number_of_iterations = 50;

  parameter3 = {};

  parameter3.objective_name = 'goldstein-price';

  parameter3.objective = function(X) {
    var x, y;
    x = X[0];
    y = X[1];
    return (1 + square(x + y + 1) * (19 - 14 * x + 3 * x * x - 14 * y + 6 * x * y + 3 * y * y)) * (30 + square(2 * x - 3 * y) * (18 - 32 * x + 12 * x * x + 48 * y - 36 * x * y + 27 * y * y));
  };

  parameter3.search_space = [
    {
      min: -1.5,
      max: 1.5
    }, {
      min: -1.5,
      max: 1.5
    }
  ];

  parameter3.number_of_dimensions = 2;

  parameter3.number_of_particles = 64;

  parameter3.number_of_iterations = 200;

  parameter4 = {};

  parameter4.objective_name = 'bukin function n. 6';

  parameter4.objective = function(X) {
    var x, y;
    x = X[0];
    y = X[1];
    return 100 * Math.sqrt(Math.abs(y - 0.01 * x * x)) + 0.01 * Math.abs(x + 10);
  };

  parameter4.search_space = [
    {
      min: -15,
      max: -5
    }, {
      min: -3,
      max: 3
    }
  ];

  parameter4.number_of_dimensions = 2;

  parameter4.number_of_particles = 256;

  parameter4.number_of_iterations = 1000;

  parameter5 = {};

  parameter5.objective_name = 'ackleys';

  parameter5.objective = function(X) {
    var x, y;
    x = X[0];
    y = X[1];
    return -20 * Math.exp(-0.2 * Math.sqrt(0.5 * (x * x + y * y))) - Math.exp(0.5 * (Math.cos(2 * Math.PI * x) + Math.cos(2 * Math.PI * y))) + 20 + Math.exp(1);
  };

  parameter5.search_space = [
    {
      min: -5,
      max: 5
    }, {
      min: -5,
      max: 5
    }
  ];

  parameter5.number_of_dimensions = 2;

  parameter5.number_of_particles = 64;

  parameter5.number_of_iterations = 200;

  parameter6 = {};

  parameter6.objective_name = 'matyas';

  parameter6.objective = function(X) {
    var x, y;
    x = X[0];
    y = X[1];
    return 0.26 * (x * x + y * y) - 0.48 * x * y;
  };

  parameter6.search_space = [
    {
      min: -10,
      max: 10
    }, {
      min: -10,
      max: 10
    }
  ];

  parameter6.number_of_dimensions = 2;

  parameter6.number_of_particles = 64;

  parameter6.number_of_iterations = 200;

  parameter7 = {};

  parameter7.objective_name = 'hoelder table';

  parameter7.objective = function(X) {
    var x, y;
    x = X[0];
    y = X[1];
    return -Math.abs(Math.sin(x) * Math.cos(y) * Math.exp(Math.abs(1 - (Math.sqrt(x * x + y * y) / Math.PI))));
  };

  parameter7.search_space = [
    {
      min: -10,
      max: 10
    }, {
      min: -10,
      max: 10
    }
  ];

  parameter7.number_of_dimensions = 2;

  parameter7.number_of_particles = 64;

  parameter7.number_of_iterations = 400;

  parameter8 = {};

  parameter8.objective_name = 'schaffer function n.3';

  parameter8.objective = function(X) {
    var x, y;
    x = X[0];
    y = X[1];
    return 0.5 + (square(Math.sin(x * x - y * y)) - 0.5) / square(1 + 0.001 * (x * x + y * y));
  };

  parameter8.search_space = [
    {
      min: -100,
      max: 100
    }, {
      min: -100,
      max: 100
    }
  ];

  parameter8.number_of_dimensions = 2;

  parameter8.number_of_particles = 64;

  parameter8.number_of_iterations = 800;

  parameter9 = {};

  parameter9.objective_name = 'styblinski-tang';

  parameter9.objective = function(X) {
    var x, z, _i, _len;
    z = 0;
    for (_i = 0, _len = X.length; _i < _len; _i++) {
      x = X[_i];
      z += x * x * x * x - 16 * x * x + 5 * x;
    }
    return z * 0.5;
  };

  parameter9.search_space = [];

  for (i = _i = 1; _i <= 20; i = ++_i) {
    parameter9.search_space.push({
      min: -5,
      max: 5
    });
  }

  parameter9.number_of_dimensions = parameter9.search_space.length;

  parameter9.number_of_particles = 2000;

  parameter9.number_of_iterations = 200;

  parameter10 = {};

  parameter10.objective_name = 'six-hump camel back';

  parameter10.objective = function(X) {
    var x, x2, x4, y, y2;
    x = X[0];
    y = X[1];
    x2 = x * x;
    x4 = x2 * x2;
    y2 = y * y;
    return (4 - 2.1 * x2 + x4 / 3) * x2 + x * y + (-4 + 4 * y2) * y2;
  };

  parameter10.search_space = [
    {
      min: -3,
      max: 3
    }, {
      min: -3,
      max: 3
    }
  ];

  parameter10.number_of_dimensions = 2;

  parameter10.number_of_particles = 64;

  parameter10.number_of_iterations = 100;

  parameter11 = {};

  parameter11.objective_name = 'drop wave';

  parameter11.objective = function(X) {
    var gsum, x;
    x = X[0];
    gsum = x * x;
    return -(1 + Math.cos(12 * Math.sqrt(gsum))) / (0.5 * gsum + 2);
  };

  search_space11 = {
    min: -Math.PI * 2,
    max: Math.PI * 2
  };

  parameter11.search_space = [search_space11, search_space11];

  parameter11.number_of_dimensions = 1;

  parameter11.number_of_particles = 100;

  parameter11.number_of_iterations = 100;

  parameter12 = {};

  parameter12.objective_name = "random shekel's foxholes";

  parameter12.objective = function(X) {
    var a, c, m, x, z, _j, _k, _len;
    z = 0;
    m = 30;
    for (_j = 0, _len = X.length; _j < _len; _j++) {
      x = X[_j];
      c = Math.random();
      for (i = _k = 1; 1 <= m ? _k < m : _k > m; i = 1 <= m ? ++_k : --_k) {
        a = Math.random();
        z += 1 / (square(x - a) + c);
      }
    }
    return -z;
  };

  search_space12 = {
    min: 0,
    max: 1
  };

  parameter12.search_space = [search_space12, search_space12];

  parameter12.number_of_dimensions = 2;

  parameter12.number_of_particles = 128;

  parameter12.number_of_iterations = 300;

  (function() {
    return (function() {
      var addLine, addVectors, add_axis, add_particle_line, axis_length, best_color1, best_color2, best_marker, best_particle_changes, best_width, clear_lines, death_color1, death_color2, death_width, drawMeshgrid, generation_color1, generation_color2, generation_width, kill_particle_line, lines, on_scene_object_picking, parameter, run_evolution, scale_line, scale_lines, scene, traveller_main, vector_on_axis, z_scaling;
      addLine = void 0;
      addVectors = void 0;
      add_axis = void 0;
      clear_lines = void 0;
      best_marker = void 0;
      scale_lines = void 0;
      parameter = void 0;
      drawMeshgrid = void 0;
      scene = void 0;
      vector_on_axis = void 0;
      z_scaling = 1;
      lines = [];
      axis_length = void 0;
      traveller_main = function(canvas_name) {
        var camera, camera_light, canvas, configure_camera, create_collada, create_light, generation, options, renderer, traveller;
        camera = void 0;
        camera_light = void 0;
        canvas = void 0;
        configure_camera = void 0;
        create_collada = void 0;
        create_light = void 0;
        generation = void 0;
        options = void 0;
        renderer = void 0;
        traveller = void 0;
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
          var direction, factor, marker_coordinates, min, new_position, position, rotation_speed, velocity;
          direction = void 0;
          new_position = void 0;
          position = void 0;
          rotation_speed = void 0;
          velocity = void 0;
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
            factor = 2;
            z_scaling = z_scaling * factor;
            scale_lines(factor);
            return;
          }
          if (axis === "i") {
            factor = 0.5;
            z_scaling = z_scaling * factor;
            scale_lines(factor);
            return;
          }
          if (axis === "r") {
            run_evolution(scene);
            return;
          }
          if (axis === 'm') {
            if (!best_marker) {
              return;
            }
            marker_coordinates = best_marker.getCoordinates();
            min = [marker_coordinates[0], marker_coordinates[1], marker_coordinates[2]];
            camera.setLookAtPoint(min);
            return;
          }
          position = camera.getPosition();
          direction = camera.getDir();
          velocity = 0.5;
          if (axis === "s") {
            velocity = velocity * -1;
          }
          new_position = [position[0] + direction[0] * velocity, position[1] + direction[1] * velocity, position[2] + direction[2] * velocity];
          return camera.setPosition(new_position);
        };
        configure_camera(camera, "z");
        scene.setKeyboardCallback(function(event) {
          var d, float_presenter, key_mapping, p, text, vector_presenter;
          d = void 0;
          key_mapping = void 0;
          p = void 0;
          text = void 0;
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
            73: "i",
            82: 'r',
            77: 'm'
          };
          configure_camera(scene.getCamera(), key_mapping[event.keyCode]);
          float_presenter = function(float) {
            return float.toFixed(3);
          };
          vector_presenter = function(vector) {
            return "" + (float_presenter(vector[0])) + "|" + (float_presenter(vector[1])) + "|" + (float_presenter(vector[2]));
          };
          text = "position: " + (vector_presenter(camera.getPosition())) + "<br/> direction: " + (vector_presenter(camera.getDir()));
          $("#camera_display").html(text);
          return false;
        });
        camera.setPosition([10, 3, -8]);
        camera.setLookAtPoint([0, 0, 0]);
        scene.startScene();
        scene.setPickingCallback(on_scene_object_picking);
        return scene.setPickingPrecision(c3dl.PICK_PRECISION_BOUNDING_VOLUME);
      };
      on_scene_object_picking = function(picking_result) {
        var coordinates, picked_object, picked_objects, used_button, _j, _len, _results;
        picked_objects = picking_result.getObjects();
        used_button = picking_result.getButtonUsed();
        _results = [];
        for (_j = 0, _len = picked_objects.length; _j < _len; _j++) {
          picked_object = picked_objects[_j];
          if (used_button === 1) {
            coordinates = picked_object.getCoordinates();
            if (coordinates) {
              _results.push(alert(coordinates[1]));
            } else {
              _results.push(void 0);
            }
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };
      drawMeshgrid = function(scene) {
        var X, color1, color2, h, min, point1, point2, s, search_space2, x, xh, xmax, xmin, xs, y, yh, ymax, ymin, ys, z;
        color1 = void 0;
        color2 = void 0;
        h = void 0;
        i = void 0;
        point1 = void 0;
        point2 = void 0;
        s = void 0;
        x = void 0;
        y = void 0;
        z = void 0;
        clear_lines(scene);
        lines = [];
        add_axis(scene, "x", axis_length);
        add_axis(scene, "y", axis_length * z_scaling);
        add_axis(scene, "z", axis_length);
        color1 = [1, 0, 0];
        color2 = [0, 0, 1];
        xmin = parameter.search_space[0].min;
        xmax = parameter.search_space[0].max;
        search_space2 = parameter.search_space[1] || {
          min: 0,
          max: 0
        };
        ymin = search_space2.min;
        ymax = search_space2.max;
        xh = xmax - xmin;
        yh = ymax - ymin;
        s = 20;
        xs = (xmax - xmin) / s;
        ys = 1;
        if (ymax > ymin) {
          ys = (ymax - ymin) / s;
        }
        y = ymin;
        min = {};
        min.z = void 0;
        while (y <= ymax) {
          x = xmin;
          while (x <= xmax) {
            X = [x, y];
            z = parameter.objective(X);
            z = z / 100000 * z_scaling;
            if (min.z === void 0 || z < min.z) {
              min.x = x;
              min.y = y;
              min.z = z;
            }
            point1 = [x, 0, y];
            point2 = [x, z, y];
            addLine(scene, point1, point2, color1, color2);
            x = x + xs;
          }
          y = y + ys;
        }
        return $("#meshgrid_display").html("min by meshgrid: " + min.x + "|" + min.z + "|" + min.y);
      };
      clear_lines = function(scene) {
        var line, _j, _len, _results;
        _results = [];
        for (_j = 0, _len = lines.length; _j < _len; _j++) {
          line = lines[_j];
          _results.push(scene.removeObjectFromScene(line));
        }
        return _results;
      };
      scale_lines = function(factor) {
        var line, _j, _len, _results;
        _results = [];
        for (_j = 0, _len = lines.length; _j < _len; _j++) {
          line = lines[_j];
          _results.push(scale_line(line, factor));
        }
        return _results;
      };
      scale_line = function(line, factor) {
        var coordinates, point1, point2, z;
        coordinates = line.getCoordinates();
        z = coordinates[4];
        z *= factor;
        point1 = [coordinates[0], coordinates[1], coordinates[2]];
        point2 = [coordinates[3], z, coordinates[5]];
        return line.setCoordinates(point1, point2);
      };
      addLine = function(scene, point1, point2, color, color2, width) {
        var line;
        if (!color2) {
          color2 = color;
        }
        line = new c3dl.Line();
        line.setCoordinates(point1, point2);
        line.setColors(color, color2);
        line.setWidth(width || 1);
        lines.push(line);
        scene.addObjectToScene(line);
        return line;
      };
      generation_color1 = [0.8, 0.9, 0];
      generation_color2 = [0, 0.2, 0.8];
      generation_width = 1;
      death_color1 = [0.2, 0.3, 0];
      death_color2 = [0, 0.6, 0.3];
      death_width = 1;
      best_color1 = [0.9, 0.1, 0.0];
      best_color2 = [0.9, 0.1, 0.0];
      best_width = 6;
      add_particle_line = function(scene, particle) {
        var line, point1, point2, x, y, z;
        x = particle.parameter_value[0];
        y = particle.parameter_value[1] || 0;
        z = particle.objective_value;
        z = 4 - (z / 100000 * z_scaling);
        point1 = [x, 0, y];
        point2 = [x, z, y];
        line = addLine(scene, point1, point2, generation_color1, generation_color2, generation_width);
        return particle.line = line;
      };
      kill_particle_line = function(scene, particle, iteration_progress) {
        var c, color1, color2;
        color1 = [0, 0, 0];
        c = 255 * iteration_progress;
        color2 = [c, c, c];
        particle.line.setColors(color1, color2);
        particle.line.setWidth(death_width);
        scale_line(particle.line, 0.5);
        if (!SHOW_DEATH_PARTICLE) {
          scene.removeObjectFromScene(particle.line);
        }
        return particle.line = null;
      };
      best_particle_changes = function(scene, particle) {
        var coordinates, point1, point2;
        if (!particle.line) {
          return;
        }
        coordinates = particle.line.getCoordinates();
        point1 = [coordinates[0], 0, coordinates[2]];
        point2 = [coordinates[0], -3, coordinates[2]];
        if (best_marker === void 0) {
          return best_marker = addLine(scene, point1, point2, best_color1, best_color2, best_width);
        } else {
          return best_marker.setCoordinates(point1, point2);
        }
      };
      run_evolution = function(scene) {
        var algorithm, element, search_space, _j, _len, _ref;
        clear_lines(scene);
        best_marker = void 0;
        parameter = parameter10;
        $('#objective_name').html(parameter.objective_name);
        $('#number_of_particles').html(parameter.number_of_particles);
        $('#number_of_iterations').html(parameter.number_of_iterations);
        $('#objective').html(parameter.objective.toString());
        $('#search_space').html('');
        _ref = parameter.search_space;
        for (_j = 0, _len = _ref.length; _j < _len; _j++) {
          search_space = _ref[_j];
          element = $('<li>');
          element.append('min: ' + search_space.min + ' max: ' + search_space.max);
          $('#search_space').append(element);
        }
        parameter.scene = scene;
        parameter.on_particle_creation = function(particle) {
          return add_particle_line(parameter.scene, particle);
        };
        parameter.on_best_particle_changes = function(particle) {
          return best_particle_changes(parameter.scene, particle);
        };
        parameter.on_particle_death = function(particle, iteration_progress) {
          return kill_particle_line(parameter.scene, particle, iteration_progress);
        };
        drawMeshgrid(scene);
        algorithm = new differential_evolution(parameter);
        return algorithm.run();
      };
      return c3dl.addMainCallBack(traveller_main, "traveller_canvas");
    }).call(this);
  }).call(this);

}).call(this);
