require "erb"
require "cuba/safe"
require "cuba/render"

Dir["./lib/**/*.rb"].each { |f| require(f) }


Cuba.plugin Cuba::Render
Cuba.plugin Cuba::Safe

$redis = Redic.new(ENV['REDISCLOUD_URL'])
$http = HTTPClient.new

#Cuba.use AlwaysJSON
#Cuba.use LogRequest
Cuba.use AllowIframe

Cuba.define do
  on get do
    on "login" do

      render("slogin")
    end
    on "auth" do
      puts "/auth?code=#{req.params["code"]}"

      response = $http.post("https://login.bigcommerce.com/oauth2/token",
                          {client_id: 'cy8d21z8c50wopqadkixm4rbacv5bdp',
                          client_secret: 'avzqq743oddpq5oe8gz54n66s7yrpma',
                          code: req.params["code"],
                          scope: req.params["scope"],
                          grant_type: 'authorization_code',
                          redirect_uri: 'https://sso-commerce.herokuapp.com/auth',
                          context: req.params["context"],
                    }).body

      puts "BigCommerce Response: #{response}"

      $redis.call("RPUSH", "tokens", response["access_token"])
      $redis.call("SET", response["id"], response)


      render("post-installation", username: response["username"])
    end

    on "load" do
      payload = SignedPayload.verify(req.params["signed_payload"], 'avzqq743oddpq5oe8gz54n66s7yrpma') if req.params["signed_payload"]
      puts payload.inspect

      render("home", payload: payload)
    end

    on root do
      puts req.inspect
      res.write({tute: 1}.to_json)
    end
  end
end
