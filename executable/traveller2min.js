(function() {
  var Particle, ParticleStorage, differential_evolution, objective1, objective2, run, square,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

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
      var i, _results;
      this.particles = new Array();
      this.current_best_particle = null;
      i = 0;
      _results = [];
      while (i < this.parameter.number_of_particles) {
        this.add_random_particle();
        _results.push(i++);
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
      var dimension_value, i, search_space;
      i = 0;
      while (i < parameter_value.length) {
        dimension_value = parameter_value[i];
        search_space = this.parameter.search_space[i];
        if (dimension_value < search_space.min || dimension_value > search_space.max) {
          return this.create_random_parameter_value();
        }
        i++;
      }
      return parameter_value;
    };

    ParticleStorage.prototype.create_random_parameter_value = function() {
      var parameter_value, parameter_value_xi, search_space, width, xi;
      parameter_value = new Array();
      xi = 0;
      while (xi < this.parameter.number_of_dimensions) {
        search_space = this.parameter.search_space[xi];
        width = search_space.max - search_space.min;
        parameter_value_xi = search_space.min + width * Math.random();
        parameter_value.push(parameter_value_xi);
        xi++;
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

    ParticleStorage.prototype.for_each = function(particle_action) {
      var i, particle, _results;
      i = 0;
      _results = [];
      while (i < this.particles.length) {
        particle = this.particles[i];
        particle_action(particle, this);
        _results.push(i++);
      }
      return _results;
    };

    return ParticleStorage;

  })();

  run = function() {
    var algorithm;
    algorithm = new differential_evolution();
    return algorithm.run();
  };

  objective1 = function(x) {
    return x * x;
  };

  square = function(x) {
    return x * x;
  };

  objective2 = function(X) {
    var x, y;
    x = X[0];
    y = X[1];
    return square(1.5 - x + x * y) + square(2.25 - x + x * y * y) + square(2.625 - x + x * y * y * y);
  };

  differential_evolution = (function() {
    function differential_evolution(parameter) {
      this.termination = __bind(this.termination, this);
      this.selection = __bind(this.selection, this);
      this.recombination = __bind(this.recombination, this);
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
      this.initialize();
      while (this.start_iteration()) {
        this.mutation();
        this.recombination();
        this.selection();
      }
      return this.termination();
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
      this.current_iteration++;
      return true;
    };

    differential_evolution.prototype.mutation = function() {
      var particle_mutation;
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
      return this.particles.for_each(function(particle, particles) {
        var best, child_objective_value, child_parameter_value, random1, random2;
        random1 = particles.pick_random_particle();
        random2 = particles.pick_random_particle();
        best = particles.current_best_particle;
        child_parameter_value = particle_mutation(particles.parameter, particle.parameter_value, random1.parameter_value, random2.parameter_value, best.parameter_value);
        child_parameter_value = particles.check_parameter_value_in_search_space(child_parameter_value);
        child_objective_value = particles.parameter.objective(child_parameter_value);
        return particle.child = new Particle(child_parameter_value, child_objective_value);
      });
    };

    differential_evolution.prototype.recombination = function() {
      return this.particles.for_each(function(particle, particles) {
        return particle.cross_over = Math.random() < particles.parameter.cross_over_ratio;
      });
    };

    differential_evolution.prototype.selection = function() {
      return this.particles.for_each(function(particle, particles) {
        if (particle.cross_over && particle.child.dominates(particle)) {
          particles.parameter.on_particle_death(particle);
          particle.parameter_value = particle.child.parameter_value;
          particle.objective_value = particle.child.objective_value;
          return particles.parameter.on_particle_creation(particle);
        }
      });
    };

    differential_evolution.prototype.termination = function() {
      var best, text;
      best = this.particles.current_best_particle;
      text = "Best particle at termination: " + best.to_string();
      return $("#termination_display").html(text);
    };

    return differential_evolution;

  })();

  Particle.prototype.dominates = function(other) {
    return this.objective_value < other.objective_value;
  };

  Particle.prototype.to_string = function() {
    var dimension_value, parameter_value, _i, _len, _ref;
    parameter_value = "(";
    _ref = this.parameter_value;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      dimension_value = _ref[_i];
      parameter_value += dimension_value + ", ";
    }
    parameter_value += ")";
    return "parameter value: " + parameter_value + ", objective value: " + this.objective_value;
  };

  (function() {
    return (function() {
      var addLine, addVectors, add_axis, add_particle_line, axis_length, best_color1, best_color2, best_marker, best_particle, best_particle_changes, best_width, clear_lines, death_color1, death_color2, death_width, drawF1, generation_color1, generation_color2, generation_width, kill_particle_line, lines, run_evolution, scale_line, scale_lines, scene, traveller_main, vector_on_axis, z_scaling;
      addLine = void 0;
      addVectors = void 0;
      add_axis = void 0;
      clear_lines = void 0;
      best_particle = void 0;
      best_marker = void 0;
      scale_lines = void 0;
      axis_length = void 0;
      drawF1 = void 0;
      lines = void 0;
      scene = void 0;
      square = void 0;
      traveller_main = void 0;
      vector_on_axis = void 0;
      z_scaling = void 0;
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
          var direction, factor, new_position, position, rotation_speed, velocity;
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
          if (axis === "space") {
            run_evolution(scene);
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
            32: 'space'
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
            p = void 0;
            text = void 0;
            p = [position[0].toFixed(2), position[1].toFixed(2), position[2].toFixed(2)];
            text = "" + photon_index + ": x=" + p[0] + ",y=" + p[1] + ",z=" + p[2];
            return $("#traveller_display").html(text);
          }
        };
        scene.startScene();
        generation = [];
        options = {};
        return options.color;
      };
      drawF1 = function(scene) {
        var color1, color2, h, i, min, point1, point2, s, x, y, z, _results;
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
        _results = void 0;
        clear_lines(scene);
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
        min = {};
        min.z = void 0;
        while (y <= h) {
          x = -h;
          while (x <= h) {
            z = square(1.5 - x + x * y) + square(2.25 - x + x * y * y) + square(2.625 - x + x * y * y * y);
            z = z / 100000 * z_scaling;
            if (min.z === void 0 || z < min.z) {
              min.x = x;
              min.y = y;
              min.z = z;
            }
            point1 = [x, 0, y];
            point2 = [x, z, y];
            addLine(scene, point1, point2, color1, color2);
            x = x + s;
          }
          _results.push(y = y + s);
        }
        $("#termination_display").html("min: " + min.x + "|" + min.z + "|" + min.y);
        return _results;
      };
      clear_lines = function(scene) {
        var line, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = lines.length; _i < _len; _i++) {
          line = lines[_i];
          _results.push(scene.removeObjectFromScene(line));
        }
        return _results;
      };
      scale_lines = function(factor) {
        var line, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = lines.length; _i < _len; _i++) {
          line = lines[_i];
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
        line = void 0;
        line = void 0;
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
      square = function(x) {
        return x * x;
      };
      generation_color1 = [0.8, 0.9, 0];
      generation_color2 = [0, 0.2, 0.8];
      generation_width = 2;
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
      kill_particle_line = function(scene, particle) {
        particle.line.setColors(death_color1, death_color2);
        particle.line.setWidth(death_width);
        scale_line(particle.line, 0.5);
        scene.removeObjectFromScene(particle.line);
        return particle.line = null;
      };
      best_particle_changes = function(scene, particle) {
        var coordinates, point1, point2;
        if (!particle.line) {
          return;
        }
        best_particle = particle;
        coordinates = best_particle.line.getCoordinates();
        point1 = [coordinates[0], 0, coordinates[2]];
        point2 = [coordinates[0], -3, coordinates[2]];
        if (best_marker === void 0) {
          return best_marker = addLine(scene, point1, point2, best_color1, best_color2, best_width);
        } else {
          return best_marker.setCoordinates(point1, point2);
        }
      };
      run_evolution = function(scene) {
        var algorithm, parameter;
        clear_lines(scene);
        best_marker = void 0;
        parameter = {};
        parameter.scene = scene;
        parameter.on_particle_creation = function(particle) {
          return add_particle_line(parameter.scene, particle);
        };
        parameter.on_best_particle_changes = function(particle) {
          return best_particle_changes(parameter.scene, particle);
        };
        parameter.on_particle_death = function(particle) {
          return kill_particle_line(parameter.scene, particle);
        };
        parameter.objective = function(X) {
          var x, y;
          x = X[0];
          y = X[1];
          return square(1.5 - x + x * y) + square(2.25 - x + x * y * y) + square(2.625 - x + x * y * y * y);
        };
        parameter.search_space = [
          {
            min: -4.5,
            max: 4.5
          }, {
            min: -4.5,
            max: 4.5
          }
        ];
        parameter.number_of_dimensions = 2;
        parameter.number_of_particles = 64;
        parameter.number_of_iterations = 200;
        algorithm = new differential_evolution(parameter);
        return algorithm.run();
      };
      return c3dl.addMainCallBack(traveller_main, "traveller_canvas");
    }).call(this);
  }).call(this);

}).call(this);
