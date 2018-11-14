// Init git repo and add current file to the repo (cmd alt ctrl n)
import { sendEvent } from '../analytics'
import { checkForFile, getCurrentFileName, executeSafely, exec,unzipFile, createInput, createFailAlert, checkIsGitRepository } from '../common'
import { } from 'sketch-module-fs'
import { getUserPreferences } from '../preferences'
export default function (context) {
  if (!checkForFile(context)) { return }
  executeSafely(context, function () {
    var currentFileName = getCurrentFileName(context)
    if (currentFileName) {
      if (!checkIsGitRepository(context)) {
        sendEvent(context, 'Init', 'Start init')
        const pluginPath = context.scriptPath.replace(/\/Contents\/Sketch\/(\w*)\.js$/, '').replace(/ /g, '\\ ')
        var command = `git init --template ${pluginPath}/Contents/Resources/gittemplate`
        var message = exec(context, command)
        context.document.showMessage(message)
        command = `if ! [ -e  ".gitignore" ] ;then echo "*.sketch">.gitignore;git add .gitignore; fi;`
        exec(context, command)
        let prefs = getUserPreferences(context)
        unzipFile(context,prefs)

        var remoteURL = createInput(context, '添加远程版本库地址:', '现在添加', '以后在说')

        if (remoteURL.responseCode == 1000 && remoteURL.message != null) {
          sendEvent(context, 'Init', 'Add remote')
          command = `git remote add origin ${remoteURL.message}; exit`
          message = exec(context, command)
          context.document.showMessage(message.split('\n').join(' '))
        } else {
          sendEvent(context, 'Init', 'Cancel add remote')
        }
       
      }else{
        createFailAlert(context, '提示', '项目已经初始化过')
      }
    } else {
      createFailAlert(context, '提示', '当前没有打开文件')
    }


  })
}
