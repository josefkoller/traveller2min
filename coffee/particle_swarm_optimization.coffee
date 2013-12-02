# particle swarm optimization algorithm

ITERATION_SLEEP = 1 #chrome is very good in updating the scene. firefox: 1/40 * 1000 # milliseconds
DISPLAY_ITERATION_INFO = true
SHOW_DEATH_PARTICLE = false

#= require <particle_storage>

class particle_swarm_optimization
  constructor: (parameter) ->
    @parameter = parameter or {}
    @parameter.objective = parameter.objective or objective1
    @parameter.search_space = parameter.search_space or [(min: -1, max: 1)]
    @parameter.number_of_dimensions = parameter.number_of_dimensions or 1
    @parameter.number_of_particles = parameter.number_of_particles or 100
    @parameter.number_of_iterations = parameter.number_of_iterations or 10

    @parameter.time_change_factor = parameter.time_change_factor or 0.3 # change in mutation
    @parameter.cognitive_factor = parameter.cognitive_factor or 1 # personal best
    @parameter.social_factor = parameter.social_factor or 4.5

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
    particle_mutation = (parameter, current, personal_best, global_best) ->
      child = new Array()
      xi = 0
      while xi < parameter.number_of_dimensions
        # HEART OF PSO ... next = time_factor*current 
        #                         + random1*cognitive_factor*(pesonal_best - current) 
        #                         + random2*social_factor*(global_best - current)
        current_xi = current[xi]
        personal_best_xi = personal_best[xi]
        global_best_xi = global_best[xi]
        cognitive_factor = parameter.cognitive_factor * Math.random()
        social_factor = parameter.social_factor * Math.random()
        child_xi = parameter.time_change_factor*current_xi +
          cognitive_factor*(personal_best_xi - current_xi) +
          social_factor*(global_best_xi - current_xi)
        child.push child_xi
        xi++
      child
    for particle in @particles.particles
      global_best = @particles.current_best_particle
      personal_best = particle.personal_best
      child_parameter_value = particle_mutation(@parameter,
        particle.parameter_value, personal_best.parameter_value, global_best.parameter_value)
      child_parameter_value = @particles.check_parameter_value_in_search_space child_parameter_value
      child_objective_value = @parameter.objective(child_parameter_value)
      particle.child = new Particle(child_parameter_value, child_objective_value)

  recombination: =>
    a = 3
    # nothing to do here?

  selection: =>
    child_wins = 0
    for particle in @particles.particles
      if particle.child.dominates(particle)
        child_wins++
        @parameter.on_particle_death(particle, @iteration_progress)
        particle.eaten_by_child()
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


Particle::eaten_by_child = () ->
  if not @personal_best or @objective_value < @personal_best.objective_value
    @personal_best = this


ParticleStorage::construct_particle = (parameter_value, objective_value) ->
  particle = new Particle(parameter_value, objective_value)
  particle.personal_best = particle
  particle
