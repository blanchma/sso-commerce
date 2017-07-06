require "erb"
require "cuba"
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
    on "set" do
      render("set", layout: false)
    end

    on "get" do
      render("get", layout: false)
    end

    on "store" do
      render("store", layout: false)
    end

    on "login" do
      render("login", layout: false)
    end

    on "register" do
      render("register", layout: false)
    end


    on "hub" do
      puts "HUB"
      res.headers["Content-Type"]="text/html; charset=utf-8"
      render("hub", layout: false)
    end

    on "auth" do
      puts "/auth?code=#{req.params["code"]}"

      response = $http.post("https://login.bigcommerce.com/oauth2/token",
                          {client_id: 'kkfrl4g26inth5e3v3o5fut3xmg741s', #'tlaonydhwjsqe7qigbh5zsg2pvhn9v9',
                          client_secret: '1a6nqvaksa8a0yr34c0p6wrteri5n9p',#'sr03dazzxc7kz10yk9ku51tzreamtmy',
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
