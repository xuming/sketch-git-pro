
import {_,setLanguate} from "../common"


export default function (context) {
  setLanguate(context,"zhCN");
  AppController.sharedInstance().pluginManager().reloadPlugins();
}