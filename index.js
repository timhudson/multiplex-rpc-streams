var multiplex = require('multiplex')
var peek = require('peek-stream')
var safeParse = require('safe-json-parse/tuple')
var listenConnect = require('listen-connect')

module.exports = Server
module.exports.client = Client

function Server(methods) {
  if (!(this instanceof Server)) return new Server(methods)

  if (typeof methods !== 'object')
    throw new Error('Must provide a server object or array of method names')

  var mul = multiplex(function(stream, i) {
    var peekStream = peek(function(data, swap) {
      var parsed = safeParse(data)
      var err = parsed[0]
      var data = parsed[1]

      if (data && methods[data.method])
        return methods[data.method].apply(null, data.args.concat(stream))
    })

    stream.pipe(peekStream)
  })

  mul.close = function() {
    if (!mul.server) return mul.emit('error', new Error('No running server to close. Try running server.listen first.'))
    mul.server.close.apply(mul.server, arguments)
  }

  mul.listen = function() {
    var listen = listenConnect.createListen(function() {
      return Server(methods)
    })

    mul.server = listen.apply(null, arguments)
  }

  return mul
}

function Client(methods) {
  methods = Array.isArray(methods)
    ? methods : Array.prototype.slice.call(arguments, 0)

  if (!(this instanceof Client)) return new Client(methods)

  if (!methods)
    throw new Error('Must provide an array of method names')

  var mul = multiplex()

  mul.on('close', function() {
    if (mul.client) mul.client.destroy()
  })

  methods.forEach(function(method) {
    mul[method] = function() {
      var stream = (mul.client || mul).createStream()
      var args = Array.prototype.slice.call(arguments, 0)

      stream.write(JSON.stringify({
        method: method, args: args
      }) + '\n')

      return stream
    }
  })

  mul.connect = listenConnect.createConnect(function() {
    mul.client = Client(methods)
    return mul.client
  })

  return mul
}
