# differential evolution algorithm

# TODO: convergence tests
Particle = (parameter_value, objective_value) ->
  @parameter_value = parameter_value
  @objective_value = objective_value
ParticleStorage = (parameter) ->
  @parameter = parameter
  @shuffle = ->
    @particles = new Array()
    @current_best_particle = null
    i = 0

    while i < @parameter.number_of_particles
      @add_random_particle()
      i++

  @check_best_particle = (new_particle) ->
    return  if @current_best_particle? and @current_best_particle.objective_value < new_particle.objective_value
    @current_best_particle = new_particle

  @add = (parameter_value, objective_value) ->
    particle = new Particle(parameter_value, objective_value)
    @check_best_particle particle
    @particles.push particle


  @check_parameter_value_in_search_space = (parameter_value) ->
    i = 0
    while i < parameter_value.length
      dimension_value = parameter_value[i]
      search_space = @parameter.search_space[i]
      return @create_random_parameter_value() if dimension_value < search_space.min or dimension_value > search_space.max
    parameter_value

  @create_random_parameter_value = () ->
    parameter_value = new Array()
    xi = 0
    while xi < parameter.number_of_dimensions
      search_space_xi = @parameter.search_space[xi]
      width = search_space.max - search_space.min
      parameter_value_xi = search_space.min + width * Math.random()
      parameter_value.push parameter_value_xi
      xi++
    parameter_value

  @add_random_particle = ->
    parameter_value = @create_random_parameter_value()
    objective_value = @parameter.objective(parameter_value)
    @add parameter_value, objective_value

  
  # TODO: make create function, check distance, quasi-random
  @pick_random_particle = ->
    index = Math.round(Math.random() * (@particles.length - 1))
    @particles[index]

  @for_each = (particle_action) ->
    i = 0

    while i < @particles.length
      particle = @particles[i]
      particle_action particle, this
      i++
run = ->
  algorithm = new differential_evolution()
  algorithm.run()
objective1 = (x) ->
  x * x

square = (x) ->
  x * x

objective2 = (X) ->
  x = X[0]
  y = X[1]
  square(1.5 - x + x * y) + square(2.25 - x + x * y * y) + square(2.625 - x + x * y * y * y)

differential_evolution = (parameter) ->
  parameter = parameter or {}
  @parameter = {}
  @parameter.objective = parameter.objective or objective1
  @parameter.search_space = parameter.search_space or
    min: -1
    max: 1

  @parameter.number_of_dimensions = parameter.number_of_dimensions or 1
  @parameter.number_of_particles = parameter.number_of_particles or 100
  @parameter.number_of_iterations = parameter.number_of_iterations or 10
  @parameter.mutation_factor1 = parameter.mutation_factor1 or 0.7
  @parameter.mutation_factor2 = parameter.mutation_factor2 or 0.9
  @run = ->
    @initialize()
    while @start_iteration()
      @mutation()
      @recombination()
      @selection()
    @termination()

  @initialize = ->
    @particles = new ParticleStorage(@parameter)
    @particles.shuffle()
    @current_iteration = 0

  @start_iteration = ->
    return false  if @current_iteration is @parameter.number_of_iterations
    @current_iteration++
    true

  @mutation = ->
    particle_mutation = (parameter, current, random1, random2, best) ->
      child = new Array()
      xi = 0

      while xi < parameter.number_of_dimensions
        child_xi = current[xi] + parameter.mutation_factor1 * (random2[xi] - random1[xi]) + parameter.mutation_factor2 * (best[xi] - current[xi])
        child.push child_xi
        xi++
      child

    @particles.for_each (particle, particles) ->
      random1 = particles.pick_random_particle()
      random2 = particles.pick_random_particle()
      best = particles.current_best_particle
      child_parameter_value = particle_mutation(particles.parameter, particle.parameter_value, random1.parameter_value, random2.parameter_value, best.parameter_value)
      child_parameter_value = @particles.check_parameter_value_in_search_space child_parameter_value
      child_objective_value = particles.parameter.objective(child_parameter_value)
      particle.child = new Particle(child_parameter_value, child_objective_value)


  @recombination = ->
    @particles.for_each (particle) ->
      particle.cross_over = true  if Math.random() < @cross_over_factor


  @selection = ->
    @particles.for_each (particle) ->
      particle.fight()


  @termination = ->
    best = @particles.current_best_particle
    alert "Best particle at termination: " + best.to_string()

Particle::dominates = (other) ->
  @objective_value < other.objective_value

Particle::fight = ->
  if @cross_over and @child.dominates(this)
    @parameter_value = @child.parameter_value
    @objective_value = @child.objective_value

Particle::to_string = ->
  "parameter value: " + @parameter_value + ", objective value: " + @objective_value
