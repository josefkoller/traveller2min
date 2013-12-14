# differential evolution algorithm

class differential_evolution
  constructor: (parameter) ->
    parameter.algorithm = {}
    parameter.algorithm.mutation_logic = @mutation
    parameter.algorithm.selection_logic = @selection
    parameter.algorithm.recombination_logic = @recombination
    @algorithm = new stochastic_optimization(parameter)

    @parameter = @algorithm.parameter
    @parameter.mutation_factor1 = parameter.mutation_factor1 or 0.7
    @parameter.mutation_factor2 = parameter.mutation_factor2 or 0.9
    @parameter.cross_over_ratio = parameter.cross_over_ratio or 0.8

  mutation: =>
    particle_mutation = (parameter, current, random1, random2, best) ->
      child = new Array()
      xi = 0
      while xi < parameter.number_of_dimensions
        # HEART OF DE...   c += m1*(r1 - r2) + m2*(best - c)
        child_xi = current[xi] + 
          parameter.mutation_factor1 * (random2[xi] - random1[xi]) + 
          parameter.mutation_factor2 * (best[xi] - current[xi])
        child.push child_xi
        xi++
      child
    particles = @algorithm.particles
    for particle in particles.particles
      random1 = particles.pick_random_particle()
      random2 = particles.pick_random_particle()
      best = particles.current_best_particle
      child_parameter_value = particle_mutation(@parameter, particle.parameter_value, random1.parameter_value, random2.parameter_value, best.parameter_value)
      child_parameter_value = particles.check_parameter_value_in_search_space child_parameter_value
      child_objective_value = @parameter.objective(child_parameter_value)
      particle.child = new Particle(child_parameter_value, child_objective_value)

  recombination: =>
    for particle in @algorithm.particles.particles
      particle.cross_over = Math.random() < @parameter.cross_over_ratio

  selection: =>
    particles = @algorithm.particles
    child_wins = 0
    for particle in particles.particles
      if particle.cross_over and particle.child.dominates(particle)
        child_wins++
        @parameter.on_particle_death particle, @algorithm.iteration_progress if @parameter.on_particle_death
        particle.parameter_value = particle.child.parameter_value
        particle.objective_value = particle.child.objective_value
        @parameter.on_particle_creation(particle) if @parameter.on_particle_creation
        particles.check_best_particle(particle)
    if DISPLAY_ITERATION_INFO
      $('#iteration_display').append "<br/>#{child_wins}/#{particles.particles.length} wins"

  run: =>
    @algorithm.run()
