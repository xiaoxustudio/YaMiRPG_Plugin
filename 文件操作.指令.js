/*
 * @Author: xuranXYS
 * @LastEditTime: 2023-09-16 22:23:41
 * @GitHub: www.github.com/xiaoxustudio
 * @WebSite: www.xiaoxustudio.top
 * @Description: By xuranXYS
 */
/*
@plugin 文件操作
@version 1.0
@author 徐然
@link https://space.bilibili.com/291565199
@desc

基于fs的文件操作

路径操作符：
$ ： 指向当前Assets文件夹
% ： 指向当前工程项目文件夹


@option op {'read_file','write_file','exist_file','show_file'}
@alias 操作 {读取文件,写入文件,文件是否存在,列出目录}

@string file_path
@alias 文件路径
@cond op {'read_file','write_file','exist_file','show_file'}

@string show_save_var
@alias 保存变量
@cond op {'show_file'}

@boolean show_add_prefix 
@alias 路径加上父目录
@default false
@cond op {'show_file'}

@option op_path_type {'txt','json'}
@alias 文件保存类型 {text,json}
@default text
@cond op {'read_file'}


@string save_var
@alias 内容保存变量
@cond op {'read_file'}


@string file_content
@alias 写入内容
@cond op {'write_file'}

@boolean is_create
@alias 自动创建目录
@default false
@cond op {'write_file'}

@boolean is_append
@alias 追加到文件
@default false
@cond op {'write_file'}


@string save_res_var
@alias 写入结果变量
@cond op {'write_file'}

@string save_exist_var
@alias 结果变量
@cond op {'exist_file'}

@option op_encoding {'utf-8','utf8','ascii','base64','base64url','binary','hex','latin1','ucs-2','ucs2','utf16le'}
@alias 文件编码 {utf-8,utf8,ascii,base64,base64url,binary,hex,latin1,ucs-2,ucs2,utf16le}
@default utf-8
@cond op {'read_file','write_file'}

*/

const fs = require("fs")
const path = require('path');
const iconv = require('iconv-lite');

class File_xr {
  promise
  constructor() {
    this.promise = new Promise((reject, resolve) => { reject("ok") })
  }
  static MkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
      return true;
    } else {
      //如果父级目录已经创建，然后才能创建子级目录
      if (File_xr.MkdirsSync(path.dirname(dirname))) {
        fs.mkdirSync(dirname);
        return true;
      }
    }
  }
  static read(path, en) {
    try {
      const str = fs.readFileSync(path, { encoding: en });
      return String(str)
    } catch {
      return null
    }
  }
  static write(path, text, create = false, append = false, en = "utf-8") {
    let is_e = fs.existsSync(path)
    let start = String(path).lastIndexOf("\\")
    if (create) {
      if (!is_e) File_xr.MkdirsSync(String(path).slice(0, start))
    }
    try {
      if (!append) {
        fs.writeFileSync(path, text, { encoding: en })
      }
      else {
        fs.appendFileSync(path, text, { encoding: en })
      }
      return true
    } catch {
      return false
    }
  }
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
    text = File_xr.compilteVar(text)
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

export default class Plugin {
  call() {
    switch (this.op) {
      case "read_file":
        var data = File_xr.read(File_xr.compiltePath(this.file_path),this.op_encoding)
        Event.attributes[this.save_var] = this.op_path_type == "txt" ? data : File_xr.is_json(data) ? JSON.parse(data) : data
        break
      case "write_file":
        let res = File_xr.write(File_xr.compiltePath(this.file_path), File_xr.compilteVar(this.file_content), this.is_create ? true : false, this.is_append ? true : false,this.op_encoding)
        Event.attributes[this.save_res_var] = res
        break
      case "exist_file":
        Event.attributes[this.save_exist_var] = fs.existsSync(File_xr.compiltePath(this.file_path))
        break
      case "show_file":
        let file_item = fs.readdirSync(this.file_path)
        if (this.show_add_prefix) {
          let new_file_item = []
          for (let i of file_item) {
            new_file_item.push(this.file_path + "\\" + i)
          }
          file_item = new_file_item
        }
        Event.attributes[this.show_save_var] = file_item
        break
    }
  }
}

