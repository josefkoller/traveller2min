# particle swarm optimization algorithm

ITERATION_SLEEP = 1 #chrome is very good in updating the scene. firefox: 1/40 * 1000 # milliseconds
DISPLAY_ITERATION_INFO = true
SHOW_DEATH_PARTICLE = false

#= require <particle_storage>

class stochastic_optimization
  constructor: (parameter) ->
    @parameter = parameter or {}
    @parameter.objective = parameter.objective or objective1
    @parameter.search_space = parameter.search_space or [(min: -1, max: 1)]
    @parameter.number_of_dimensions = parameter.number_of_dimensions or 1
    @parameter.number_of_particles = parameter.number_of_particles or 100
    @parameter.number_of_iterations = parameter.number_of_iterations or 10
    @parameter.fast_mode = parameter.fast_mode or false
  run:  =>
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
      if @parameter.fast_mode
        this.iteration()
      else
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
    @parameter.algorithm.mutation_logic()

  recombination: =>
    if @parameter.algorithm.recombination_logic
      @parameter.algorithm.recombination_logic()

  selection: =>
    @parameter.algorithm.selection_logic()

  termination: =>
    best = @particles.current_best_particle
    text = "FINISHED!<br/>Best particle at termination:<br/>" + best.to_string()
    $("#termination_display").html text
    @parameter.termination_logic best if @parameter.termination_logic
