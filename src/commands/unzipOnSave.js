// Export artboards for pretty diffs when document saved
import { sendEvent } from '../analytics'
import { checkIsGitRepository, executeSafely, unzipFile } from '../common'
import { getUserPreferences } from '../preferences'

export default function(context) {

  
  context.document = context.actionContext.document
  let prefs = getUserPreferences(context)
  if (!checkIsGitRepository(context)) { return }
  executeSafely(context, function () {
    sendEvent(context, 'Auto unzip on save', 'Do unzip')
    unzipFile(context,prefs)
    context.document.showMessage('file saved')
  })
}
