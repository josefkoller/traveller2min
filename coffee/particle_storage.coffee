# Particle, ParticleStorage

class Particle
  constructor: (parameter_value, objective_value) ->
    @parameter_value = parameter_value
    @objective_value = objective_value
class ParticleStorage
  constructor: (parameter) ->
    @parameter = parameter
  shuffle:  ->
    @particles = new Array()
    @current_best_particle = null
    shuffling_i = 0
    while shuffling_i < @parameter.number_of_particles
      @add_random_particle()
      shuffling_i++

  check_best_particle: (new_particle) ->
    return  if @current_best_particle? and @current_best_particle.objective_value < new_particle.objective_value
    @parameter.on_best_particle_changes(new_particle) 
    @current_best_particle = new_particle

  add: (parameter_value, objective_value) ->
    particle = new Particle(parameter_value, objective_value)
    @particles.push particle
    @parameter.on_particle_creation particle
    @check_best_particle particle

  check_parameter_value_in_search_space: (parameter_value) ->
    parameter_i = 0
    while parameter_i < parameter_value.length
      dimension_value = parameter_value[parameter_i]
      search_space = @parameter.search_space[parameter_i]
      return @create_random_parameter_value() if dimension_value < search_space.min or dimension_value > search_space.max
      parameter_i++
    parameter_value

  create_random_parameter_value: () ->
    parameter_value = new Array()
    ri = 0
    while ri < @parameter.number_of_dimensions
      search_space = @parameter.search_space[ri]
      width = search_space.max - search_space.min
      parameter_value_xi = search_space.min + width * Math.random()
      parameter_value.push parameter_value_xi
      ri++
    parameter_value

  add_random_particle: ->
    parameter_value = @create_random_parameter_value()
    objective_value = @parameter.objective(parameter_value)
    @add parameter_value, objective_value

  # TODO: make create function, check distance, quasi-random
  pick_random_particle: ->
    index = Math.round(Math.random() * (@particles.length - 1))
    @particles[index]

Particle::dominates = (other) ->
  @objective_value < other.objective_value


Particle::to_string = ->
  display_float = (float) ->
     if float < 0.0000001
       0
     float
  parameter_value = "("
  for dimension_value in @parameter_value
     parameter_value += display_float(dimension_value) + ", "
  parameter_value += ")"
  objective_value = display_float @objective_value
  "parameter value: " + parameter_value + "<br/>objective value: " + objective_value
