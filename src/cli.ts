#!/usr/bin/env node
import { exit } from 'node:process'
import { pathExistsSync } from 'fs-extra'
import yargs, { Arguments } from 'yargs'
import svgtvc from './'

type ArgvResult = Arguments<{
  input: string
  output: string
}>

const argv = yargs
  .scriptName('svgtvc')
  .usage('$0 <cmd> [args]')
  .alias('i', 'input')
  .describe('i', 'Input directory relative to the root directory')
  .alias('o', 'output')
  .describe('o', 'Output directory')
  .alias('v', 'version')
  .describe('v', 'Show version number')
  .help('h')
  .alias('h', 'help')
  .locale('en').argv as ArgvResult

if (!pathExistsSync(argv.input)) {
  console.error('The input directory does not exist!', argv.input)
  exit()
}

svgtvc({
  input: argv.input,
  output: argv.output ?? 'dist',
  clean: true
})
  .then(() => {
    console.log('svgtcv: build successful!')
  })
  .catch((error) => {
    console.error('svgtcv accored error: ', error)
  })
