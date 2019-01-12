// Common library of things
import { sendError, sendEvent } from './analytics'
export function _(context) {
  var i18nKey = "me.dmsy.git-plugin.i18n";
  var lang = NSUserDefaults.standardUserDefaults().objectForKey(i18nKey);
  if (lang == undefined) {
      var macOSVersion = NSDictionary.dictionaryWithContentsOfFile("/System/Library/CoreServices/SystemVersion.plist").objectForKey("ProductVersion") + "";
      lang = NSUserDefaults.standardUserDefaults().objectForKey("AppleLanguages").objectAtIndex(0);
      lang = (macOSVersion >= "10.12") ? lang.split("-").slice(0, -1).join("-") : lang;
      if (lang.indexOf('zh') > -1) {
          lang = 'zhCN';
      } else {
          lang = 'enUS';
      }
              
      NSUserDefaults.standardUserDefaults().setObject_forKey(lang, i18nKey);
      setLanguate(context, lang)

  }
  if (encodeURIComponent(lang.toString()).length != 4) {
      lang = 'enUS';
      NSUserDefaults.standardUserDefaults().setObject_forKey(lang, i18nKey);
  }

  function get_(json, context) {
      var manifestPath = context.plugin.url().URLByAppendingPathComponent("Contents").URLByAppendingPathComponent("Resources").URLByAppendingPathComponent("i18n").URLByAppendingPathComponent(json + ".json").path();
      var jsonData = NSData.dataWithContentsOfFile(manifestPath);
      jsonData = NSString.alloc().initWithData_encoding_(jsonData, NSUTF8StringEncoding);;
      return JSON.parse(jsonData);
  }
  var i18Content = {};
  console.log(lang)
  i18Content = get_(lang, context);

  return i18Content;
};

export function setLanguate(context,lang){
  sendEvent(context,"setlang",lang)
  var i18nKey = "me.dmsy.git-plugin.i18n";
  NSUserDefaults.standardUserDefaults().setObject_forKey(lang, i18nKey);
  var allManifestPath = context.plugin.url().URLByAppendingPathComponent("Contents").URLByAppendingPathComponent("Resources").URLByAppendingPathComponent("i18n").URLByAppendingPathComponent("manifest-" + lang + ".json").path();
                
  var manifestLangData = NSJSONSerialization.JSONObjectWithData_options_error(NSData.dataWithContentsOfFile(allManifestPath), NSJSONReadingMutableContainers, nil)
  
  var localManiFest = context.plugin.url().URLByAppendingPathComponent("Contents").URLByAppendingPathComponent("Sketch").URLByAppendingPathComponent("manifest.json").path();
  NSString.alloc().initWithData_encoding(NSJSONSerialization.dataWithJSONObject_options_error(manifestLangData, NSJSONWritingPrettyPrinted, nil), NSUTF8StringEncoding).writeToFile_atomically_encoding_error(localManiFest, true, NSUTF8StringEncoding, nil);

}
export function setIconForAlert (context, alert) {
  alert.setIcon(NSImage.alloc().initWithContentsOfFile(
    context.plugin.urlForResourceNamed('icon.png').path()))
}

export function executeSafely (context, func) {
  try {
    func(context)
  } catch (e) {
    sendError(context, e)
    createFailAlert(context, 'Failed...', e, true)
  }
}

export function exec (context, command,path='') {
  //console.log(command)
  var task = NSTask.alloc().init()
  var pipe = NSPipe.pipe()
  var errPipe = NSPipe.pipe()

  if (path==''){
    path = getCurrentDirectory(context)
  }
  command = `cd "${path}" && ${command}`

  task.setLaunchPath_('/bin/bash')
  task.setArguments_(NSArray.arrayWithArray_(['-c', '-l', command]))
  task.standardOutput = pipe
  task.standardError = errPipe
  task.launch()

  const errData = errPipe.fileHandleForReading().readDataToEndOfFile()
  const data = pipe.fileHandleForReading().readDataToEndOfFile()

  if (task.terminationStatus() != 0) {
    let message = 'Unknow error'
    if (errData != null && errData.length()) {
      message = NSString.alloc().initWithData_encoding_(errData, NSUTF8StringEncoding)
    } else if (data != null && data.length()) {
      message = NSString.alloc().initWithData_encoding_(data, NSUTF8StringEncoding)
    }
    return NSException.raise_format_('failed', message)
  }

  return NSString.alloc().initWithData_encoding_(data, NSUTF8StringEncoding)
}
export function showinfo(context,info){
  var i18=_(context)
  createInfoAlert(context, i18.common.info, info)
}
export function getCurrentDirectory (context) {
  return context.document.fileURL().URLByDeletingLastPathComponent().path()
}

export function getGitDirectory (context) {
  return exec(context, 'git rev-parse --show-toplevel').trim().replace('(B[m', '')
}

