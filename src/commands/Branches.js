// Branches (cmd alt ctrl b)
import { sendEvent } from '../analytics'
import { checkIsModified,getCurrentBranch, checkForFile, exec, executeSafely, createInput, setIconForAlert, createInfoAlert, createConfirm, reOpenDocument, showinfo } from '../common'
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
        createInfoAlert(context,"提示","您不能删除master分支")
        return 
      }
      executeSafely(context, function () {
        if (createConfirm(context, "是否要删除分支" + branchname)) {
          var command = 'git branch -D ' + branchname
          exec(context, command)
          createInfoAlert(context, "提示", "分支'"+branchname+"'删除成功")
          refresh()
        }
      })
    },
  })
  var button = NSButton.alloc().initWithFrame(NSMakeRect(160, 15, 50, 25))
  button.setTitle('删除')
  button.setTarget(delegateDel)
  button.setAction(NSSelectorFromString('buttonClicked:'))
  accessory.addSubview(button)

  var delegate = delegateClass.new()
  delegate.options = NSDictionary.dictionaryWithDictionary({
    onClicked: function handleEnd() {
      var ret = createInput(context, "创建新分支", "确定", "取消")
      if (ret.responseCode == 1000) {
        if (ret.message == null || ret.message == '') {
          createInfoAlert(context, "提示", "分支名不能为空")
          return
        }
        executeSafely(context, function () {
          var command = 'git branch ' + ret.message
          exec(context, command)
          createInfoAlert(context, "提示", "分支创建成功")
          refresh()

        })
      }
    },
  })

  var button2 = NSButton.alloc().initWithFrame(NSMakeRect(220, 15, 75, 25))
  button2.setTitle('创建新分支')
  button2.setTarget(delegate)
  button2.setAction(NSSelectorFromString('buttonClicked:'))
  accessory.addSubview(button2)


  var alert = NSAlert.alloc().init()
  alert.setMessageText(msg)
  alert.addButtonWithTitle('切换分支')
  alert.addButtonWithTitle('以后再说')
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
  if (!checkForFile(context)) { return }
  var ret = createSelect(context, "选择分支")
  if (ret.responseCode == 1000) {
    if (ret.branchName == null || ret.branchName == '') {
      createInfoAlert(context, "提示", "分支名不能为空")
      return
    }
    if(checkIsModified(context)){
      createInfoAlert(context, "提示", "请先提交本地修改")
      return 
    }
    var name=ret.branchName
    executeSafely(context, function () {
      sendEvent(context, 'Branch', 'Switch branch', 'Did switch branch')
      var command = `git checkout -q  ${name} ;`
      exec(context, command)
      // var app = NSApp.delegate()
      // app.refreshCurrentDocument()
      context.document.showMessage(`切换当前分支为'${name}'`)
      reOpenDocument(context)
    })
  }
}
