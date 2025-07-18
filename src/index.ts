import { say } from '@/utils/say'
import prompts from 'prompts'
import { startFullProcess } from './cli/fullProcess'
import { exit } from 'node:process'
import { isDevMode, setIsDevMode } from './lib/arguments'
import chalk from 'chalk'
console.clear()

const devMode = process.argv.some(a => a.toLowerCase() === 'dev')
setIsDevMode(devMode)

say('YT-Media-Kit', {
  colors: ['red', 'magenta']
})

if (isDevMode) {
  console.log(chalk.yellow('En modo desarrollo se omiten ciertas cosas como la comprobación del id del video para ahorrar tiempo'))
}

const processMode = await prompts({
  message: 'Elije el modo del programa',
  type: 'select',
  name: 'option',
  choices: [
    { title: 'Iterar Lista', value: 'iterateList' },
    { title: 'Completo', value: 'fullProcess' }
  ]
})

const modes: { [key: string]: () => (Promise<void> | void) } = {
  fullProcess: startFullProcess
}

const option: string = processMode.option
if (!option || !modes[option]) exit(0)

const mode = modes[option]
mode()
