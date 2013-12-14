var DISPLAY_ITERATION_INFO, ITERATION_SLEEP, Particle, ParticleStorage, SHOW_DEATH_PARTICLE, boundary_handler, differential_evolution, i, mu_over_rho_comma_lambda, parameter1, parameter10, parameter11, parameter12, parameter2, parameter3, parameter4, parameter5, parameter6, parameter7, parameter8, parameter9, particle_swarm_optimization, search_space11, search_space12, square, stochastic_optimization, _i,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

$(document).ready(function() {
  $('#clear_button').click(function() {
    $('#results tr').remove();
    return $('#results').append('<tr><td>objective value</td><td>parameter value</td></tr>');
  });
  return $('#run_button').click(function() {
    var algorithm_parameter, best_particles, create_algorithm, current_run, number_of_runs, output_average_objective_value, output_average_parameter_value, output_results, output_statistic, output_variance_parameter_value, run, selected_objective_index, start_run, terminate, write;
    selected_objective_index = $('#objective_select')[0].selectedIndex;
    algorithm_parameter = eval('parameter' + (selected_objective_index + 1));
    algorithm_parameter.number_of_iterations = parseInt($('#number_of_iterations').val());
    algorithm_parameter.number_of_particles = parseInt($('#number_of_particles').val());
    create_algorithm = function(parameter) {
      var selected_algorithm_index;
      selected_algorithm_index = $('#algorithm_select')[0].selectedIndex;
      if (selected_algorithm_index === 2) {
        new mu_over_rho_comma_lambda(parameter);
      }
      if (selected_algorithm_index === 1) {
        new particle_swarm_optimization(parameter);
      }
      return new differential_evolution(parameter);
    };
    write = function(data) {
      return $('#output').append(data);
    };
    best_particles = new Array();
    number_of_runs = parseInt($('#number_of_runs').val());
    current_run = 1;
    start_run = function() {
      return current_run++ < number_of_runs;
    };
    run = function() {
      var algorithm, parameter;
      parameter = algorithm_parameter;
      parameter.termination_logic = function(best_particle) {
        best_particles.push(best_particle);
        write('.');
        if (start_run()) {
          return window.setTimeout(run, 1);
        } else {
          return terminate();
        }
      };
      algorithm = create_algorithm(parameter);
      return algorithm.run();
    };
    output_results = function() {
      var col1, col2, particle, results, row, _i, _len, _results;
      results = $('#results');
      _results = [];
      for (_i = 0, _len = best_particles.length; _i < _len; _i++) {
        particle = best_particles[_i];
        row = $('<tr>');
        col1 = $('<td>');
        col1.append(particle.objective_value);
        row.append(col1);
        col2 = $('<td>');
        col2.append(particle.parameter_value_to_string());
        row.append(col2);
        _results.push(results.append(row));
      }
      return _results;
    };
    output_average_objective_value = function() {
      var objective_average, objective_sum, particle, _i, _len;
      objective_sum = 0;
      for (_i = 0, _len = best_particles.length; _i < _len; _i++) {
        particle = best_particles[_i];
        objective_sum += particle.objective_value;
      }
      objective_average = objective_sum / best_particles.length;
      return $('#average_objective_value').html(objective_average);
    };
    output_average_parameter_value = function() {
      var dimension_average, dimension_sum, dimension_value, i, j, parameter_value_average, parameter_value_sum, particle, _i, _j, _k, _l, _ref, _ref1, _ref2, _ref3, _results;
      parameter_value_sum = [];
      for (j = _i = 0, _ref = best_particles[0].parameter_value.length; 0 <= _ref ? _i < _ref : _i > _ref; j = 0 <= _ref ? ++_i : --_i) {
        parameter_value_sum.push(0);
      }
      for (i = _j = 0, _ref1 = best_particles.length; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
        particle = best_particles[i];
        for (j = _k = 0, _ref2 = particle.parameter_value.length; 0 <= _ref2 ? _k < _ref2 : _k > _ref2; j = 0 <= _ref2 ? ++_k : --_k) {
          dimension_value = particle.parameter_value[j];
          parameter_value_sum[j] += dimension_value;
        }
      }
      parameter_value_average = [];
      $('#average_parameter_value').html('');
      _results = [];
      for (j = _l = 0, _ref3 = parameter_value_sum.length; 0 <= _ref3 ? _l < _ref3 : _l > _ref3; j = 0 <= _ref3 ? ++_l : --_l) {
        dimension_sum = parameter_value_sum[j];
        dimension_average = dimension_sum / best_particles.length;
        $('#average_parameter_value').append(dimension_average + ' | ');
        _results.push(dimension_average);
      }
      return _results;
    };
    output_variance_parameter_value = function(average) {
      var dimension_difference, dimension_difference_sum, dimension_value, dimension_variance, i, j, particle, sum_of_squared_differences, _i, _j, _k, _l, _ref, _ref1, _ref2, _ref3, _results;
      sum_of_squared_differences = [];
      for (j = _i = 0, _ref = best_particles[0].parameter_value.length; 0 <= _ref ? _i < _ref : _i > _ref; j = 0 <= _ref ? ++_i : --_i) {
        sum_of_squared_differences.push(0);
      }
      for (i = _j = 0, _ref1 = best_particles.length; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
        particle = best_particles[i];
        for (j = _k = 0, _ref2 = particle.parameter_value.length; 0 <= _ref2 ? _k < _ref2 : _k > _ref2; j = 0 <= _ref2 ? ++_k : --_k) {
          dimension_value = particle.parameter_value[j];
          dimension_difference = dimension_value - average[j];
          sum_of_squared_differences[j] += dimension_difference * dimension_difference;
        }
      }
      $('#variance_parameter_value').html('');
      _results = [];
      for (j = _l = 0, _ref3 = sum_of_squared_differences.length; 0 <= _ref3 ? _l < _ref3 : _l > _ref3; j = 0 <= _ref3 ? ++_l : --_l) {
        dimension_difference_sum = sum_of_squared_differences[j];
        dimension_variance = dimension_difference_sum / (best_particles.length - 1);
        _results.push($('#variance_parameter_value').append(dimension_variance + ' | '));
      }
      return _results;
    };
    output_statistic = function() {
      var average;
      output_average_objective_value();
      average = output_average_parameter_value();
      return output_variance_parameter_value(average);
    };
    terminate = function() {
      output_results();
      return output_statistic();
    };
    run();
    return false;
  });
});

