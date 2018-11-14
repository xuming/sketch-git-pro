// Pull
import { sendEvent } from '../analytics'
import { checkForFile, executeSafely, exec, checkForRemote,setIconForAlert, createInfoAlert } from '../common'
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
  var responseCode=doConfirm(context) 
  if (responseCode==1002){
    return
  }else if (responseCode==1001){//覆盖 
    executeSafely(context, function () {
      sendEvent(context, 'Pull', 'Pull remote')
      //强制拉取并覆盖本地文件 
      exec(context,'git fetch --all; git reset --hard origin/master;git pull -q;git checkout ')
      context.document.showMessage('拉取数据成功！')
    })
  }else{//合并 
    executeSafely(context, function () {
      sendEvent(context, 'Pull', 'Pull remote')
      //强制拉取并覆盖本地文件 
      exec(context,'git pull -q;git checkout ')
      context.document.showMessage('拉取数据成功！')
    })
  }

  // var app = NSApp.delegate()
  // app.refreshCurrentDocument()

  var sketch = require('sketch/dom')
  var document = sketch.fromNative(context.document)
  document.close()

  sketch.Document.open(context.document.fileURL(),(err, document) => {
    if (err) {
      // oh no, we failed to open the document
      console.log(err)
    }else{
      console.log(document.sketchObject)
    }
  })
  console.log(context.document.documentData())
  

  
}
