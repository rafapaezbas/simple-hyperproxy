const createTestnet = require('@hyperswarm/testnet')
const { createServer } = require('http')
const { test, solo } = require('brittle')
const SimpleHyperProxy = require('..')
const axios = require('axios')

test('expose and bind work', async ({ ok, plan, teardown }) => {
  plan(1)
  const testnet = await createTestnet(3)
  const hyperproxy = new SimpleHyperProxy({ bootstrap: testnet.bootstrap })
  const server = await createHttpServer()
  const port = server.address().port

  teardown(() => {
    server.close()
    hyperproxy.destroy()
    testnet.destroy()
  })

  const key = await hyperproxy.expose(port)
  const newPort = await hyperproxy.bind(key)
  const response = await axios.get('http://localhost:' + newPort)
  ok(response.data === 'Hello World')
})

solo('stress test', async ({ pass, plan, teardown }) => {
  plan(1)
  const testnet = await createTestnet(3)
  const hyperproxy = new SimpleHyperProxy({ bootstrap: testnet.bootstrap })
  const server = await createHttpServer()
  const port = server.address().port

  teardown(() => {
    server.close()
    hyperproxy.destroy()
    testnet.destroy()
  })

  const key = await hyperproxy.expose(port)
  const newPort = await hyperproxy.bind(key)

  console.time()

  const requests = []
  for (let i = 0; i < 75; i++) {
    requests.push(axios.get('http://localhost:' + newPort))
  }

  await Promise.all(requests)

  console.timeEnd()

  pass()
})

async function createHttpServer () {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/plain')
      res.end('Hello World')
    })
    server.listen(0, '127.0.0.1', () => {
      resolve(server)
    })
  })
}
