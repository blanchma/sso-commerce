require "erb"
require "cuba/safe"
require "cuba/render"
require_relative "lib/log_request"

Cuba.plugin Cuba::Render
Cuba.plugin Cuba::Safe

#Cuba.use AlwaysJSON
#Cuba.use LogRequest

Cuba.define do
  on get do
    on "auth" do
      puts req.params["code"]
      res.headers.delete('X-Frame-Options')

      render("home")
    end

    on root do
      puts req.inspect
      res.write({tute: 1}.to_json)
    end
  end
end
