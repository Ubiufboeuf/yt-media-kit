import { say } from '../patched/say'
import prompts from 'prompts'
import { exit } from 'node:process'
import chalk from 'chalk'
import { fullProcess } from '../cli/commands/fullProcess'
import { clearAll } from '../cli/commands/resetAndClean'
import type { Modes } from '../env'
import { loadProcessParams } from 'src/core/process'
console.clear()

const params = loadProcessParams()

say('YT-Media-Kit', {
  colors: ['red', 'magenta']
})

if (params.isDevMode) {
  console.log(chalk.yellow('En modo desarrollo se omiten ciertas cosas como la comprobación del id del video para ahorrar tiempo'))
}

const processMode = await prompts({
  message: 'Elije el modo del programa',
  type: 'select',
  name: 'option',
  choices: [
    { title: 'Iterar Lista', value: 'iterateList' },
    { title: 'Completo', value: 'fullProcess' },
    { title: 'Limpiar Todo', value: 'clearAll' }
  ]
})

// Funciones para ejecutar los modos
const modes: Modes = {
  fullProcess,
  clearAll
}

const option: string = processMode.option
if (!option || !modes[option]) exit(0)

const mode = modes[option]
mode()
