# multiplex-rpc-streams

RPC with streams using [multiplex](https://www.npmjs.org/package/multiplex)

[![build status](http://img.shields.io/travis/timhudson/multiplex-rpc-streams.svg?style=flat)](http://travis-ci.org/timhudson/multiplex-rpc-streams)

## Example

``` js
var rpc = require('multiplex-rpc-streams')

var server = rpc({
  range: function(start, end, stream) {
    var i = start
    while (i <= end) {
      stream.write(String(i++))
    }
    stream.end()
  },
  uppercase: function(str, stream) {
    stream.write(str.toUpperCase())
    stream.end()
  }
})

var client = rpc.client(['range', 'uppercase'])

client.pipe(server).pipe(client)

client.uppercase('crack! zlopp! urkk! biff! clank-est!')
  .pipe(process.stdout)

client.range(10, 20)
  .pipe(process.stdout)
```

## Usage

## rpc(methods={})

Each method can accept any number of expected arguments understanding that the last argument with always be a stream to respond to. This is a normal node stream that can written or pipe to.

``` js
var server = rpc({
  fetchActivity: function(from, to, stream) {
    db.activityStream(from, to)
      .pipe(stream)
  }
})
```

## rpc.client(methodNames=[])

Provide an array of method names which will then be exposed as methods on the returned `client`.

``` js
var client = rpc.client(['fetchActivity'])

client.fetchActivity('2014-11-07', '2014-12-07')
  .pipe(process.stdout)
```

You can also provide the method names as individual `String` arguments

``` js
var client = rpc.client('range', 'uppercase')
```

## License

MIT
