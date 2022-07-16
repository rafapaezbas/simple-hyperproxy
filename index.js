const { once } = require('events')
const { pipeline } = require('streamx')
const DHT = require('@hyperswarm/dht')
const net = require('net')

module.exports = class SimpleHyperProxy {
  constructor (opts = {}) {
    this.opts = opts
    this.node = new DHT(opts)
  }

  async expose (port) {
    const server = this.node.createServer()
    server.on('connection', (socket) => {
      const socket_ = net.connect(port)
      pipeline(socket, socket_, socket)
    })
    const keyPair = DHT.keyPair()
    await server.listen(keyPair)
    return keyPair.publicKey
  }

  async bind (key) {
    return new Promise(resolve => {
      const server = net.createServer(async (socket_) => {
        const socket = this.node.connect(key)
        await once(socket, 'open')
        pipeline(socket_, socket, socket_, () => {
          server.close()
        })
      })

      server.listen(0, () => {
        resolve(server.address().port)
      })
    })
  }

  destroy () {
    this.node.destroy()
  }
}
