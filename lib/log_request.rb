class LogRequest
  def initialize(app)
    @app = app
  end

  def call(env)
    app = @app.call(env)
    puts "ENV= #{app.inspect}"
    app
  end
end
