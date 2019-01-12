// Commits all working file to git (cmd alt ctrl c)
import { sendEvent } from '../analytics'
import { _,getCurrentBranch, checkForFile, executeSafely, exec, createInputWithCheckbox, getGitDirectory,checkForSketchgitFolder, createInfoAlert } from '../common'
import { getUserPreferences, setUserPreferences } from '../preferences'

var sketch = require('sketch/dom')

export default function (context) {
  var i18 = _(context);
  if (!checkForFile(context)) { return }
  executeSafely(context, function () {
    if (!checkForSketchgitFolder(context)){return}
    sendEvent(context, 'Commit', 'Start commiting')
    var currentBranch = getCurrentBranch(context)
    const prefs = getUserPreferences(context)
    var commitMsg = createInputWithCheckbox(context, i18.commit.m1.replace('{branch}',currentBranch), i18.commit.m2, prefs.autoPushOnCommit, i18.commit.m3)

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
          createInfoAlert(context,i18.common.info, i18.commit.m4)
        }else{
          createInfoAlert(context, i18.common.info, e)
        }
        return
      }
      
      prefs.autoPushOnCommit=commitMsg.checked
      setUserPreferences(context,prefs)
      if (commitMsg.checked) {
        message=exec(context, 'git -c push.default=current push -q')
        context.document.showMessage(i18.commit.m5)
        return
      }
    }
  })
}
