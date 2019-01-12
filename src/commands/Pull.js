// Pull
import { sendEvent } from '../analytics'
import {_, checkForFile, executeSafely, exec, checkForRemote,setIconForAlert, createInfoAlert, reOpenDocument, getCurrentBranch } from '../common'
function doConfirm(context) {
  var i18=_(context)
  var accessory = NSView.alloc().initWithFrame(NSMakeRect(0, 0, 300, 50))
  var alert = NSAlert.alloc().init()
  alert.setMessageText(i18.pull.m1)
  alert.addButtonWithTitle(i18.pull.m2)
  alert.addButtonWithTitle(i18.pull.m3)
  alert.addButtonWithTitle(i18.common.cancel)
  setIconForAlert(context, alert)
  alert.setAccessoryView(accessory)
  var responseCode = alert.runModal()
  
  return responseCode
}


export default function (context) {
  if (!checkForFile(context)) { return }
  if (!checkForRemote(context)){return }
  var branchname = getCurrentBranch(context)
  var i18=_(context)  
  var responseCode=doConfirm(context) 
  if (responseCode==1002){
    return
  }else if (responseCode==1001){//覆盖 
    executeSafely(context, function () {
      sendEvent(context, 'Pull', 'Pull remote')
      //强制拉取并覆盖本地文件 
      exec(context,`git fetch --all; git reset --hard origin/${branchname};git pull -q;git checkout ;`)
      context.document.showMessage(i18.pull.m4)
    })
  }else{//合并 
    

    executeSafely(context, function () {
      sendEvent(context, 'Pull', 'Pull remote')
      //强制拉取并覆盖本地文件 
      exec(context,`git pull origin ${branchname} -q;git checkout `)
      context.document.showMessage(i18.pull.m4)
    })
  }

  reOpenDocument(context)
 
  

  
}
