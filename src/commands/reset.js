// Push (cmd alt ctrl p)
import { sendEvent } from '../analytics'
import { _,checkForFile, executeSafely, exec, createConfirm, reOpenDocument, unzipFile } from '../common'
import { getUserPreferences } from '../preferences';

export default function (context) {
  if (!checkForFile(context)) { return }
  var i18=_(context)
  if(createConfirm(context,i18.reset.m1,i18.common.ok,i18.common.cancel)){
    executeSafely(context, function () {
      exec(context, 'git reset --hard HEAD;git checkout;')
      context.document.showMessage(i18.reset.m2)
      
      reOpenDocument(context)
    })
  }
 
}
