import { say } from '../patched/say'
import prompts from 'prompts'
import { exit } from 'node:process'
import chalk from 'chalk'
import { fullProcess } from '../cli/commands/fullProcess'
import { clearAll } from '../cli/commands/resetAndClean'
import type { Modes } from '../env'
import { loadProcessParams } from 'src/core/process'
import { updateSuggestList } from './commands/updateSuggestList'
import { showHelp, showVersion } from 'src/core/helper'
import { videoContext } from 'src/core/context'
import { download } from './commands/download'

const params = loadProcessParams()

async function main () {
  console.clear()

  say('YT-Media-Kit', {
    colors: ['red', 'magenta']
  })

  if (params.isDevMode) {
    console.log(chalk.yellow('En modo desarrollo se omiten ciertas cosas como la comprobación del id del video para ahorrar tiempo'))
  }

  const processMode = await prompts({
    message: 'Elige el modo del programa',
    type: 'select',
    name: 'option',
    choices: [
      { title: 'Iterar Lista', description: 'Proceso para varios video a la vez', value: 'iterateList' },
      { title: 'Proceso Completo', description: 'Proceso para un video a la vez', value: 'fullProcess' },
      { title: 'Actualizar Lista de Sugeridos', value: 'updateSuggestList' },
      { title: 'Descargar', value: 'download' },
      { title: 'Limpiar Todo', value: 'clearAll' }
    ]
  })

  // Funciones para ejecutar los modos
  const modes: Modes = {
    fullProcess,
    updateSuggestList,
    download,
    clearAll
  }

  const option: string = processMode.option
  if (!option || !modes[option]) exit(0)

  const mode = modes[option]

  videoContext.run({ id: crypto.randomUUID() }, mode)
}

if (params.interactiveMode) {
  main()
}

if (params.help) {
  showHelp()
}

if (params.version) {
  showVersion()
}