export function getCurrentFileName (context) {
  return context.document.fileURL().lastPathComponent()
}
export function createInfoAlert (context, title, info) {
   createFailAlert(context,title,info,false)
}
export function createFailAlert (context, title, error, buttonToReport) {
  console.log(error)
  var alert = NSAlert.alloc().init()
  alert.informativeText = '' + error
  alert.messageText = title
  alert.addButtonWithTitle('OK')
  if (buttonToReport) {
    alert.addButtonWithTitle('Report issue')
  }
  setIconForAlert(context, alert)

  var responseCode = alert.runModal()

  if (responseCode == 1001) {
    var errorString = error
    if (typeof error === 'object') {
      try {
        errorString = JSON.stringify(error, null, '\t')
        if (errorString === '{}') {
          errorString = error
        }
      } catch (e) {}
    }
    var urlString = `https://github.com/xuming/git-sketch-plugin/issues/new?body=${encodeURIComponent('### How did it happen?\n1.\n2.\n3.\n\n\n### Error log\n\n```\n' + errorString + '\n```')}`
    var url = NSURL.URLWithString(urlString)
    NSWorkspace.sharedWorkspace().openURL(url)
  }

  return {
    responseCode
  }
}

export function createInput (context, msg, okLabel, cancelLabel,value='') {
  var accessory = NSView.alloc().initWithFrame(NSMakeRect(0, 0, 300, 50))
  var input = NSTextField.alloc().initWithFrame(NSMakeRect(0, 25, 300, 25))
  input.editable = true
  accessory.addSubview(input)
  var alert = NSAlert.alloc().init()
  alert.setMessageText(msg)
  alert.addButtonWithTitle(okLabel || 'OK')
  alert.addButtonWithTitle(cancelLabel || 'Cancel')
  setIconForAlert(context, alert)
  alert.setAccessoryView(accessory)
  input.setStringValue(value)
  var responseCode = alert.runModal()
  var message = input.stringValue()

  return {
    responseCode: responseCode,
    message: message
  }
}
export function reOpenDocument(context){
  var sketch = require('sketch/dom')
  var document = sketch.fromNative(context.document)
  document.close()
  var path=context.document.fileURL().path()
  if(!fileExists(path)){
    i18=_(context)
    showinfo(context,i18.common.m6.replace("{file}",context.document.fileURL().path()));
    // sketch.Document.open((err, document) => {
    //   if (err) {
    //     // oh no, we failed to open the document
    //   }
    //   // if the user cancel the opening, `document` will be `undefined`
    // })
    
    return 
  }
  sketch.Document.open(context.document.fileURL(),(err, document) => {
    if (err) {
      console.log(err)
    }
  })
}
export function createConfirm (context, msg, okLabel, cancelLabel) {
  var accessory = NSView.alloc().initWithFrame(NSMakeRect(0, 0, 300, 50))
  var alert = NSAlert.alloc().init()
  alert.setMessageText(msg)
  alert.addButtonWithTitle(okLabel || 'OK')
  alert.addButtonWithTitle(cancelLabel || 'Cancel')
  setIconForAlert(context, alert)
  alert.setAccessoryView(accessory)
  var responseCode = alert.runModal()
  
  return responseCode==1000
}

export function createInputWithCheckbox (context, msg, checkboxMsg, checked, okLabel, cancelLabel) {
  var accessory = NSView.alloc().initWithFrame(NSMakeRect(0, 0, 300, 100))
  var input = TextArea(0, 25, 300, 75)
  var checkbox = NSButton.alloc().initWithFrame(NSMakeRect(0, 0, 300, 25))
  checkbox.setButtonType(3)
  checkbox.title = checkboxMsg
  checkbox.state = checked ? 1 : 0
  accessory.addSubview(input.view)
  accessory.addSubview(checkbox)

  var alert = NSAlert.alloc().init()
  alert.setMessageText(msg)
  alert.addButtonWithTitle(okLabel || 'OK')
  alert.addButtonWithTitle(cancelLabel || 'Cancel')
  setIconForAlert(context, alert)
  alert.setAccessoryView(accessory)

  var responseCode = alert.runModal()
  var message = input.getValue()

  return {
    responseCode: responseCode,
    message: message,
    checked: checkbox.state() == 1
  }
}

export function createSelect (context, msg, items, selectedItemIndex, okLabel, cancelLabel) {
  selectedItemIndex = selectedItemIndex || 0

  var accessory = NSComboBox.alloc().initWithFrame(NSMakeRect(0, 0, 200, 25))
  accessory.addItemsWithObjectValues(items)
  accessory.selectItemAtIndex(selectedItemIndex)

  var alert = NSAlert.alloc().init()
  alert.setMessageText(msg)
  alert.addButtonWithTitle(okLabel || 'OK')
  alert.addButtonWithTitle(cancelLabel || 'Cancel')
  setIconForAlert(context, alert)
  alert.setAccessoryView(accessory)

  var responseCode = alert.runModal()
  var sel = accessory.indexOfSelectedItem()

  return {
    responseCode: responseCode,
    index: sel
  }
}

