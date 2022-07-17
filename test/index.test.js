const createTestnet = require('@hyperswarm/testnet')
const { createServer } = require('http')
const { test, solo } = require('brittle') // eslint-disable-line
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
  ok(response.data === 'Hello World', 'Received data is ok')
})

test('stress test', async ({ is, plan, pass, teardown }) => {
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
  for (let i = 0; i < 150; i++) {
    requests.push(axios.get('http://localhost:' + newPort))
  }

  await Promise.all(requests)
  console.timeEnd()

  const results = []
  for await (const request of requests) {
    results.push(request.data === 'Hello World')
  }

  is((results.filter(e => e === true).length), 150, 'All results are ok')
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
