// Export artboards for pretty diffs when document saved
import { sendEvent } from '../analytics'
import { checkForGitRepository, executeSafely, exportArtboards } from '../common'
import { getUserPreferences } from '../preferences'

export default function(context) {

  console.log("on save")
  context.document = context.actionContext.document
  context.document.showMessage('Hello, world2e!')
  
  let prefs = getUserPreferences(context)
  

  if (!prefs.autoExportOnSave || !checkForGitRepository(context)) { return }
  executeSafely(context, function () {
    sendEvent(context, 'Auto Export on save', 'Do export')
    exportArtboards(context, prefs)
    context.document.showMessage('Artboards exported')
  })
}
