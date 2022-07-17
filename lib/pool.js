const net = require('net')

class NetSocketPool {
  constructor (port, min, max) {
    this.pool = []
    this.port = port
    this.min = min
    this.max = max || min
    this.destroyed = false
    this.create()
  }

  create () {
    while (this.pool.length < this.min) {
      this.pool.push(net.connect(this.port))
    }
  }

  get () {
    if (this.pool.length) {
      return this.pool.pop()
    } else {
      return net.connect(this.port)
    }
  }

  reload () {
    if (this.pool.length < this.max) {
      this.pool.push(net.connect(this.port))
    }
  }

  destroy () {
    this.pool.forEach(s => s.destroy())
  }
}

module.exports = {
  NetSocketPool
}
