// Init git repo and add current file to the repo (cmd alt ctrl n)
import { sendEvent } from '../analytics'
import {_, checkForFile, getCurrentFileName, executeSafely, exec,unzipFile, createInput, createFailAlert, checkIsGitRepository, createInfoAlert } from '../common'
import { } from 'sketch-module-fs'
import { getUserPreferences } from '../preferences'
export default function (context) {
  if (!checkForFile(context)) { return }
  var i18=_(context)
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
        createInfoAlert(context,i18.common.info,i18.init.m1)
       
      }else{
        const pluginPath = context.scriptPath.replace(/\/Contents\/Sketch\/(\w*)\.js$/, '').replace(/ /g, '\\ ')
        
        var command = `cp -R ${pluginPath}/Contents/Resources/gittemplate/ .git/ `
        exec(context, command)
        command = `if ! [ -e  ".gitignore" ] ;then echo "*.sketch">.gitignore;git add .gitignore; fi;`
        exec(context, command)
        command = `if ! [ -e  ".gitlab-ci.yml" ] ;then cp ${pluginPath}/Contents/Resources/.gitlab-ci.yml .gitlab-ci.yml;git add .gitlab-ci.yml; fi;`
        exec(context, command)

        createFailAlert(context, i18.common.info,i18.init.m2)
      }
    } else {
      createFailAlert(context, i18.common.info,i18.init.m3)
    }


  })
}
