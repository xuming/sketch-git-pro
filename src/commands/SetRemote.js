// Init git repo and add current file to the repo (cmd alt ctrl n)
import { sendEvent } from '../analytics'
import { checkForFile, getCurrentFileName, executeSafely, exec, createInput, createFailAlert, checkIsGitRepository, getRemoteUrl ,createInfoAlert} from '../common'
import { } from 'sketch-module-fs'
export default function (context) {
  if (!checkForFile(context)) { return }
  executeSafely(context, function () {
    var currentFileName = getCurrentFileName(context)
    if (currentFileName) {
      if (checkIsGitRepository(context)) {
        var oldRemoteURL= getRemoteUrl(context)

        var remoteURL = createInput(context, '设置远程版本库地址:', '现在设置', '以后在说',oldRemoteURL)

        if (remoteURL.responseCode == 1000 && remoteURL.message != null) {
          sendEvent(context, 'Init', 'Add remote')
          var command=''
          if (oldRemoteURL==''){
            command = `git remote add origin ${remoteURL.message}; exit` 
          }else{
            command = `git remote set-url origin ${remoteURL.message}; exit` 
          }
          var message = exec(context, command)
          context.document.showMessage(message.split('\n').join(' '))
          createInfoAlert(context,"提示","远程仓库设置成功!")
        } else {
          sendEvent(context, 'Init', 'Cancel add remote')
        }
       
      }else{
        
        var remoteURL = createInput(context, '设置远程版本库地址:', '现在设置', '以后在说','')

        if (remoteURL.responseCode == 1000 && remoteURL.message != null) {
          sendEvent(context, 'Init', 'Add remote')
          const pluginPath = context.scriptPath.replace(/\/Contents\/Sketch\/(\w*)\.js$/, '').replace(/ /g, '\\ ')
          
          var command = `git clone  --template ${pluginPath}/Contents/Resources/gittemplate ${remoteURL.message} tmp;mv -f tmp/.git  .git ; rm -rf tmp ;exit`
          var message = exec(context, command)
          context.document.showMessage(message.split('\n').join(' '))
          
          command = `if ! [ -e  ".gitignore" ] ;then echo "*.sketch">.gitignore;git add .gitignore; fi;`
          exec(context, command)
          createInfoAlert(context,"提示","远程仓库设置成功!")
        } else {
          sendEvent(context, 'Init', 'Cancel add remote')
        }
      }
    } else {
      createFailAlert(context, '提示', '当前没有打开文件')
    }


  })
}
