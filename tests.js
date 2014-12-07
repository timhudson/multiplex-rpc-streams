var test = require('tape')
var concat = require('concat-stream')
var rpc = require('./')

test('multiplex-rpc', function(t) {
  t.plan(6)

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

  var count  = 10
  client.range(10, 14)
    .on('data', function(data) {
      t.equal(data.toString(), String(count++))
    })

  client.uppercase('crack! zlopp! urkk! biff! clank-est!')
    .pipe(concat(function(data) {
      t.equal(data.toString(), 'CRACK! ZLOPP! URKK! BIFF! CLANK-EST!')
    }))
})
