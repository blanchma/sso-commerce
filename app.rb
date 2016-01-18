require "cuba/safe"
require_relative "lib/always_json"
require_relative "lib/log_request"

Cuba.plugin Cuba::Safe

Cuba.use AlwaysJSON
Cuba.use LogRequest

Cuba.define do
  on get do
    on "auth" do
      puts req
      res.write "Hello world!"
    end

    on root do
      puts req.inspect
      res.write({tute: 1}.to_json)
    end
  end
end
