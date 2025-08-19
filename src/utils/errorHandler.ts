export function errorHandler (err: unknown, baseMessage?: string, canShow = true) {
  let errorToShow = ''
  if (err instanceof Error && baseMessage) {
    errorToShow = `${baseMessage}: ${err.message}`
  } else if (err instanceof Error) {
    errorToShow = err.message
  } else if (baseMessage) {
    errorToShow = baseMessage
  } else {
    errorToShow = `Error desconocido: ${err}`
  }

  if (canShow) {
    console.error(errorToShow)
    return
  }

  return errorToShow
}
