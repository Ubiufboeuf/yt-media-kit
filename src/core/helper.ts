import { PROGRAM_VERSION } from 'src/lib/constants'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

export function showHelp () {
  const terminalWidth = Math.max(yargs(hideBin(process.argv)).terminalWidth() - 24, 48)
  
  const argv = yargs(hideBin(process.argv))
    .usage('Usage: yt-media-kit [options] [url]')
    .option('dev', {
      describe: 'Ejecuta el programa en modo desarrollo. Esto omite cosas como la validación de los videos y activa otros parámetros forzadamente: --skip-validation y --use-default-video-id.'
    })
    .option('skip-validation', {
      describe: 'Omite la validación del video.'
    })
    .option('use-default-video-id', {
      describe: 'Usa un ID de video predefinido en vez de preguntar por él.'
    })
    .wrap(terminalWidth)
    .parseSync()

  console.log(argv)
}

export function showVersion () {
  console.log(PROGRAM_VERSION)
}
