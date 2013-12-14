# 'mu|rho,lambda' algorithm

class mu_over_rho_comma_lambda
  constructor: (parameter) ->
    parameter.algorithm = {}
    parameter.algorithm.mutation_logic = @mutation
    parameter.algorithm.selection_logic = @selection
    parameter.algorithm.recombination_logic = @recombination
    @algorithm = new stochastic_optimization(parameter)

    @parameter = @algorithm.parameter
    @parameter.sigma = @calculate_initial_step_size(@parameter.search_space)
    @parameter.sigma_factor = @parameter.sigma_factor or 0.85
    @parameter.ratio_of_positive_mutation_threshold = @parameter.ratio_of_positive_mutation_threshold or 1/5

  calculate_initial_step_size: (search_space) =>
    sigma = 0
    for search_space_dimension in search_space
      width = search_space_dimension.max - search_space_dimension.min
      if width > sigma
        sigma = width
    sigma*0.2 # x% of maximum width of all dimensions
    
  mutation: =>
    particle_mutation = (parameter, current) ->
      child = new Array()
      xi = 0
      while xi < parameter.number_of_dimensions
        # MUTATE BY GAUSS, sigma mu
        child_xi = current[xi] + Math.random() * parameter.sigma
        child.push child_xi
        xi++
      child
    particles = @algorithm.particles
    for particle in particles.particles
      child_parameter_value = particle_mutation @parameter, particle.parameter_value
      child_parameter_value = particles.check_parameter_value_in_search_space child_parameter_value
      child_objective_value = @parameter.objective child_parameter_value
      particle.child = new Particle child_parameter_value, child_objective_value

  recombination: =>
    a = 3

  selection: =>
    # 'environmental selection'
    particles = @algorithm.particles
    child_wins = 0
    for particle in particles.particles
      if particle.child.dominates(particle)
        child_wins++
        @parameter.on_particle_death(particle, @algorithm.iteration_progress)
        particle.parameter_value = particle.child.parameter_value
        particle.objective_value = particle.child.objective_value
        @parameter.on_particle_creation(particle)
        particles.check_best_particle(particle)
    # step size control
    ratio_of_positive_mutations = child_wins / particles.particles.length
    if ratio_of_positive_mutations < @parameter.ratio_of_positive_mutation_threshold
      @parameter.sigma /= @parameter.sigma_factor
    else
      @parameter.sigma *= @parameter.sigma_factor
    if DISPLAY_ITERATION_INFO
      $('#iteration_display').append "<br/>#{ratio_of_positive_mutations} positive mutations"

  run: =>
    @algorithm.run()
