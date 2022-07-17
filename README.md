# Simple-Hyperproxy

P2P proxy built on top of [Hyperswarm DHT.](https://github.com/hyperswarm/dht)

```bash
npm install -g simple-hyperproxy
```

Requires Node version >= v14.17.0

## Usage

```bash
simple-hyperproxy expose [port]
# Exposed port on key [key]
```

```bash
simple-hyperproxy bind key
# Binded key on port [port] 
```

## Example

```js
const axios = require('axios');
const SimpleHyperProxy = require('simple-hyperproxy')
const proxy = new SimpleHyperProxy()

const server = http.createServer((req, res) => {
  // Define server
})

server.listen(8081, '127.0.0.1', () => {
})

const key = await proxy.expose(8081)
const bindPort = await proxy.bind(key)
console.log(await axios.get('http://localhost:' + bindPort))
```
