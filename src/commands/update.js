import update from 'sketch-module-update'
import { _,setIconForAlert } from '../common'
import { sendEvent } from '../analytics';

const repoFullName = 'xuming/sketch-git-pro'

const options = {
  title: 'A new Git plugin version is available!',
  //customizeAlert: setIconForAlert,
  timeBetweenChecks:1
}

export default function(context){
  var i18=_(context)
  options.title=i18.common.newplugin;
  sendEvent(context,"open","checkupdate")
  var upd= update(repoFullName, options);
  upd(context);

} 
