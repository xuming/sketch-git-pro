import {_,setLanguate} from "../common"


export default function (context) {
  setLanguate(context,"enUS");
  AppController.sharedInstance().pluginManager().reloadPlugins();
}