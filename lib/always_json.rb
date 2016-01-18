class AlwaysJSON
  def initialize(app)
    @app = app
  end

  def call(env)
    status, headers, body = @app.call(env)

    headers["Content-Type"]="application/json; charset=utf-8"

    [status, headers, body]
  end
end
