/*
 * @Author: xuranXYS
 * @LastEditTime: 2023-12-03 17:16:10
 * @GitHub: www.github.com/xiaoxustudio
 * @WebSite: www.xiaoxustudio.top
 * @Description: By xuranXYS
 */
/*
@plugin 解析csv
@version 1.5
@author 徐然
@link https://space.bilibili.com/291565199
@desc

用于解析csv内容
解析的结果将会是数组

@option op {"read","parse","build","cover"}
@alias 操作 {读取csv文件,解析csv内容,构建csv内容,覆盖csv文件}
@desc 
读取csv文件：读取指定文件的cvs内容（不会进行解析）
解析csv内容：将指定变量的cvs内容解析为数组列表
构建csv内容：将数组列表构建为cvs文本
覆盖csv文件：将指定的cvs文件内容覆盖为指定cvs内容

@file file_path
@filter other
@alias csv文件
@cond op {"read"}
@desc csv文件

@option str_type {"utf-8","uff8","ascii","binary"}
@alias 读取类型 {utf-8,uff8,ascii,binary}
@cond op {"read"}
@desc 读取类型，默认utf-8

@option build_type {"utf-8","uff8","ascii","binary"}
@alias 类型 {utf-8,uff8,ascii,binary}
@cond op {"cover"}
@desc 读取类型，默认utf-8

@variable-getter str_content
@alias csv内容
@cond op {"parse"}
@desc 需要解析的csv文本内容

@variable-getter arr_content
@alias csv内容
@cond op {"build"}
@desc 需要构建的csv文本内容

@variable-getter cover_content
@alias csv内容
@cond op {"cover"}
@desc 需要覆盖为的csv文本内容

@file file_path_cover
@filter other
@alias 覆盖csv文件
@cond op {"cover"}
@desc 被覆盖的csv文件

@option filter_type {"none","all","contain","all_c"}
@alias 过滤规则 {不处理,过滤全部为空的行,过滤含有空的行,过滤含有空值的列}
@cond op {"parse"}
@desc 
不处理：不进行任何过滤
过滤全部为空的行：如果该行全部为空值，此行将被删除
过滤含有空的行：如果该行有空值，此行将被删除
过滤含有空值的列：如果该列有空值，此列将被删除

@variable-getter save_var
@alias 保存到本地变量
@cond op {"read","parse","build"}
@desc 将结果保存到本地变量

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
      let arr_ori = content.split("")
      let arr_after = []
      let pin = []
      let index = 0
      let str_ss = ""
      let is_runToZero = false
      while (arr_ori.length >= 0) {
        // 解决最后遗留
        if (arr_ori.length == 0) {
          if (is_runToZero) { break }
          is_runToZero = true
        }
        // 解析
        if (arr_ori[0] === "," && !str_ss.endsWith("\r\n")) {
          // 生成列
          if (str_ss.length == 0) {
            pin.push("")
          } else { pin.push(str_ss) }
          str_ss = ""
          index += 1
          arr_ori.shift()
        } else if (str_ss.endsWith("\r\n")) {
          pin.push(str_ss.replace("\r\n", ""))
          // 是否需要跳过本行
          let is_skip = false
          // 过滤
          switch (type) {
            case "all": {
              let n_arr = Array(pin.length).fill("")
              if (n_arr.join("") === pin.join("")) is_skip = true
              break
            }
            case "contain": {
              if (pin.includes("")) is_skip = true
              break
            }
          }
          if (is_skip) { is_skip = false } else { arr_after.push(Object.assign([], pin)); }
          // 生成行
          pin = []
          str_ss = ""
          index += 1
        } else if (arr_ori[0] === "\\") {
          str_ss += arr_ori[0] + arr_ori[1]
          arr_ori.shift()
          arr_ori.shift()
          index += 2
        } else {
          str_ss += arr_ori[0]
          if (arr_ori[0] == "") { console.log("有空") }
          index += 1
          arr_ori.shift()
        }
      }
      let need_remove_index = []
      if (type == "all_c") {
        for (let i = 0; i < arr_after.length; i++) {
          for (let ik = 0; ik < arr_after[i].length; ik++) {
            if (arr_after[i][ik] == "") {
              need_remove_index.push(ik)
            }
          }
        }
        need_remove_index = [...new Set(need_remove_index)]
        console.log(need_remove_index)
        let now_remove = 0
        while (need_remove_index.length > 0) {
          now_remove = need_remove_index[0]
          for (let id = 0; id < Object.assign([], arr_after).length; id++) {
            delete arr_after[id][now_remove]
          }
          need_remove_index.shift()
        }
        for (let id = 0; id < arr_after.length; id++) {
          arr_after[id] = arr_after[id].filter(element => element !== undefined)
        }
      }
      return arr_after
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
              return fs.writeFileSync(__dirname + "\\" + path, data, { encoding: this.build_type })
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
