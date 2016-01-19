class AllowIframe
  def initialize(app)
    @app = app
  end

  def call(env)
    status, headers, body = @app.call(env)
    headers.delete('X-Frame-Options')
    [status, headers, body]
  end
end
