import prompts from 'prompts'
import type { Validation } from 'src/env'
import { errorHandler } from 'src/utils/errorHandler'
import { getVideoIdFromUrl } from 'src/utils/readUrl'
import { saveVideoInListOfSuggestions } from 'src/utils/saveVideoInList'
import { validateVideoId } from 'src/utils/validations'

export async function updateSuggestList () {
  const { input } = await prompts({
    message: 'ID o URL del video',
    type: 'text',
    name: 'input',
    validate: (value) => {
      if (!value || !value.trim()) {
        return 'No puedes ingresar un texto vacío'
      }
      return true
    }
  })

  let ytId = ''
  if (URL.canParse(input)) {
    const idFromUrl = getVideoIdFromUrl(input)
    if (idFromUrl) {
      ytId = idFromUrl
    }
  } else {
    ytId = input
  }
  
  let videoTitle = ''
  let validation: Validation
  try {
    validation = await validateVideoId(ytId)
  } catch (err) {
    errorHandler(err, null, false, true)
    return
  }
  
  if (!validation.success) {
    console.error(validation?.error || 'Error validando el video')
    return
  }

  videoTitle = validation.title
  
  await saveVideoInListOfSuggestions(ytId, videoTitle)
}
