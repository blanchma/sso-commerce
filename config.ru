require 'bundler/setup'
Bundler.require

require 'dotenv'
Dotenv.load

use Rack::Static,
  :urls => ["/images", "/js", "/css"],
  :root => 'public'
  
require './app'
run Cuba
