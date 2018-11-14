// Commits all working file to git (cmd alt ctrl c)
import { sendEvent } from '../analytics'
import { getCurrentBranch, checkForFile, executeSafely, exec, createInputWithCheckbox, getGitDirectory,checkForSketchgitFolder, createInfoAlert } from '../common'
import { getUserPreferences, setUserPreferences } from '../preferences'

var sketch = require('sketch/dom')

export default function (context) {
  if (!checkForFile(context)) { return }
  executeSafely(context, function () {
    if (!checkForSketchgitFolder(context)){return}
    sendEvent(context, 'Commit', 'Start commiting')
    var currentBranch = getCurrentBranch(context)
    const prefs = getUserPreferences(context)
    var commitMsg = createInputWithCheckbox(context, '提交更新到 "' + currentBranch + '" ，请输入更新说明', '推送到远程服务器', prefs.autoPushOnCommit, 'Commit')

    if (commitMsg.responseCode == 1000 && commitMsg.message != null) {
      var gitDir=getGitDirectory(context)
      sendEvent(context, 'Commit', 'Do commit')
      var command = `cd ${gitDir};git add .sketchgit;git commit -m "${commitMsg.message.split('"').join('\\"')}" -a; exit`
      try
      {
        var message = exec(context, command)
        context.document.showMessage(message.split('\n').join(' '))
  
      }catch(e){
        var err=String(e.reason)
        if (err.indexOf('nothing to commit')>-1){
          createInfoAlert(context, '提示', '文件没有被修改，不需要提交')
        }else{
          createInfoAlert(context, '提示', e)
        }
        return
      }
      
      prefs.autoPushOnCommit=commitMsg.checked
      setUserPreferences(context,prefs)
      if (commitMsg.checked) {
        message=exec(context, 'git -c push.default=current push -q')
        context.document.showMessage(message.split('\n').join(' '))
        return
      }
    }
  })
}
