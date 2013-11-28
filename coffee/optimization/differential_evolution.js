// differential evolution algorithm

//given
objective1 = function(x) {
    return x*x
};
square = function(x) { 
    return x * x;
};
objective2 = function(X) {
  var x = X[0];
  var y = X[1];
  return square(1.5 - x + x*y) +
         square(2.25 - x + x*y*y) +
         square(2.625 - x + x*y*y*y);
};

differential_evolution = function(parameter) {
    parameter = parameter || {};
    this.parameter = {}; 
    this.parameter.objective = parameter.objective || objective1;
    this.parameter.search_space = parameter.search_space || { min: -1, max: 1 };
    this.parameter.number_of_dimensions = parameter.number_of_dimensions || 1;
    this.parameter.number_of_particles = parameter.number_of_particles || 100;
    this.parameter.number_of_iterations = parameter.number_of_iterations || 10;
    this.parameter.mutation_factor1 = parameter.mutation_factor1 || 0.7;
    this.parameter.mutation_factor2 = parameter.mutation_factor2 || 0.9;

    this.run = function() {
        this.initialize();
        while(this.start_iteration() ) {
            this.mutation();
            this.recombination();
            this.selection();
        } 
        this.termination();
    };
    this.initialize = function() {
        this.particles = new ParticleStorage(this.parameter);
        this.particles.shuffle();
        this.current_iteration = 0;
    };
    this.start_iteration = function() {
        if(this.current_iteration == this.parameter.number_of_iterations)
            return false;
        this.current_iteration++;
        return true;
        // TODO: convergence tests
    };
    this.mutation = function() {
        var particle_mutation = function(parameter, current, random1, random2, best) {
	    child = new Array();
 	    for(var xi = 0; xi < parameter.number_of_dimensions; xi++) {
		child_xi = current[xi] + 
			parameter.mutation_factor1 * (random2[xi] - random1[xi]) + 
                	parameter.mutation_factor2 * (best[xi] - current[xi]);
		child.push(child_xi);
 	    }
            return child;
    	};
        this.particles.for_each(function (particle, particles) {
            var random1 = particles.pick_random_particle();
            var random2 = particles.pick_random_particle();
            var best = particles.current_best_particle;
            child_parameter_value = particle_mutation(particles.parameter, particle.parameter_value,
                random1.parameter_value, random2.parameter_value, best.parameter_value);
            child_objective_value = particles.parameter.objective(child_parameter_value);
            particle.child = new Particle(child_parameter_value, child_objective_value);
       });
    };
    this.recombination = function() {
       this.particles.for_each(function (particle) {
            if(Math.random() < this.cross_over_factor) {
                particle.cross_over = true;
            } 
       });
    };
    this.selection = function() {
       this.particles.for_each(function (particle) {
               particle.fight();
       });
    };
    this.termination = function() {
       var best = this.particles.current_best_particle;
       alert("Best particle at termination: " + best.to_string());
    };
};
function Particle(parameter_value, objective_value) {
    this.parameter_value = parameter_value;
    this.objective_value = objective_value;
}
Particle.prototype.dominates = function(other) {
    return this.objective_value < other.objective_value;
};
Particle.prototype.fight = function() {
    if(this.cross_over && this.child.dominates(this)) {
        this.parameter_value = this.child.parameter_value;
        this.objective_value = this.child.objective_value;
    }
};
Particle.prototype.to_string = function() {
    return "parameter value: " + this.parameter_value + ", objective value: " + this.objective_value;
};
function ParticleStorage(parameter) {
    this.parameter = parameter;
    this.shuffle = function() {
        this.particles = new Array();
        this.current_best_particle = null;
        for(var i = 0; i < this.parameter.number_of_particles; i++) {
            this.add_random_particle();
        }
    };
    this.check_best_particle = function(new_particle) {
       if(this.current_best_particle != null &&
         this.current_best_particle.objective_value < new_particle.objective_value) 
         return;
       this.current_best_particle = new_particle;
    };
    this.add = function(parameter_value, objective_value) {
        var particle = new Particle(parameter_value, objective_value);
        this.check_best_particle(particle);
        this.particles.push(particle);
    };
    this.add_random_particle = function() {
	var parameter_value = new Array();
  	for(var xi = 0; xi < parameter.number_of_dimensions; xi++) {
	    var search_space_xi = this.parameter.search_space[xi];
            var width = search_space.max - search_space.min;
            var parameter_value_xi = search_space.min + width * Math.random();
	    parameter_value.push(parameter_value_xi);
        }
        var objective_value = this.parameter.objective(parameter_value);
        this.add(parameter_value, objective_value);
        // TODO: make create function, check distance, quasi-random
    };
    this.pick_random_particle = function() {
	var index = Math.round(Math.random() * (this.particles.length-1));
	return this.particles[index];
    };
    this.for_each = function(particle_action) {
       for(var i = 0; i < this.particles.length; i++) {
           particle = this.particles[i];
           particle_action(particle, this);
       }
    };
}
function run() {
    algorithm = new differential_evolution();
    algorithm.run();
}
