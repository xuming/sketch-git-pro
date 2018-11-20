// Push (cmd alt ctrl p)
import { sendEvent } from '../analytics'
import { checkForFile, executeSafely, exec, createConfirm, reOpenDocument, unzipFile } from '../common'
import { getUserPreferences } from '../preferences';

export default function (context) {
  if (!checkForFile(context)) { return }
  if(createConfirm(context,"是否撤销本地修改？","确定","取消")){
    executeSafely(context, function () {
      exec(context, 'git reset --hard HEAD;git checkout;')
      context.document.showMessage('撤销成功')
      
      reOpenDocument(context)
    })
  }
 
}
