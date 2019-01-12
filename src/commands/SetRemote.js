// Init git repo and add current file to the repo (cmd alt ctrl n)
import { sendEvent } from '../analytics'
import { _,setIconForAlert, showinfo, getCurrentFileName, executeSafely, exec, createInput, createFailAlert, checkIsGitRepository, getRemoteUrl, createInfoAlert, getGitDirectory, checkForFile, fileExists } from '../common'
import dialog from '@skpm/dialog'

var ObjCClass = require('cocoascript-class').default

var delegateClass = new ObjCClass({
  options: null,
  'buttonClicked:': function handleButtonClicked() {

    if (this.options.onClicked) {
      this.options.onClicked()
    }
    this.release()
  }
})

var delegate = delegateClass.new()

function createSettingFrom(context, giturl) {
  var i18=_(context)
  var accessory = NSView.alloc().initWithFrame(NSMakeRect(0, 0, 300, 50))
  var input = NSTextField.alloc().initWithFrame(NSMakeRect(0, 25, 300, 25))
  input.editable = true
  input.usesSingleLineMode = true
  input.cell().scrollable = true
  accessory.addSubview(input)

  var alert = COSAlertWindow.new();
  alert.setMessageText(i18.setremote.m1)
  alert.addButtonWithTitle(i18.setremote.m2)
  alert.addButtonWithTitle(i18.setremote.m3)
  setIconForAlert(context, alert)
  alert.setAccessoryView(accessory)
  input.setStringValue(giturl)
  var responseCode = alert.runModal()
  alert.alert().window().setInitialFirstResponder(input)
  return {
    responseCode: responseCode,
    remoteurl: input.stringValue()
  }
}


function createUserPasswordFrom(context) {
  var i18=_(context)
  var accessory = NSView.alloc().initWithFrame(NSMakeRect(0, 0, 300, 125))

  var label1 = NSTextField.alloc().initWithFrame(NSMakeRect(0, 95, 300, 25))
  label1.editable = false;
  label1.setStringValue(i18.setremote.m4)
  label1.bordered = false
  label1.backgroundColor = NSColor.controlColor()
  accessory.addSubview(label1)



  var input = NSTextField.alloc().initWithFrame(NSMakeRect(0, 75, 300, 25))
  input.editable = true
  input.usesSingleLineMode = true
  input.cell().scrollable = true
  accessory.addSubview(input)


  
  var label2 = NSTextField.alloc().initWithFrame(NSMakeRect(0, 45, 300, 25))
  label2.editable = false;
  label2.setStringValue(i18.setremote.m5)
  label2.bordered = false
  label2.backgroundColor = NSColor.controlColor()
  accessory.addSubview(label2)

  var input2 = NSSecureTextField.alloc().initWithFrame(NSMakeRect(0, 25, 300, 25))
  accessory.addSubview(input2)
  input2.setUsesSingleLineMode(true)
  input2.cell().scrollable = true
  
  //var alert = NSAlert.alloc().init()
  var alert = COSAlertWindow.new();
  alert.setMessageText(i18.setremote.m6)
  alert.addButtonWithTitle(i18.setremote.m2)
  alert.addButtonWithTitle(i18.setremote.m3)
  setIconForAlert(context, alert)
  alert.setAccessoryView(accessory)
  var responseCode = alert.runModal()

  return {
    responseCode: responseCode,
    username: input.stringValue(),
    password: input2.stringValue()
  }
}

export default function (context) {
  var i18=_(context)
  executeSafely(context, function () {
    if (!checkForFile(context, false)) { //file saved
      createFailAlert(context, i18.common.info,i18.setremote.m7)
      return
    }

    var oldRemoteURL = getRemoteUrl(context)

    var ret = createSettingFrom(context, oldRemoteURL)
    if (ret.responseCode == 1001) { return }//cancel
    if (ret.remoteurl==''){
      createFailAlert(context, i18.common.info, i18.setremote.m8)
      return
    }
   
    if (checkIsGitRepository(context)) {
       sendEvent(context, 'Init', 'Add remote')
        var command = ''
        if (oldRemoteURL == '') {
          command = `git remote add origin ${ret.remoteurl}; exit`
        } else {
          command = `git remote set-url origin ${ret.remoteurl}; exit`
        }
        var message = exec(context, command)
        createInfoAlert(context, i18.common.info, i18.setremote.m9)
    } else {//还没有初始化过

     
        sendEvent(context, 'Init', 'Add remote')
        const pluginPath = context.scriptPath.replace(/\/Contents\/Sketch\/(\w*)\.js$/, '').replace(/ /g, '\\ ')

        var command = `set -e -o pipefail;git clone  --template ${pluginPath}/Contents/Resources/gittemplate ${ret.remoteurl} tmp;mv -f tmp/.git  .git ; rm -rf tmp ;exit`
       

        try
        {
          var message = exec(context, command)
        
        }catch(e){
          var err=String(e.reason)
          if (err.indexOf('could not read Username')>-1){
            remoteurl=ret.remoteurl
            ret=createUserPasswordFrom(context);
            if(ret.responseCode==1001){return}
            if(ret.username=='' || ret.password=='')
            {
              createInfoAlert(context, i18.common.info, i18.setremote.m10)
              return 
            }
            var remoteurl=remoteurl.replace('http://',`http://${ret.username}:${ret.password}@`)
            var command = `set -e -o pipefail;git clone  --template ${pluginPath}/Contents/Resources/gittemplate ${remoteurl} tmp;mv -f tmp/.git  .git ; rm -rf tmp ;exit`
            message = exec(context, command)
             
            

          }else{
            createInfoAlert(context, i18.common.info, e)
          }
        }
     
        command = `if ! [ -e  ".gitignore" ] ;then echo "*.sketch">.gitignore;git add .gitignore; fi;`
        exec(context, command)
        command = `if ! [ -e  ".gitlab-ci.yml" ] ;then cp ${pluginPath}/Contents/Resources/.gitlab-ci.yml .gitlab-ci.yml;git add .gitlab-ci.yml; fi;`
        exec(context, command)
        createInfoAlert(context, i18.common.info, i18.setremote.m9)
    }



  })
}
