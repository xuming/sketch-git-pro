// Init git repo and add current file to the repo (cmd alt ctrl n)
import { sendEvent } from '../analytics'
import { checkForFile, getCurrentFileName, executeSafely, exec,unzipFile, createInput, createFailAlert, checkIsGitRepository, createInfoAlert } from '../common'
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
        
        command = `if ! [ -e  ".gitignore" ] ;then echo "*.sketch">.gitignore;git add .gitignore; fi;`
        exec(context, command)
        command = `if ! [ -e  ".gitlab-ci.yml" ] ;then cp ${pluginPath}/Contents/Resources/.gitlab-ci.yml .gitlab-ci.yml;git add .gitlab-ci.yml; fi;`
        exec(context, command)
     

        // let prefs = getUserPreferences(context)
        // unzipFile(context,prefs)
        createInfoAlert(context,"提示","初始化成功")
       
      }else{
        const pluginPath = context.scriptPath.replace(/\/Contents\/Sketch\/(\w*)\.js$/, '').replace(/ /g, '\\ ')
        
        var command = `if ! [ -e  ".git/hooks/pre-commit" ] ;then cp -R ${pluginPath}/Contents/Resources/gittemplate/ .git/ ; fi;`
        exec(context, command)
        command = `if ! [ -e  ".gitignore" ] ;then echo "*.sketch">.gitignore;git add .gitignore; fi;`
        exec(context, command)
        command = `if ! [ -e  ".gitlab-ci.yml" ] ;then cp ${pluginPath}/Contents/Resources/.gitlab-ci.yml .gitlab-ci.yml;git add .gitlab-ci.yml; fi;`
        exec(context, command)

        createFailAlert(context, '提示', '项目已经初始化过')
      }
    } else {
      createFailAlert(context, '提示', '当前没有打开文件')
    }


  })
}
