#!/usr/bin/env node

import SimpleHyperProxy from './index.js'

const command = process.argv[2]
const proxy = new SimpleHyperProxy()

const args = process.argv.slice(3)

if (command === 'expose') {
  const port = args[0]
  const seed = args[1]
  const key = await proxy.expose(port, seed)
  console.log(`Exposed localhost:${port} in key ${key.toString('hex')}`)
} else if (command === 'bind') {
  const key = Buffer.from(args[0], 'hex')
  const port = await proxy.bind(key, args[1])
  console.log(`Binded ${key.toString('hex')} to port ${port}`)
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
