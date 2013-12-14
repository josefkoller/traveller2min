# Boundary Handling...

class boundary_handler
  constructor: (search_space) ->
    @search_space = search_space

  check_parameter_value_in_search_space: (parameter_value) ->
    parameter_i = 0
    while parameter_i < parameter_value.length
      dimension_value = parameter_value[parameter_i]
      search_space = @search_space[parameter_i]
      if dimension_value < search_space.min
        parameter_value[parameter_i] = @boundary_action dimension_value,
          search_space.min, search_space.max
      else if dimension_value > search_space.max
        parameter_value[parameter_i] = @boundary_action dimension_value,
          search_space.max, search_space.min
      if parameter_value[parameter_i] < search_space.min or parameter_value[parameter_i] > search_space.max
        alert "boundary handler FAILED! " + dimension_value
      parameter_i++
    parameter_value

  boundary_action: (dimension_value, failed_boundary, other_boundary) ->
    choice = Math.random() * 4
    if choice < 1
      @create_random_dimension_value {min: failed_boundary, max: other_boundary}
    else if choice < 2
      @mirrow_dimension_value dimension_value, failed_boundary, other_boundary
    else if choice < 3
      @loop_dimension_value dimension_value, failed_boundary, other_boundary
    else
      @clamp_dimension_value dimension_value, failed_boundary, other_boundary

  clamp_dimension_value: (dimension_value, failed_boundary, other_boundary) ->
    failed_boundary

  loop_dimension_value: (dimension_value, failed_boundary, other_boundary) ->
    other_boundary - (failed_boundary - dimension_value) % failed_boundary

  mirrow_dimension_value: (dimension_value, failed_boundary, other_boundary) ->
    failed_boundary + (failed_boundary - dimension_value) % failed_boundary

  create_random_dimension_value: (search_space) ->
    width = search_space.max - search_space.min
    search_space.min + width * Math.random()

  create_random_parameter_value: () ->
    parameter_value = new Array()
    ri = 0
    while ri < @search_space.length
      search_space = @search_space[ri]
      parameter_value_xi = @create_random_dimension_value search_space
      parameter_value.push parameter_value_xi
      ri++
    parameter_value

