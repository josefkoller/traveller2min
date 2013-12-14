# example parameters - performance functions

square = (x) -> x * x

parameter1 = {}
parameter1.objective_name = 'beales'
parameter1.objective = (X) ->
  x = X[0]
  y = X[1]
  square(1.5 - x + x * y) + square(2.25 - x + x * y * y) + square(2.625 - x + x * y * y * y)
parameter1.search_space = [(min: -4.5, max: 4.5),(min: -4.5, max: 4.5)]
parameter1.number_of_dimensions = 2
parameter1.number_of_particles = 64 
parameter1.number_of_iterations = 30

parameter2 = {}
parameter2.objective_name = 'rosenbrock'
parameter2.objective = (X) ->
	x = X[0]
	y = X[1]
	(100*square(y-x*x)+square(y-1))
parameter2.search_space = [(min: -0.5, max: 3),(min: -1.5, max: 2.0)]
parameter2.number_of_dimensions = 2
parameter2.number_of_particles = 64
parameter2.number_of_iterations = 50

parameter3 = {}
parameter3.objective_name = 'goldstein-price'
parameter3.objective = (X) ->
  x = X[0]
  y = X[1]
  (1+square(x+y+1)*(19-14*x+3*x*x-14*y+6*x*y+3*y*y))*(30+square(2*x-3*y)*(18-32*x+12*x*x+48*y-36*x*y+27*y*y))
parameter3.search_space = [(min: -1.5, max: 1.5),(min: -1.5, max: 1.5)]
parameter3.number_of_dimensions = 2
parameter3.number_of_particles = 64
parameter3.number_of_iterations = 200

parameter4 = {}
parameter4.objective_name = 'bukin function n. 6'
parameter4.objective = (X) ->
  x = X[0]
  y = X[1]
  (100*Math.sqrt(Math.abs(y-0.01*x*x))+0.01*Math.abs(x+10))
parameter4.search_space = [(min: -15, max: -5),(min: -3, max: 3)]
parameter4.number_of_dimensions = 2
parameter4.number_of_particles = 256
parameter4.number_of_iterations = 1000

parameter5 = {}
parameter5.objective_name = 'ackleys'
parameter5.objective = (X) ->
  x = X[0]
  y = X[1]
  (-20*Math.exp(-0.2*Math.sqrt(0.5*(x*x+y*y)))-
    Math.exp(0.5*(Math.cos(2*Math.PI*x)+Math.cos(2*Math.PI*y)))+
    20+Math.exp(1))
parameter5.search_space = [(min: -5, max: 5),(min: -5, max: 5)]
parameter5.number_of_dimensions = 2
parameter5.number_of_particles = 64
parameter5.number_of_iterations = 200

parameter6 = {}
parameter6.objective_name = 'matyas'
parameter6.objective = (X) ->
  x = X[0]
  y = X[1]
  (0.26*(x*x+y*y)-0.48*x*y)
parameter6.search_space = [(min: -10, max: 10),(min: -10, max: 10)]
parameter6.number_of_dimensions = 2
parameter6.number_of_particles = 64
parameter6.number_of_iterations = 200

parameter7 = {}
parameter7.objective_name = 'hoelder table'
parameter7.objective = (X) ->
  x = X[0]
  y = X[1]
  (-Math.abs(Math.sin(x)*Math.cos(y)*Math.exp(Math.abs(1-(Math.sqrt(x*x+y*y)/Math.PI)))))
parameter7.search_space = [(min: -10, max: 10),(min: -10, max: 10)]
parameter7.number_of_dimensions = 2
parameter7.number_of_particles = 64
parameter7.number_of_iterations = 400

parameter8 = {}
parameter8.objective_name = 'schaffer function n.3'
parameter8.objective = (X) ->
  x = X[0]
  y = X[1]
  (0.5+(square(Math.sin(x*x-y*y))-0.5)/square(1+0.001*(x*x+y*y)))
parameter8.search_space = [(min: -100, max: 100),(min: -100, max: 100)]
parameter8.number_of_dimensions = 2
parameter8.number_of_particles = 64 
parameter8.number_of_iterations = 800 

parameter9 = {}
parameter9.objective_name = 'styblinski-tang'
parameter9.objective = (X) ->
  z = 0
  for x in X
    z += x*x*x*x - 16*x*x + 5*x
  z*0.5
parameter9.search_space = []
for i in [1..20]
  parameter9.search_space.push(min: -5, max: 5)
parameter9.number_of_dimensions = parameter9.search_space.length
parameter9.number_of_particles = 2000
parameter9.number_of_iterations = 200

parameter10 = {}
parameter10.objective_name = 'six-hump camel back'
parameter10.objective = (X) ->
  x = X[0]
  y = X[1]
  x2 = x*x
  x4 = x2*x2
  y2 = y*y
  (4 - 2.1*x2 + x4/3)*x2 + x*y + (-4 + 4*y2)*y2
parameter10.search_space = [
  ( min: -3, max: 3 ),
  ( min: -3, max: 3 )
]
parameter10.number_of_dimensions = 2
parameter10.number_of_particles = 64
parameter10.number_of_iterations = 100

parameter11 = {}
parameter11.objective_name = 'drop wave'
parameter11.objective = (X) ->
  x = X[0]
  #y = X[1]
  gsum = x*x # + y*y
  -(1 + Math.cos(12*Math.sqrt(gsum))) / (0.5*gsum + 2)
search_space11 = ( min: -Math.PI*2, max: Math.PI*2 )
parameter11.search_space = [search_space11, search_space11]
parameter11.number_of_dimensions = 1
parameter11.number_of_particles = 100
parameter11.number_of_iterations = 100

parameter12 = {}
parameter12.objective_name = "random shekel's foxholes"
parameter12.objective = (X) ->
  z = 0
  m = 30
  for x in X
    c = Math.random()
    for i in [1...m]
      a = Math.random()
      z += 1/(square(x - a) + c)
  -z
search_space12 = (min: 0, max: 1)
parameter12.search_space = [search_space12, search_space12]
parameter12.number_of_dimensions = 2
parameter12.number_of_particles = 128
parameter12.number_of_iterations = 300

