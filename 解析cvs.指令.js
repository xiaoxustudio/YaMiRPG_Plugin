/*
 * @Author: xuranXYS
 * @LastEditTime: 2023-12-03 15:34:20
 * @GitHub: www.github.com/xiaoxustudio
 * @WebSite: www.xiaoxustudio.top
 * @Description: By xuranXYS
 */
/*
@plugin 解析csv
@version 1.1
@author 徐然
@link https://space.bilibili.com/291565199
@desc

用于解析csv内容
解析的结果将会是数组

@option op {"read","parse","build","cover"}
@alias 操作 {读取csv文件,解析csv内容,构建csv内容,覆盖csv文件}

@file file_path
@filter other
@alias csv文件
@cond op {"read"}

@option str_type {"utf-8","uff8","ascii","binary"}
@alias 读取类型 {utf-8,uff8,ascii,binary}
@cond op {"read"}

@variable-getter str_content
@alias csv内容
@cond op {"parse"}

@variable-getter arr_content
@alias csv内容
@cond op {"build"}

@variable-getter cover_content
@alias csv内容
@cond op {"cover"}

@file file_path_cover
@filter other
@alias 覆盖csv文件
@cond op {"cover"}

@option filter_type {"all","contain"}
@alias 过滤规则 {过滤全部为空的行,过滤含有空的行}
@cond op {"parse"}


@variable-getter save_var
@alias 保存到本地变量
@cond op {"read","parse","build"}

*/
const fs = require("fs")

class xr {
  static is_obj(obj) {
    return typeof obj == "object"
  }
  static is_func(obj) {
    return typeof obj == "function"
  }
  static is_server() {
    return server != null ? true : false
  }
  static is_json(str) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return false;
    }
  }
  static deepObject(obj) {
    if (typeof obj !== "object") { return obj }
    const newobj = Array.isArray(obj) ? [] : {}
    Object.setPrototypeOf(newobj, Object.getPrototypeOf(obj))
    for (let i in obj) {
      if (typeof i === "object") {
        newobj[i] = xr.deepObject(obj[i])
      } else {
        newobj[i] = obj[i]
      }
    }
    return newobj
  }
  static convertToJSON(object) {
    let cache = [];

    let json = JSON.stringify(object, function (key, value) {
      if (typeof value === 'object' && value !== null) {
        if (cache.includes(value)) {
          return '';
        }
        cache.push(value);
      }
      return value;
    });

    cache = null; // 清空 cache

    return json;
  }
  static get_global(str) {
    let res = Variable.get(str)
    if (res) { return res }
    for (let i in Variable.groups) {
      for (let k in Variable.groups[i]) {
        if (str == Variable.groups[i][k].name) {
          return Variable.groups[i][k].value;
        }
      }
    }
    return null;
  }
  static uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  static CompileData(obj, id = null, num = null, type = null, data = {}) {
    return JSON.stringify({ id: id ? id : 0, pack_num: num ? num : 0, type: type ? type : "chunk", value: obj, data: data.length != 0 ? data : { BufferSize: Math.ceil((obj.length * 1024) * 2) } })
  }
  static to64(str) {
    return new Buffer.from(str).toString('base64');;
  }
  static from64(str) {
    return new Buffer.from(str, 'base64').toString();
  }
  static compile(r) {
    let commands = [...Event.commands];
    commands.unshift(Command.compile(r, () => { })[0]);
    let eh = new EventHandler(Command.compile(r, () => { }));
    EventHandler.call(eh);
  }
  static compileVar(msg) {
    // 将字符串里面的变量编译为文本
    let regex = /<(.*?):(.*?)>+/g;
    let matches = [];
    let match;
    // 内置变量
    let mapTo = {
      'actor': 'triggerActor',
      'cactor': 'casterActor',
      'skill': 'triggerSkill',
      'state': 'triggerState',
      'equip': 'triggerEquipment',
      'item': 'triggerItem',
      'object': 'triggerObject',
      'light': 'triggerLight',
      'region': 'triggerRegion',
      'elem': 'triggerElement',
    }
    while ((match = regex.exec(msg)) !== null) {
      matches.push({ type: match[1], content: match[2] });
    }
    for (let i in matches) {
      for (let na in mapTo) {
        if (matches[i]["type"] == na) {
          return Event.attributes[matches[i]["type"]]["attributes"][matches[i]["content"]]
        }
      }
      //其他类型
      if (matches[i]["type"] == "local") {
        for (let k in mapTo) {
          if (k == matches[i]["content"]) {
            matches[i]["content"] = mapTo[k]
          }
        }
        if (typeof Event.attributes[matches[i]["content"]] == "object") {
          return Event.attributes[matches[i]["content"]]
        }
        // 其他变量
        if (typeof Event.attributes[matches[i]["content"]] == "object") {
          let data = Event.attributes[matches[i]["content"]];
          let ms_l = {};
          for (let obj_name in data) {
            if (typeof data[obj_name] != "object") {
              ms_l[obj_name] = data[obj_name];
            } else {
              ms_l[obj_name] = xr.convertToJSON(data[obj_name])
            }
          }
          msg = String(msg).replace(
            "<" + matches[i]["type"] + ":" + matches[i]["content"] + ">",
            xr.convertToJSON(ms_l)
          )
        } else {
          msg = String(msg).replace(
            "<" + matches[i]["type"] + ":" + matches[i]["content"] + ">",
            Event.attributes[matches[i]["content"]]
          )
        }
      }
      if (matches[i]["type"] == "global") {
        if (typeof xr.get_global(matches[i]["content"]) == "object") {
          let data = xr.get_global(matches[i]["content"]);
          let ms_l = {};
          for (let obj_name in data) {
            if (typeof data[obj_name] != "object") {
              ms_l[obj_name] = data[obj_name];
            } else {
              ms_l[obj_name] = xr.convertToJSON(data[obj_name])
            }
          }
          msg = String(msg).replace(
            "<" + matches[i]["type"] + ":" + matches[i]["content"] + ">",
            xr.convertToJSON(ms_l)
          );
        } else {
          msg = String(msg).replace(
            "<" + matches[i]["type"] + ":" + matches[i]["content"] + ">",
            xr.get_global(matches[i]["content"])
          );
        }
      }
    }
    return msg
  }
}

