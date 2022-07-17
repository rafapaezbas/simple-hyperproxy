#!/usr/bin/env node

import SimpleHyperProxy from './index.js'
const command = process.argv[2]

const proxy = new SimpleHyperProxy()

if (command === 'expose') {
  const port = process.argv[3]
  const seed = process.argv[4]
  const key = await proxy.expose(port, seed)
  console.log(`Exposed localhost:${port} in key ${key.toString('hex')}`)
} else if (command === 'bind') {
  const key = Buffer.from(process.argv[3], 'hex')
  const port = await proxy.bind(key)
  console.log(`Binded ${key} to port ${port}`)
} else {
  printHelp()
}

function printHelp () {
  console.log(`
Simple Hyperproxy v.0.1.0

  Commands:

  simple-hyperproxy expose [port] [seed]
  simple-hyperproxy bind [key]

`)
  process.exit()
}
