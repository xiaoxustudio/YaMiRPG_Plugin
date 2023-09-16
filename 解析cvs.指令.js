/*
 * @Author: xuranXYS
 * @LastEditTime: 2023-09-16 21:58:07
 * @GitHub: www.github.com/xiaoxustudio
 * @WebSite: www.xiaoxustudio.top
 * @Description: By xuranXYS
 */
/*
@plugin 解析csv
@version 1.0
@author 徐然
@link 
@desc

用于解析csv内容
解析的结果将会是数组

@string str_conent
@alias csv内容

@string save_var
@alias 保存到本地变量

*/
const fs = require("fs")

class xr {
  static is_json(a) {
    try {
      JSON.parse(a)
      return true
    } catch {
      return false
    }
  }
  static get_glocal(str) {
    for (let i in Variable.groups) {
      for (let k in Variable.groups[i]) {
        if (str == Variable.groups[i][k].name) {
          return Variable.groups[i][k].value;
        }
      }
    }
    return null;
  }
  static compilteVar(te) {
    // 将字符串里面的变量编译为文本
    let regex = /<(.*?):(.*?)>+/g;
    let matches = [];
    let match;
    while ((match = regex.exec(te)) !== null) {
      matches.push({ type: match[1], content: match[2] });
    }
    for (let i in matches) {
      if (matches[i]["type"] == "local") {
        te = String(te).replace(
          "<" + matches[i]["type"] + ":" + matches[i]["content"] + ">",
          Event.attributes[matches[i]["content"]]
        );
      }
      if (matches[i]["type"] == "global") {
        te = String(te).replace(
          "<" + matches[i]["type"] + ":" + matches[i]["content"] + ">",
          xr.get_glocal(matches[i]["content"])
        );
      }
    }
    return te
  }
  static compiltePath(text) {
    text = xr.compilteVar(text)
    if (text.startsWith("$")) {
      text = text.slice(1, text.length)
      return File.route("Assets") + "\\" + text
    } else if (text.startsWith("%")) {
      text = text.slice(1, text.length)
      return File.route("") + "\\" + text
    } else {
      return text
    }
  }
}

export default class CSV_parse {
  call() {
    let data = xr.compilteVar(this.str_conent)
    let map_str = {
      "#,": "，"
    }
    for (let i in map_str) {
      data = data.replace(/(#,)/g, map_str[i])
    }
    const arr = data.split('\r\n');
    let new_arr = []

    // 首次解析,将每列提取出来
    for (let i = 0; i < arr.length; i++) {
      let item = arr[i].split(",")
      new_arr[i] = item
    }
    // 字符串二次解析
    let string_bool = false
    let str = ""
    let start = 0
    let end = 0
    for (let i = 0; i < new_arr.length; i++) {
      // 解析每行
      for (let ik = 0; ik < new_arr[i].length; ik++) {
        let item = new_arr[i][ik]
        if (item.startsWith("\"") && !string_bool) {
          string_bool = true // 开启
          start = ik
        } else if (item.endsWith("\"") && string_bool) {
          string_bool = false //关闭
          end = ik
          str += item.replace("\"", "")
          str = str.replace("\t", ",").replace("\t", ",")
          new_arr[i].splice(start, end, str)
          str = ""
        }
        if (string_bool) {
          if (item == "") {
            str += ","
          } else {
            str += item.replace("\"", "") + "\t"
          }
        }
      }
    }
    Event.attributes[String(this.save_var)] = new_arr
  }
}