export default class CSV_parse {
  parse(content, type = "all") {
    try {
      let map_str = {
        "#,": "，"
      }
      for (let i in map_str) {
        content = content.replace(/(#,)/g, map_str[i])
      }
      const arr = content.split('\r\n');
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
        // 过滤
        switch (type) {
          case "all": {
            let n_arr = Array(new_arr[i].length).fill("")
            if (n_arr.join("") === new_arr[i].join("")) new_arr.pop()
            break
          }
          case "contain": {
            if (new_arr[i].includes("")) new_arr.pop()
            break
          }
        }
      }
      return new_arr
    } catch (e) {
      console.error("解析csv错误")
      throw e
    }
  }
  build(arr, type = "all") {
    try {
      let str_all = ""
      let str_now = ""
      // 首次解析,将每列提取出来
      for (let i = 0; i < arr.length; i++) {
        for (let ik = 0; ik < arr[i].length; ik++) {
          str_now += arr[i][ik]
          str_now += ","
        }
        str_now += "\r\n"
        str_all += str_now
        str_now = ""
      }
      return str_all
    } catch (e) {
      console.error("解析csv错误")
      throw e
    }
  }
  call() {
    switch (this.op) {
      case "read": {
        let data = fs.readFileSync(__dirname + "/" + File.getPathByGUID(this.file_path)).toString(this.str_type)
        this.save_var?.set(data)
        break
      }
      case "parse": {
        this.save_var?.set(this.parse(xr.compileVar(this.str_content?.get()), this.filter_type))
        break
      }
      case "build": {
        this.save_var?.set(this.build(this.arr_content?.get()))
        break
      }
      case "cover": {
        try {
          const data = this.cover_content?.get()
          let shell = Stats.shell
          if (!Stats.debug && Stats.isMacOS()) {
            shell = 'web'
          }
          switch (shell) {
            case 'electron': {
              const path = File.getPathByGUID(this.file_path_cover)
              const json = JSON.stringify(data, null, 2)
              const fs = require('fs')
              // 异步写入全局数据文件
              return fs.writeFileSync(path, json)
            }
            case 'web': {
              const key = this.file_path_cover + '.csv'
              return IDB.setItem(key, data)
            }
          }
        } catch (e) {
          console.error("覆盖文件错误")
          throw e
        }
        break
      }
    }
  }
}
