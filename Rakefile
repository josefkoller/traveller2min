desc "concats the coffee subscripts"
task :mix_coffee do
  sh "coffeescript-concat -I coffee/optimization -I coffee/graphicmode -o mixed_coffee/traveller2min.coffee"
  sh "coffeescript-concat -I coffee/optimization -I coffee/fastmode -o mixed_coffee/fastmode/traveller2min_fastmode.coffee"
end

desc 'downloads and installs c3dl'
task :install_c3dl do
  c3dl = 'c3dl-2.2.zip'
  exec "curl -O http://www.c3dl.org/wp-content/releases/#{c3dl};
        unzip #{c3dl};
        mv c3dl canvas3dapi;
        rm #{c3dl}"
end

desc 'starts the application'
task :start do
  exec 'open executable/traveller.html'
end

task :default => :start
