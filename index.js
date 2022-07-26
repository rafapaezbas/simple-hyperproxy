const b4a = require('b4a')
const { crypto_generichash } = require('sodium-universal') // eslint-disable-line
const { pipeline } = require('streamx')
const DHT = require('@hyperswarm/dht')
const net = require('net')

module.exports = class SimpleHyperProxy {
  constructor (opts = {}) {
    this.opts = opts
    this.node = new DHT(opts)
    this.server = null
  }

  async expose (port, seed) {
    const server = this.node.createServer()
    server.on('connection', (socket) => {

    const socket_ = net.connect(port)
      pipeline(socket, socket_, socket)
    })

    const keyPair = seed ? DHT.keyPair(hash(Buffer.from(seed))) : DHT.keyPair()
    await server.listen(keyPair)
    return keyPair.publicKey
  }

  async bind (key, port = 0) {
    // TODO: support multiple proxies
    if (this.server) await this.server.close()

    return new Promise(resolve => {
      this.server = net.createServer((socket_) => {
        const socket = this.node.connect(key)
        pipeline(socket_, socket, socket_)
      })

      this.server.listen(port, () => {
        resolve(this.server.address().port)
      })
    })
  }

  destroy () {
    this.server.close()
    this.node.destroy()
  }
}

function hash (data) {
  const out = b4a.allocUnsafe(32)
  crypto_generichash(out, data) // eslint-disable-line
  return out
}
