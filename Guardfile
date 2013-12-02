# Traveller Guardfile
group 'traveller' do
  gem 'guard-coffeescript'
  guard 'coffeescript', :input => 'mixed_coffee', :output => 'executable'
  gem 'guard-rake'
  guard 'rake', :task => :mix_coffee do
    watch %r{^coffee/.+$}
  end
end
