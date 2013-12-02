# differential evolution algorithm

ITERATION_SLEEP = 1 #chrome is very good in updating the scene. firefox: 1/40 * 1000 # milliseconds
DISPLAY_ITERATION_INFO = true
SHOW_DEATH_PARTICLE = false

#= require <particle_storage>

class differential_evolution
  constructor: (parameter) ->
    @parameter = parameter or {}
    @parameter.objective = parameter.objective or objective1
    @parameter.search_space = parameter.search_space or [(min: -1, max: 1)]
    @parameter.number_of_dimensions = parameter.number_of_dimensions or 1
    @parameter.number_of_particles = parameter.number_of_particles or 100
    @parameter.number_of_iterations = parameter.number_of_iterations or 10
    @parameter.mutation_factor1 = parameter.mutation_factor1 or 0.7
    @parameter.mutation_factor2 = parameter.mutation_factor2 or 0.9
    @parameter.cross_over_ratio = parameter.cross_over_ratio or 0.8

  run: =>
    $('#termination_display').html "running..."
    @initialize()
    @iteration()

  iteration: () ->
    if DISPLAY_ITERATION_INFO
      $('#iteration_display').html "<br/>iteration: #{@current_iteration}/#{@parameter.number_of_iterations}"
    @mutation()
    @recombination()
    @selection()
    that = this
    if(@start_iteration())
      window.setTimeout((() -> that.iteration()), ITERATION_SLEEP)
    else
      @termination()

  initialize: => 
    @particles = new ParticleStorage(@parameter)
    @particles.shuffle()
    @current_iteration = 0

  start_iteration: () ->
    return false  if @current_iteration is @parameter.number_of_iterations
    @iteration_progress = @current_iteration / @parameter.number_of_iterations
    @current_iteration++
    true

  mutation: =>
    particle_mutation = (parameter, current, random1, random2, best) ->
      child = new Array()
      xi = 0
      while xi < parameter.number_of_dimensions
        # HEART OF DE...   c += m1*(r1 - r2) + m2*(best - c)
        child_xi = current[xi] + parameter.mutation_factor1 * (random2[xi] - random1[xi]) + parameter.mutation_factor2 * (best[xi] - current[xi])
        child.push child_xi
        xi++
      child
    for particle in @particles.particles
      random1 = @particles.pick_random_particle()
      random2 = @particles.pick_random_particle()
      best = @particles.current_best_particle
      child_parameter_value = particle_mutation(@parameter, particle.parameter_value, random1.parameter_value, random2.parameter_value, best.parameter_value)
      child_parameter_value = @particles.check_parameter_value_in_search_space child_parameter_value
      child_objective_value = @parameter.objective(child_parameter_value)
      particle.child = new Particle(child_parameter_value, child_objective_value)

  recombination: =>
    for particle in @particles.particles
      particle.cross_over = Math.random() < @parameter.cross_over_ratio

  selection: =>
    child_wins = 0
    for particle in @particles.particles
      if particle.cross_over and particle.child.dominates(particle)
        child_wins++
        @parameter.on_particle_death(particle, @iteration_progress)
        particle.parameter_value = particle.child.parameter_value
        particle.objective_value = particle.child.objective_value
        @parameter.on_particle_creation(particle)
        @particles.check_best_particle(particle)
    if DISPLAY_ITERATION_INFO
      $('#iteration_display').append "<br/>#{child_wins}/#{@particles.particles.length} wins"

  termination: =>
    best = @particles.current_best_particle
    text = "FINISHED!<br/>Best particle at termination:<br/>" + best.to_string()
    $("#termination_display").html text

