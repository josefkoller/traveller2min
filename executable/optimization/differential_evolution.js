(function() {
  var Particle, ParticleStorage, differential_evolution, objective1, objective2, run, square;

  Particle = function(parameter_value, objective_value) {
    this.parameter_value = parameter_value;
    return this.objective_value = objective_value;
  };

  ParticleStorage = function(parameter) {
    this.parameter = parameter;
    this.shuffle = function() {
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
    this.check_best_particle = function(new_particle) {
      if ((this.current_best_particle != null) && this.current_best_particle.objective_value < new_particle.objective_value) {
        return;
      }
      return this.current_best_particle = new_particle;
    };
    this.add = function(parameter_value, objective_value) {
      var particle;
      particle = new Particle(parameter_value, objective_value);
      this.check_best_particle(particle);
      return this.particles.push(particle);
    };
    this.add_random_particle = function() {
      var objective_value, parameter_value, parameter_value_xi, search_space_xi, width, xi;
      parameter_value = new Array();
      xi = 0;
      while (xi < parameter.number_of_dimensions) {
        search_space_xi = this.parameter.search_space[xi];
        width = search_space.max - search_space.min;
        parameter_value_xi = search_space.min + width * Math.random();
        parameter_value.push(parameter_value_xi);
        xi++;
      }
      objective_value = this.parameter.objective(parameter_value);
      return this.add(parameter_value, objective_value);
    };
    this.pick_random_particle = function() {
      var index;
      index = Math.round(Math.random() * (this.particles.length - 1));
      return this.particles[index];
    };
    return this.for_each = function(particle_action) {
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
  };

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

  differential_evolution = function(parameter) {
    parameter = parameter || {};
    this.parameter = {};
    this.parameter.objective = parameter.objective || objective1;
    this.parameter.search_space = parameter.search_space || {
      min: -1,
      max: 1
    };
    this.parameter.number_of_dimensions = parameter.number_of_dimensions || 1;
    this.parameter.number_of_particles = parameter.number_of_particles || 100;
    this.parameter.number_of_iterations = parameter.number_of_iterations || 10;
    this.parameter.mutation_factor1 = parameter.mutation_factor1 || 0.7;
    this.parameter.mutation_factor2 = parameter.mutation_factor2 || 0.9;
    this.run = function() {
      this.initialize();
      while (this.start_iteration()) {
        this.mutation();
        this.recombination();
        this.selection();
      }
      return this.termination();
    };
    this.initialize = function() {
      this.particles = new ParticleStorage(this.parameter);
      this.particles.shuffle();
      return this.current_iteration = 0;
    };
    this.start_iteration = function() {
      if (this.current_iteration === this.parameter.number_of_iterations) {
        return false;
      }
      this.current_iteration++;
      return true;
    };
    this.mutation = function() {
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
        child_objective_value = particles.parameter.objective(child_parameter_value);
        return particle.child = new Particle(child_parameter_value, child_objective_value);
      });
    };
    this.recombination = function() {
      return this.particles.for_each(function(particle) {
        if (Math.random() < this.cross_over_factor) {
          return particle.cross_over = true;
        }
      });
    };
    this.selection = function() {
      return this.particles.for_each(function(particle) {
        return particle.fight();
      });
    };
    return this.termination = function() {
      var best;
      best = this.particles.current_best_particle;
      return alert("Best particle at termination: " + best.to_string());
    };
  };

  Particle.prototype.dominates = function(other) {
    return this.objective_value < other.objective_value;
  };

  Particle.prototype.fight = function() {
    if (this.cross_over && this.child.dominates(this)) {
      this.parameter_value = this.child.parameter_value;
      return this.objective_value = this.child.objective_value;
    }
  };

  Particle.prototype.to_string = function() {
    return "parameter value: " + this.parameter_value + ", objective value: " + this.objective_value;
  };

}).call(this);
