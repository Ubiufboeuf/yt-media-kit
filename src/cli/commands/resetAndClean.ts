import { Rutas, Rutas_para_borrar } from '../../lib/constants'
import { unlink, rm, readdir } from 'node:fs/promises'
import { exit } from 'node:process'
import { oraPromise } from 'ora'
import prompts from 'prompts'
import { errorHandler } from 'src/utils/errorHandler'

export async function clearAll () {
  const FRASE_DE_SEGURIDAD = 'Estoy seguro, borra TODO'
  console.warn()
  const preguntaPorSeguridad = await prompts({
    message: `\
¿Seguro que quieres borrar TODO el contenido de TODAS las carpetas de recursos?
  ¡Esta acción es irreversible y solo pensada para desarrollo!
  (Si quieres hacer esto debes escribir: Estoy seguro, borra TODO)\n`,
    type: 'text',
    name: 'input',
    validate: (input) => input === FRASE_DE_SEGURIDAD ? true : 'Debes escribir exáctamente: Estoy seguro, borra TODO'
  })

  if (preguntaPorSeguridad.input === FRASE_DE_SEGURIDAD) {
    const promise = oraPromise(clearAllPromise, { successText: 'Se borraron todos los recursos', failText: 'Hubo un error borrando los recursos' })
    promise.then(() => exit(0))
    promise.catch((err) => {
      errorHandler(err)
      exit(1)
    })
  }
}

const clearAllPromise = async () => {
  for (const ruta of Object.values(Rutas_para_borrar)) {
    let contenido: string[] = []
    try {
      contenido = await readdir(ruta)
    } catch (err) {
      errorHandler(err, `Error leyendo la ruta ${ruta}`)
      continue
    }

    for (const archivo of contenido) {
      if (ruta === Rutas.completos || ruta === Rutas.assets) {
        // En linux todo es un archivo :v
        rm(`${ruta}/${archivo}`, { recursive: true, force: true })
        continue 
      }
      unlink(`${ruta}/${archivo}`)
    }
  }
}