boundary_handler = (function() {
  function boundary_handler(search_space) {
    this.search_space = search_space;
  }

  boundary_handler.prototype.check_parameter_value_in_search_space = function(parameter_value) {
    var dimension_value, parameter_i, search_space;
    parameter_i = 0;
    while (parameter_i < parameter_value.length) {
      dimension_value = parameter_value[parameter_i];
      search_space = this.search_space[parameter_i];
      if (dimension_value < search_space.min) {
        parameter_value[parameter_i] = this.boundary_action(dimension_value, search_space.min, search_space.max);
      } else if (dimension_value > search_space.max) {
        parameter_value[parameter_i] = this.boundary_action(dimension_value, search_space.max, search_space.min);
      }
      if (parameter_value[parameter_i] < search_space.min || parameter_value[parameter_i] > search_space.max) {
        alert("boundary handler FAILED! " + dimension_value);
      }
      parameter_i++;
    }
    return parameter_value;
  };

  boundary_handler.prototype.boundary_action = function(dimension_value, failed_boundary, other_boundary) {
    var choice;
    choice = Math.random() * 4;
    if (choice < 1) {
      return this.create_random_dimension_value({
        min: failed_boundary,
        max: other_boundary
      });
    } else if (choice < 2) {
      return this.mirrow_dimension_value(dimension_value, failed_boundary, other_boundary);
    } else if (choice < 3) {
      return this.loop_dimension_value(dimension_value, failed_boundary, other_boundary);
    } else {
      return this.clamp_dimension_value(dimension_value, failed_boundary, other_boundary);
    }
  };

  boundary_handler.prototype.clamp_dimension_value = function(dimension_value, failed_boundary, other_boundary) {
    return failed_boundary;
  };

  boundary_handler.prototype.loop_dimension_value = function(dimension_value, failed_boundary, other_boundary) {
    return other_boundary - (failed_boundary - dimension_value) % failed_boundary;
  };

  boundary_handler.prototype.mirrow_dimension_value = function(dimension_value, failed_boundary, other_boundary) {
    return failed_boundary + (failed_boundary - dimension_value) % failed_boundary;
  };

  boundary_handler.prototype.create_random_dimension_value = function(search_space) {
    var width;
    width = search_space.max - search_space.min;
    return search_space.min + width * Math.random();
  };

  boundary_handler.prototype.create_random_parameter_value = function() {
    var parameter_value, parameter_value_xi, ri, search_space;
    parameter_value = new Array();
    ri = 0;
    while (ri < this.search_space.length) {
      search_space = this.search_space[ri];
      parameter_value_xi = this.create_random_dimension_value(search_space);
      parameter_value.push(parameter_value_xi);
      ri++;
    }
    return parameter_value;
  };

  return boundary_handler;

})();

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
    this.boundary_handler = new boundary_handler(this.parameter.search_space);
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
    if (this.parameter.on_best_particle_changes) {
      this.parameter.on_best_particle_changes(new_particle);
    }
    return this.current_best_particle = new_particle;
  };

  ParticleStorage.prototype.check_parameter_value_in_search_space = function(parameter_value) {
    return this.boundary_handler.check_parameter_value_in_search_space(parameter_value);
  };

  ParticleStorage.prototype.construct_particle = function(parameter_value, objective_value) {
    return new Particle(parameter_value, objective_value);
  };

  ParticleStorage.prototype.add = function(parameter_value, objective_value) {
    var particle;
    particle = this.construct_particle(parameter_value, objective_value);
    this.particles.push(particle);
    if (this.parameter.on_particle_creation) {
      this.parameter.on_particle_creation(particle);
    }
    return this.check_best_particle(particle);
  };

  ParticleStorage.prototype.add_random_particle = function() {
    var objective_value, parameter_value;
    parameter_value = this.boundary_handler.create_random_parameter_value();
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

Particle.prototype.dominates = function(other) {
  return this.objective_value < other.objective_value;
};

Particle.prototype.to_string = function() {
  var objective_value, parameter_value;
  parameter_value = this.parameter_value_to_string();
  objective_value = this.objective_value;
  return "parameter value: " + parameter_value + "<br/>objective value: " + objective_value;
};

Particle.prototype.parameter_value_to_string = function() {
  var dimension_value, i, parameter_value, _i, _ref;
  parameter_value = "(";
  for (i = _i = 0, _ref = this.parameter_value.length - 1; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
    dimension_value = this.parameter_value[i];
    parameter_value += dimension_value + ", ";
  }
  return parameter_value += this.parameter_value[this.parameter_value.length - 1] + ")";
};

ITERATION_SLEEP = 1;

DISPLAY_ITERATION_INFO = true;

SHOW_DEATH_PARTICLE = false;

stochastic_optimization = (function() {
  function stochastic_optimization(parameter) {
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
  }

  stochastic_optimization.prototype.run = function() {
    $('#termination_display').html("running...");
    this.initialize();
    return this.iteration();
  };

  stochastic_optimization.prototype.iteration = function() {
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

  stochastic_optimization.prototype.initialize = function() {
    this.particles = new ParticleStorage(this.parameter);
    this.particles.shuffle();
    return this.current_iteration = 0;
  };

  stochastic_optimization.prototype.start_iteration = function() {
    if (this.current_iteration === this.parameter.number_of_iterations) {
      return false;
    }
    this.iteration_progress = this.current_iteration / this.parameter.number_of_iterations;
    this.current_iteration++;
    return true;
  };

  stochastic_optimization.prototype.mutation = function() {
    return this.parameter.algorithm.mutation_logic();
  };

  stochastic_optimization.prototype.recombination = function() {
    if (this.parameter.algorithm.recombination_logic) {
      return this.parameter.algorithm.recombination_logic();
    }
  };

  stochastic_optimization.prototype.selection = function() {
    return this.parameter.algorithm.selection_logic();
  };

  stochastic_optimization.prototype.termination = function() {
    var best, text;
    best = this.particles.current_best_particle;
    text = "FINISHED!<br/>Best particle at termination:<br/>" + best.to_string();
    $("#termination_display").html(text);
    if (this.parameter.termination_logic) {
      return this.parameter.termination_logic(best);
    }
  };

  return stochastic_optimization;

})();

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

particle_swarm_optimization = (function() {
  function particle_swarm_optimization(parameter) {
    this.run = __bind(this.run, this);
    this.selection = __bind(this.selection, this);
    this.mutation = __bind(this.mutation, this);
    parameter.algorithm = {};
    parameter.algorithm.mutation_logic = this.mutation;
    parameter.algorithm.selection_logic = this.selection;
    this.algorithm = new stochastic_optimization(parameter);
    this.parameter = parameter;
    this.parameter.time_change_factor = parameter.time_change_factor || 0.3;
    this.parameter.cognitive_factor = parameter.cognitive_factor || 1;
    this.parameter.social_factor = parameter.social_factor || 4.5;
  }

  particle_swarm_optimization.prototype.mutation = function() {
    var child_objective_value, child_parameter_value, global_best, particle, particle_mutation, particles, personal_best, _j, _len, _ref, _results;
    particle_mutation = function(parameter, current, personal_best, global_best) {
      var child, child_xi, cognitive_factor, current_xi, global_best_xi, personal_best_xi, social_factor, xi;
      child = new Array();
      xi = 0;
      while (xi < parameter.number_of_dimensions) {
        current_xi = current[xi];
        personal_best_xi = personal_best[xi];
        global_best_xi = global_best[xi];
        cognitive_factor = parameter.cognitive_factor * Math.random();
        social_factor = parameter.social_factor * Math.random();
        child_xi = parameter.time_change_factor * current_xi + cognitive_factor * (personal_best_xi - current_xi) + social_factor * (global_best_xi - current_xi);
        child.push(child_xi);
        xi++;
      }
      return child;
    };
    particles = this.algorithm.particles;
    _ref = particles.particles;
    _results = [];
    for (_j = 0, _len = _ref.length; _j < _len; _j++) {
      particle = _ref[_j];
      global_best = particles.current_best_particle;
      personal_best = particle.personal_best;
      child_parameter_value = particle_mutation(this.parameter, particle.parameter_value, personal_best.parameter_value, global_best.parameter_value);
      child_parameter_value = particles.check_parameter_value_in_search_space(child_parameter_value);
      child_objective_value = this.parameter.objective(child_parameter_value);
      _results.push(particle.child = new Particle(child_parameter_value, child_objective_value));
    }
    return _results;
  };

  particle_swarm_optimization.prototype.selection = function() {
    var child_wins, particle, particles, _j, _len, _ref;
    child_wins = 0;
    particles = this.algorithm.particles;
    _ref = particles.particles;
    for (_j = 0, _len = _ref.length; _j < _len; _j++) {
      particle = _ref[_j];
      if (particle.child.dominates(particle)) {
        child_wins++;
        this.parameter.on_particle_death(particle, this.algorithm.iteration_progress);
        particle.eaten_by_child();
        particle.parameter_value = particle.child.parameter_value;
        particle.objective_value = particle.child.objective_value;
        this.parameter.on_particle_creation(particle);
        particles.check_best_particle(particle);
      }
    }
    if (DISPLAY_ITERATION_INFO) {
      return $('#iteration_display').append("<br/>" + child_wins + "/" + particles.particles.length + " wins");
    }
  };

  particle_swarm_optimization.prototype.run = function() {
    return this.algorithm.run();
  };

  return particle_swarm_optimization;

})();

Particle.prototype.eaten_by_child = function() {
  if (!this.personal_best || this.objective_value < this.personal_best.objective_value) {
    return this.personal_best = this;
  }
};

ParticleStorage.prototype.construct_particle = function(parameter_value, objective_value) {
  var particle;
  particle = new Particle(parameter_value, objective_value);
  particle.personal_best = particle;
  return particle;
};

mu_over_rho_comma_lambda = (function() {
  function mu_over_rho_comma_lambda(parameter) {
    this.run = __bind(this.run, this);
    this.selection = __bind(this.selection, this);
    this.recombination = __bind(this.recombination, this);
    this.mutation = __bind(this.mutation, this);
    this.calculate_initial_step_size = __bind(this.calculate_initial_step_size, this);
    parameter.algorithm = {};
    parameter.algorithm.mutation_logic = this.mutation;
    parameter.algorithm.selection_logic = this.selection;
    parameter.algorithm.recombination_logic = this.recombination;
    this.algorithm = new stochastic_optimization(parameter);
    this.parameter = this.algorithm.parameter;
    this.parameter.sigma = this.calculate_initial_step_size(this.parameter.search_space);
    this.parameter.sigma_factor = this.parameter.sigma_factor || 0.85;
    this.parameter.ratio_of_positive_mutation_threshold = this.parameter.ratio_of_positive_mutation_threshold || 1 / 5;
  }

  mu_over_rho_comma_lambda.prototype.calculate_initial_step_size = function(search_space) {
    var search_space_dimension, sigma, width, _j, _len;
    sigma = 0;
    for (_j = 0, _len = search_space.length; _j < _len; _j++) {
      search_space_dimension = search_space[_j];
      width = search_space_dimension.max - search_space_dimension.min;
      if (width > sigma) {
        sigma = width;
      }
    }
    return sigma * 0.2;
  };

  mu_over_rho_comma_lambda.prototype.mutation = function() {
    var child_objective_value, child_parameter_value, particle, particle_mutation, particles, _j, _len, _ref, _results;
    particle_mutation = function(parameter, current) {
      var child, child_xi, xi;
      child = new Array();
      xi = 0;
      while (xi < parameter.number_of_dimensions) {
        child_xi = current[xi] + Math.random() * parameter.sigma;
        child.push(child_xi);
        xi++;
      }
      return child;
    };
    particles = this.algorithm.particles;
    _ref = particles.particles;
    _results = [];
    for (_j = 0, _len = _ref.length; _j < _len; _j++) {
      particle = _ref[_j];
      child_parameter_value = particle_mutation(this.parameter, particle.parameter_value);
      child_parameter_value = particles.check_parameter_value_in_search_space(child_parameter_value);
      child_objective_value = this.parameter.objective(child_parameter_value);
      _results.push(particle.child = new Particle(child_parameter_value, child_objective_value));
    }
    return _results;
  };

  mu_over_rho_comma_lambda.prototype.recombination = function() {
    var a;
    return a = 3;
  };

  mu_over_rho_comma_lambda.prototype.selection = function() {
    var child_wins, particle, particles, ratio_of_positive_mutations, _j, _len, _ref;
    particles = this.algorithm.particles;
    child_wins = 0;
    _ref = particles.particles;
    for (_j = 0, _len = _ref.length; _j < _len; _j++) {
      particle = _ref[_j];
      if (particle.child.dominates(particle)) {
        child_wins++;
        this.parameter.on_particle_death(particle, this.algorithm.iteration_progress);
        particle.parameter_value = particle.child.parameter_value;
        particle.objective_value = particle.child.objective_value;
        this.parameter.on_particle_creation(particle);
        particles.check_best_particle(particle);
      }
    }
    ratio_of_positive_mutations = child_wins / particles.particles.length;
    if (ratio_of_positive_mutations < this.parameter.ratio_of_positive_mutation_threshold) {
      this.parameter.sigma /= this.parameter.sigma_factor;
    } else {
      this.parameter.sigma *= this.parameter.sigma_factor;
    }
    if (DISPLAY_ITERATION_INFO) {
      return $('#iteration_display').append("<br/>" + ratio_of_positive_mutations + " positive mutations");
    }
  };

  mu_over_rho_comma_lambda.prototype.run = function() {
    return this.algorithm.run();
  };

  return mu_over_rho_comma_lambda;

})();

differential_evolution = (function() {
  function differential_evolution(parameter) {
    this.run = __bind(this.run, this);
    this.selection = __bind(this.selection, this);
    this.recombination = __bind(this.recombination, this);
    this.mutation = __bind(this.mutation, this);
    parameter.algorithm = {};
    parameter.algorithm.mutation_logic = this.mutation;
    parameter.algorithm.selection_logic = this.selection;
    parameter.algorithm.recombination_logic = this.recombination;
    this.algorithm = new stochastic_optimization(parameter);
    this.parameter = this.algorithm.parameter;
    this.parameter.mutation_factor1 = parameter.mutation_factor1 || 0.7;
    this.parameter.mutation_factor2 = parameter.mutation_factor2 || 0.9;
    this.parameter.cross_over_ratio = parameter.cross_over_ratio || 0.8;
  }

  differential_evolution.prototype.mutation = function() {
    var best, child_objective_value, child_parameter_value, particle, particle_mutation, particles, random1, random2, _j, _len, _ref, _results;
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
    particles = this.algorithm.particles;
    _ref = particles.particles;
    _results = [];
    for (_j = 0, _len = _ref.length; _j < _len; _j++) {
      particle = _ref[_j];
      random1 = particles.pick_random_particle();
      random2 = particles.pick_random_particle();
      best = particles.current_best_particle;
      child_parameter_value = particle_mutation(this.parameter, particle.parameter_value, random1.parameter_value, random2.parameter_value, best.parameter_value);
      child_parameter_value = particles.check_parameter_value_in_search_space(child_parameter_value);
      child_objective_value = this.parameter.objective(child_parameter_value);
      _results.push(particle.child = new Particle(child_parameter_value, child_objective_value));
    }
    return _results;
  };

  differential_evolution.prototype.recombination = function() {
    var particle, _j, _len, _ref, _results;
    _ref = this.algorithm.particles.particles;
    _results = [];
    for (_j = 0, _len = _ref.length; _j < _len; _j++) {
      particle = _ref[_j];
      _results.push(particle.cross_over = Math.random() < this.parameter.cross_over_ratio);
    }
    return _results;
  };

  differential_evolution.prototype.selection = function() {
    var child_wins, particle, particles, _j, _len, _ref;
    particles = this.algorithm.particles;
    child_wins = 0;
    _ref = particles.particles;
    for (_j = 0, _len = _ref.length; _j < _len; _j++) {
      particle = _ref[_j];
      if (particle.cross_over && particle.child.dominates(particle)) {
        child_wins++;
        if (this.parameter.on_particle_death) {
          this.parameter.on_particle_death(particle, this.algorithm.iteration_progress);
        }
        particle.parameter_value = particle.child.parameter_value;
        particle.objective_value = particle.child.objective_value;
        if (this.parameter.on_particle_creation) {
          this.parameter.on_particle_creation(particle);
        }
        particles.check_best_particle(particle);
      }
    }
    if (DISPLAY_ITERATION_INFO) {
      return $('#iteration_display').append("<br/>" + child_wins + "/" + particles.particles.length + " wins");
    }
  };

  differential_evolution.prototype.run = function() {
    return this.algorithm.run();
  };

  return differential_evolution;

})();