export function getCurrentBranch (context) {
  const path = getCurrentDirectory(context)
  const currentBranchCommand = `cd "${path}" && git rev-parse --abbrev-ref HEAD`
  let branch
  try {
    branch = exec(context, currentBranchCommand).split('\n')[0]
  } catch (e) {
    branch = 'master'
  }
  return branch
}

export function exportArtboards (context, prefs) {
  const currentFileName = getCurrentFileName(context)
  const path = getCurrentDirectory(context)
  const currentFileNameWithoutExtension = currentFileName.replace(/\.sketch$/, '')
  const {exportFolder, exportFormat, exportScale, includeOverviewFile} = prefs
  const pluginPath = context.scriptPath.replace(/\/Contents\/Sketch\/(\w*)\.js$/, '').replace(/ /g, '\\ ')
  const bundlePath = NSBundle.mainBundle().bundlePath()
  const fileFolder = exportFolder + '/' + currentFileNameWithoutExtension
  const command = `${pluginPath}/exportArtboard.sh "${path}" "${exportFolder}" "${fileFolder}" "${bundlePath}" "${currentFileName}" "${exportFormat || 'png'}" "${exportScale}" "${includeOverviewFile}"`
  return exec(context, command)
}


export function unzipFile (context,prefs) {
  const currentFileName = getCurrentFileName(context)
  const path = getCurrentDirectory(context)
  const {_exportFolder, exportFormat, exportScale, includeOverviewFile} = prefs
  const pluginPath = context.scriptPath.replace(/\/Contents\/Sketch\/(\w*)\.js$/, '').replace(/ /g, '\\ ')
  const bundlePath = NSBundle.mainBundle().bundlePath()
  const git_root = getGitDirectory(context)
  const exportFolder=path.replace(git_root,git_root+"/.sketchgit")+"/"+currentFileName+"git/"
  const command = `${pluginPath}/Contents/Resources/gittemplate/hooks/unzip.sh "${path}/${currentFileName}"  "${exportFolder}"`
  //const command=`unzip -q -o ${path}/${currentFileName} -d ${path}/.sketchgit/${currentFileName}`
  return exec(context, command)
}


export function checkForFile (context,showalert=true) {
  var i18=_(context)
  try {
    getCurrentFileName(context)
    getCurrentDirectory(context)
    return true
  } catch (e) {
    if(showalert){
      sendError(context, 'Missing file')
      createFailAlert(context, i18.common.m2, i18.common.m5)
    }
    return false
  }
}
export function fileExists(path){
  return NSFileManager.defaultManager().fileExistsAtPath(path)
}
export function checkForSketchgitFolder (context) {
  var i18=_(context)
  try {
    const git_root=getGitDirectory(context)
    if (!fileExists(git_root+"/.sketchgit")){
      createFailAlert(context, i18.common.info, i18.common.m1)
      return false
    }
    return true
  } catch (e) {
    sendError(context, 'Missing file')
    createFailAlert(context, i18.common.m2, i18.common.m1)
    return false
  }
}


export function checkIsModified (context) {
  try {

    var msg=exec(context, 'git status')

    return msg.indexOf('nothing to commit')==-1
  } catch (e) {
    return true
  }
}
export function checkIsGitRepository (context,path='') {
  try {

    return exec(context, 'git rev-parse --show-toplevel',path).trim().replace('(B[m', '')
    return true
  } catch (e) {
    sendError(context, 'Not a git repository')
    return false
  }
}
export function checkForRemote (context) {
  var i18=_(context)
  try {
    if (exec(context, 'git remote').trim()==''){
      createFailAlert(context, i18.common.info, i18.common.m3)
      return false  
    }
    return true
  } catch (e) {
    sendError(context, 'Mission Remote')
    createFailAlert(context, i18.common.info, i18.common.m3)
    return false
  }
}

export function getRemoteUrl (context,path='') {
  try {
    return exec(context, 'git remote get-url origin',path).trim()
  } catch (e) {
    return ""
  }
}
export function checkForGitRepository (context) {
  try {
    getGitDirectory(context)
    return true
  } catch (e) {
    sendError(context, 'Not a git repository')
    createFailAlert(context, i18.common.info, i18.common.m4)
    return false
  }
}

function TextArea (x, y, width, heigh) {
  const scrollView = NSScrollView.alloc().initWithFrame(NSMakeRect(x, y, width, heigh))
  scrollView.borderStyle = NSLineBorder
  const contentSize = scrollView.contentSize()
  const input = NSTextView.alloc().initWithFrame(NSMakeRect(0, 0, contentSize.width, contentSize.height))
  input.minSize = NSMakeSize(0, contentSize.height)
  input.maxSize = NSMakeSize(contentSize.width, Infinity)
  scrollView.documentView = input
  return {
    view: scrollView,
    getValue: () => input.string()
  }
}

