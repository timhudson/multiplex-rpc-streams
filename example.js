var rpc = require('./')

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