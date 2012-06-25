worker_processes 2
working_directory "/srv/rails/www.broctf.org"

preload_app true

timeout 30

# This is where we specify the socket.
# We will point the upstream Nginx module to this socket later on
listen "/srv/rails/www.broctf.org/tmp/sockets/unicorn.sock", :backlog => 64

pid "/srv/rails/www.broctf.org/tmp/pids/unicorn.pid"

# Set the path of the log files inside the log folder of the testapp
stderr_path "/srv/rails/www.broctf.org/log/unicorn.stderr.log"
stdout_path "/srv/rails/www.broctf.org/log/unicorn.stdout.log"

before_fork do |server, worker|
# This option works in together with preload_app true setting
# What is does is prevent the master process from holding
# the database connection
  defined?(ActiveRecord::Base) and
    ActiveRecord::Base.connection.disconnect!
end

after_fork do |server, worker|
  ##
  # Unicorn master loads the app then forks off workers - because of the way
  # Unix forking works, we need to make sure we aren't using any of the parent's
  # sockets, e.g. db connection

  ActiveRecord::Base.establish_connection
  # Redis and Memcached would go here but their connections are established
  # on demand, so the master never opens a socket


  ##
  # Unicorn master is started as root, which is fine, but let's
  # drop the workers to git:git

  begin
    uid, gid = Process.euid, Process.egid
    user, group = 'http', 'http'
    target_uid = Etc.getpwnam(user).uid
    target_gid = Etc.getgrnam(group).gid
    worker.tmp.chown(target_uid, target_gid)
    if uid != target_uid || gid != target_gid
      Process.initgroups(user, target_gid)
      Process::GID.change_privilege(target_gid)
      Process::UID.change_privilege(target_uid)
    end
  rescue => e
    if RAILS_ENV == 'development'
      STDERR.puts "couldn't change user, oh well"
    else
      raise e
    end
  end
end
