'use strict'

const net = require('net')

const server = net.createServer(socket => {
  socket.pipe(process.stdout)
})

server.listen(3001)
