const { createServer } = require('http')
const { test } = require('brittle')
const SimpleHyperProxy = require('..')
const axios = require('axios')

test('expose and bind work', async ({ ok, plan, teardown }) => {
  plan(1)
  const hyperproxy = new SimpleHyperProxy()
  const server = await createHttpServer()
  const port = server.address().port

  teardown(() => {
    server.close()
    hyperproxy.destroy()
  })

  const key = await hyperproxy.expose(port)
  const newPort = await hyperproxy.bind(key)
  const response = await axios.get('http://localhost:' + newPort)
  ok(response.data === 'Hello World')
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
