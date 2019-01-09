// Branches (cmd alt ctrl b)
import { sendEvent } from '../analytics'
import { _,getCurrentBranch, checkForFile, exec, executeSafely, createInput, setIconForAlert, createInfoAlert, createConfirm, reOpenDocument, showinfo } from '../common'
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

function createSelect(context, msg) {
  var i18 = _(context);
  function refresh() {
    var listBranchesCommand = 'git for-each-ref --format=\'%(refname:short)\' refs/heads/'
    var listBranches = exec(context, listBranchesCommand)
    listBranches = listBranches.split('\n')
    listBranches.pop()
    var currentBranch = getCurrentBranch(context)
    comboBox.removeAllItems()
    comboBox.addItemsWithObjectValues(listBranches)
    var index = listBranches.indexOf(currentBranch)
    comboBox.selectItemAtIndex(index > -1 ? index : 0)
  }

  var accessory = NSView.alloc().initWithFrame(NSMakeRect(0, 0, 300, 50))
  var comboBox = NSComboBox.alloc().initWithFrame(NSMakeRect(0, 15, 150, 25))
  comboBox.setEditable(false)
  accessory.addSubview(comboBox)
  refresh()

  var delegateDel = delegateClass.new()

  delegateDel.options = NSDictionary.dictionaryWithDictionary({
    onClicked: function handleEnd() {
      var branchname = comboBox.objectValueOfSelectedItem()
      if(branchname=='master'){
        createInfoAlert(context,i18.common.info,i18.branches.m2)
        return 
      }
      executeSafely(context, function () {
        if (createConfirm(context, i18.branches.m3 + branchname)) {
          var command = 'git branch -D ' + branchname
          exec(context, command)
          createInfoAlert(context, i18.common.info, i18.branches.m4.replace("{branchname}", branchname))
          refresh()
        }
      })
    },
  })
  var button = NSButton.alloc().initWithFrame(NSMakeRect(160, 15, 50, 25))
  button.setTitle(i18.branches.m5)
  button.setTarget(delegateDel)
  button.setAction(NSSelectorFromString('buttonClicked:'))
  accessory.addSubview(button)

  var delegate = delegateClass.new()
  delegate.options = NSDictionary.dictionaryWithDictionary({
    onClicked: function handleEnd() {
      var ret = createInput(context, i18.branches.m6, i18.common.ok, i18.common.cancel)
      if (ret.responseCode == 1000) {
        if (ret.message == null || ret.message == '') {
          createInfoAlert(context, i18.common.info, i18.branches.m7)
          return
        }
        executeSafely(context, function () {
          var command = 'git branch ' + ret.message
          exec(context, command)
          createInfoAlert(context, i18.common.info,i18.branches.m8)
          refresh()

        })
      }
    },
  })

  var button2 = NSButton.alloc().initWithFrame(NSMakeRect(220, 15, 75, 25))
  button2.setTitle(i18.branches.m1)
  button2.setTarget(delegate)
  button2.setAction(NSSelectorFromString('buttonClicked:'))
  accessory.addSubview(button2)


  var alert = NSAlert.alloc().init()
  alert.setMessageText(msg)
  alert.addButtonWithTitle(i18.branches.m9)
  alert.addButtonWithTitle(i18.branches.m10)
  setIconForAlert(context, alert)
  alert.setAccessoryView(accessory)

  var responseCode = alert.runModal()
  var sel = comboBox.objectValueOfSelectedItem()

  return {
    responseCode: responseCode,
    branchName: sel
  }
}

export default function (context) {
  var i18 = _(context);
  if (!checkForFile(context)) { return }
  var ret = createSelect(context, i18.branches.m11)
  if (ret.responseCode == 1000) {
    if (ret.branchName == null || ret.branchName == '') {
      createInfoAlert(context, i18.common.info, i18.branches.m12)
      return
    }
    // if(checkIsModified(context)){
    //   createInfoAlert(context, "提示", "请先提交本地修改")
    //   return 
    // }
    var name=ret.branchName
    executeSafely(context, function () {
      sendEvent(context, 'Branch', 'Switch branch', 'Did switch branch')
      var currentBranch = getCurrentBranch(context)

      var command = `git stash save ${currentBranch} ;git clean -dxf; git checkout -q  ${name} ;`
      exec(context, command)
      // var app = NSApp.delegate()
      // app.refreshCurrentDocument()
      context.document.showMessage(i18.branches.m13+`'${name}'`)
      reOpenDocument(context)
    })
  }
}
