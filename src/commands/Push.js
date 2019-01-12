// Push (cmd alt ctrl p)
import { sendEvent } from '../analytics'
import { _,checkForFile, executeSafely, exec, createInfoAlert } from '../common'

export default function (context) {
  if (!checkForFile(context)) { return }
  var i18=_(context)
  executeSafely(context, function () {
    sendEvent(context, 'Push', 'Push to remote')
    exec(context, 'git -c push.default=current push -q')
    context.document.showMessage(i18.push.m1)
  })
}
