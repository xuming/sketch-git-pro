// Pull
import { sendEvent } from '../analytics'
import { checkForFile, executeSafely, exec, checkForRemote,setIconForAlert, createInfoAlert, reOpenDocument, getCurrentBranch } from '../common'
function doConfirm(context) {
  var accessory = NSView.alloc().initWithFrame(NSMakeRect(0, 0, 300, 50))
  var alert = NSAlert.alloc().init()
  alert.setMessageText("本地文件已经存在，请选择操作方式：")
  alert.addButtonWithTitle('合并')
  alert.addButtonWithTitle('覆盖')
  alert.addButtonWithTitle("取消")
  setIconForAlert(context, alert)
  alert.setAccessoryView(accessory)
  var responseCode = alert.runModal()
  
  return responseCode
}


export default function (context) {
  if (!checkForFile(context)) { return }
  if (!checkForRemote(context)){return }
  var branchname = getCurrentBranch(context)
    
  var responseCode=doConfirm(context) 
  if (responseCode==1002){
    return
  }else if (responseCode==1001){//覆盖 
    executeSafely(context, function () {
      sendEvent(context, 'Pull', 'Pull remote')
      //强制拉取并覆盖本地文件 
      exec(context,`git fetch --all; git reset --hard origin/${branchname};git pull -q;git checkout ;`)
      context.document.showMessage('拉取数据成功！')
    })
  }else{//合并 
    

    executeSafely(context, function () {
      sendEvent(context, 'Pull', 'Pull remote')
      //强制拉取并覆盖本地文件 
      exec(context,`git pull origin ${branchname} -q;git checkout `)
      context.document.showMessage('拉取数据成功！')
    })
  }

  reOpenDocument(context)
 
  

  
}
