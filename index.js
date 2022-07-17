const { pipeline } = require('streamx')
const DHT = require('@hyperswarm/dht')
const net = require('net')

module.exports = class SimpleHyperProxy {
  constructor (opts = {}) {
    this.opts = opts
    this.node = new DHT(opts)
    this.server = null
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
      this.server = net.createServer((socket_) => {
        const socket = this.node.connect(key)
        pipeline(socket_, socket, socket_)
      })

      this.server.listen(0, () => {
        resolve(this.server.address().port)
      })
    })
  }

  destroy () {
    this.server.close()
    this.node.destroy()
  }
}
