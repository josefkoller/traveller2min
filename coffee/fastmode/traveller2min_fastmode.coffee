# traveller2min fastmode

#= require <../stochastic_optimization>
#= require <../differential_evolution>
#= require <../particle_swarm_optimization>
#= require <../mu_over_rho_comma_lambda>
#= require <../performance_functions>


$(document).ready( ->
  clear_table = ->
    $('#results tr').remove()
    $('#results').append '<tr><td>objective value</td><td>parameter value</td><td>squared difference from average</td></tr>'
  $('#clear_button').click clear_table
  $('#run_button').click( ->
    clear_table()

    selected_objective_index = $('#objective_select')[0].selectedIndex
    algorithm_parameter = eval 'parameter' + (selected_objective_index + 1)
    #7, 10... more than 1 min
    algorithm_parameter.number_of_iterations = parseInt($('#number_of_iterations').val())
    algorithm_parameter.number_of_particles = parseInt($('#number_of_particles').val())
    create_algorithm = (parameter) ->
      selected_algorithm_index = $('#algorithm_select')[0].selectedIndex
      parameter.fast_mode = true
      new mu_over_rho_comma_lambda parameter if selected_algorithm_index == 2
      new particle_swarm_optimization parameter if selected_algorithm_index == 1
      new differential_evolution parameter

    write = (data) ->
      $('#output').append data
    best_particles = new Array()
    number_of_runs = parseInt($('#number_of_runs').val())
    current_run = 1
    start_run = () ->
      current_run++ < number_of_runs
    run = () ->
      parameter = algorithm_parameter
      parameter.termination_logic = (best_particle) ->
        best_particles.push best_particle
        progress = (current_run/number_of_runs*100).toFixed(2)+'%'
        $('#progress').html progress
        write '.'
        if start_run()
          if (current_run+1) % 100 == 0
            window.setTimeout run,1
          else
            run()
        else
          terminate()
      algorithm = create_algorithm parameter
      algorithm.run()
    output_results = () ->
      results = $('#results')
      for particle in best_particles
        row = $('<tr>')
        col1 = $('<td>')
        col1.append particle.objective_value
        row.append col1
        col2 = $('<td>')
        col2.append particle.parameter_value_to_string()
        row.append col2
        results.append row
    output_average_objective_value = () ->
      objective_sum = 0
      for particle in best_particles
        objective_sum += particle.objective_value
      objective_average = objective_sum / best_particles.length
      $('#average_objective_value').html objective_average
    output_average_parameter_value = () ->
      parameter_value_sum = []
      for j in [0...best_particles[0].parameter_value.length]
        parameter_value_sum.push 0
      for i in [0...best_particles.length]
        particle = best_particles[i]
        for j in [0...particle.parameter_value.length]
          dimension_value = particle.parameter_value[j]
          parameter_value_sum[j] += dimension_value
      parameter_value_average = []
      $('#average_parameter_value').html ''
      for j in [0...parameter_value_sum.length]
        dimension_sum = parameter_value_sum[j]
        dimension_average = dimension_sum / best_particles.length
        $('#average_parameter_value').append(dimension_average+' | ')
        dimension_average

    RED='#ee0101'
    output_variance_parameter_value = (average) ->
      sum_of_squared_differences = []
      for j in [0...best_particles[0].parameter_value.length]
        sum_of_squared_differences.push 0
      for i in [0...best_particles.length]
        particle = best_particles[i]
        squared_differences = []
        is_far_away_from_average = false
        for j in [0...particle.parameter_value.length]
          dimension_value = particle.parameter_value[j]
          dimension_difference = dimension_value - average[j]
          squared_difference = dimension_difference*dimension_difference
          squared_differences.push squared_difference
          sum_of_squared_differences[j] += squared_difference
          is_far_away_from_average = true if squared_difference > 0.01
        squared_difference_text = format_vector squared_differences
        cell = $('<td>').append(squared_difference_text)
        cell.css 'background', RED if is_far_away_from_average
        $('#results tr:nth('+(i+1)+')').append cell
      $('#variance_parameter_value').html ''
      $('#variance_parameter_value').css 'background','transparent'
      is_high_variance = false
      for j in [0...sum_of_squared_differences.length]
        dimension_difference_sum = sum_of_squared_differences[j]
        dimension_variance = dimension_difference_sum / (best_particles.length-1)
        $('#variance_parameter_value').append(dimension_variance+' | ')
        is_high_variance = true if dimension_variance > 0.01
      if is_high_variance
        $('#variance_parameter_value').css('background',RED)


    output_statistic = () ->
      $('#output').html 'calculating statistics...'
      output_average_objective_value()
      average = output_average_parameter_value()
      output_variance_parameter_value average
      $('#output').html ''

    terminate = () ->
      output_results()
      output_statistic()
    run()
    false
  )
)
