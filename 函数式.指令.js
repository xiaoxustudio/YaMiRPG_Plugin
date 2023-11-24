/*
 * @Author: xuranXYS
 * @LastEditTime: 2023-11-24 15:27:32
 * @GitHub: www.github.com/xiaoxustudio
 * @WebSite: www.xiaoxustudio.top
 * @Description: By xuranXYS
 */
/*
@plugin 函数式.指令
@version 1.0
@author 徐然
@link https://space.bilibili.com/291565199
@desc 

将事件函数化，可传参，调用，获取事件的返回值


创建函数式：
参数列表格式： 
key : value -> 设置或传入参数key的(默认)值为value
key -> 设置或传入参数key的(默认)值为null （单独key）

PS：当value为(value)格式时，会将value转换为js值
可用<*:*>格式获取当前到参数列表里面

调用函数式的参数列表同上

获取参数值：如果参数名称不存在，则不做处理

所有值默认值为null，对应事件指令的空值
事件部分操作出错会有提示信息和事件文件的出错位置

@option op {"create","call","set_return","get_param"}
@alias 操作 {创建函数式,调用函数式,设置函数式返回值,获取参数值}

@string func_name
@alias 函数名称
@cond op {"create","call"}
@desc 函数名称，用于调用函数

@string[] params
@alias 参数列表
@cond op {"create","call"}
@desc 函数的参数列表
key : value -> 设置或传入参数key的(默认)值为value
key -> 设置或传入参数key的(默认)值为null （单独key）

PS：当value为(value)格式时，会将value转换为js值
可用<*:*>格式获取当前到参数列表里面

@variable-getter func_res_set
@alias 函数返回存储
@cond op {"call"}
@desc 将函数式执行的结果值返回到指定变量（前提要有设置函数式返回值）

@variable-getter func_res_now
@alias 当前函数返回
@cond op {"set_return"}
@desc 为当前函数式设置返回值

@string param_name
@alias 参数名称
@cond op {"get_param"}
@desc 指定参数名称

@variable-getter func_params_get
@alias 存储参数值
@cond op {"get_param"}
@desc 获取传入的指定参数值，并存储到指定变量

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
let func_list = {
  obj: {},
  MapTo: [],
  has(name) {
    if (Object.keys(func_list.obj).indexOf(name) !== -1) { return true }
    return false
  },
  add(params, guid, obj, index) {
    if (typeof obj !== "object") { return false }
    let p = {}
    for (let i in params.params) {
      let content = String(params.params[i]).trim()
      if (/\s*([a-zA-Z0-9]+)\s*:\s*(.+)\s*/.test(content)) {
        let res = content.match(/\s*([a-zA-Z0-9]+)\s*:\s*(.+)\s*/)
        if (/\s*\(\s*(.+)\s*\)\s*/.test(res[2])) {
          try {
            let val = res[2].match(/\s*\(\s*(.+)\s*\)\s*/)[1]
            if (typeof val === "object") { p[res[1]] = val }
            else { p[res[1]] = new Function("return " + val)() }
          } catch (e) {
            console.error("编译参数列表错误：" + params.func_name + "\n\n报错文件：" + func_list.MapTo[0][index])
          }
        } else {
          let val = xr.compileVar(res[2])
          p[res[1]] = val
        }
      } else if (/\s*[a-zA-Z0-9]+\s*/.test(content)) {
        if (Object.keys(p).indexOf(content) === -1) {
          p[content] = null
        }
      }
    }
    func_list.obj[params.func_name] = {
      guid,
      return_type: params.func_type,
      params: p,
      obj,
      index: parseInt(index)
    }
  },
}
function init(self) {
  let arr = [
    [], // 原路径
    [], // 短路径
    [], // ID
  ]
  const find = (path) => {
    let status = fs.statSync(path)
    if (status.isFile()) {
      // 判断是否是Event
      let suffix = String(path).substring(path.lastIndexOf("."))
      if (suffix == ".event") {
        arr[0].push(path)
        let sh_path = String(path).substring(path.lastIndexOf("\\") + 1)
        arr[1].push(sh_path)
        arr[2].push(sh_path.match(/[./]([0-9a-f]{16})\.\S+$/)[1])
      }
    } else if (status.isDirectory()) {
      let list = fs.readdirSync(path)
      for (let i in list) {
        let sub_path = path + "\\" + list[i]
        find(sub_path)
      }
    }
  }
  find(__dirname)
  // 过滤包含我们指令的event文件
  let f_arr = [
    [], // 原路径
    [], // 短路径
    [], // ID
  ]
  const filter = () => {
    for (let i in arr[0]) {
      let obj = JSON.parse(fs.readFileSync(arr[0][i]))
      if (obj.type === "common") {
        let cmdf = obj.commands[0]
        let params = cmdf.params
        if (cmdf.id === SelfGUID() && params.op === "create") {
          // 过滤存储
          f_arr[0].push(arr[0][parseInt(i)])
          f_arr[1].push(arr[1][parseInt(i)])
          f_arr[2].push(arr[2][parseInt(i)])
          // 编译事件和参数列表
          params.func_name = params.func_name.trim()
          if (!func_list.has(params.func_name)) {
            let commands_set = {
              "id": "script",
              "params": {
                "script": `if(!Event.hasOwnProperty('params')){ Event.params = func_list.obj["${params.func_name}"].params;Event.result = null}`
              }
            }
            obj.commands.unshift(commands_set)
            obj.commands = Command.compile(obj.commands)
            func_list.add(params, cmdf.id, obj, f_arr[0].length - 1)
          } else { console.error("\n存在重复函数式名称：" + params.func_name + "\n\n报错文件：" + arr[0][i]); throw new Error(""); }
        }
      }
    }
  }
  filter()
  arr = undefined
  func_list.MapTo = f_arr
}
function SelfGUID() {
  function getException() { try { throw Error(''); } catch (err) { return err; } }
  return String(getException().stack).split("\n")[1].substring("at getException (").match(/[./]([0-9a-f]{16})\.\S+$/)[1].trim()
}

class Functions_xr {
  onStart() {
    init(this)
    window.func_list = func_list
  }
  call() {
    switch (this.op) {
      case "call": {
        if (func_list.has(this.func_name)) {
          try {
            let p = {}
            for (let i in this.params) {
              let content = String(this.params[i]).trim()
              if (/\s*([a-zA-Z0-9]+)\s*:\s*(.+)\s*/.test(content)) {
                let res = content.match(/\s*([a-zA-Z0-9]+)\s*:\s*(.+)\s*/)
                if (/\s*\(\s*(.+)\s*\)\s*/.test(res[2])) {
                  try {
                    let val = res[2].match(/\s*\(\s*(.+)\s*\)\s*/)[1]
                    if (typeof val === "object") { p[res[1]] = val }
                    else { p[res[1]] = new Function("return " + val)() }
                  } catch (e) {
                    console.error("编译参数列表错误：" + this.func_name + "\n\n报错文件：" + func_list.MapTo[0][func_list.obj[this.func_name].index])
                  }
                } else {
                  let val = xr.compileVar(res[2])
                  p[res[1]] = val
                }
              } else if (/\s*[a-zA-Z0-9]+\s*/.test(content)) {
                if (Object.keys(p).indexOf(content) === -1) {
                  p[content] = null
                }
              }
            }
            let ori = {
              attributes: Event.attributes,
              index: Event.index,
              cmd: Event.commands,
            };
            let res = this.func_res_set
            let event = new EventHandler(func_list.obj[this.func_name].obj.commands)
            event.params = p
            EventHandler.call(event, new ModuleList())
            if (event.complete) {
              res?.set(event.result)
            }
          } catch (e) {
            console.error("函数式事件调用失败：" + this.func_name + "\n\n报错文件：" + func_list.MapTo[0][func_list.obj[this.func_name].index])
            throw e
          }
        }
        break
      }
      case "set_return": {
        Event.result = typeof (this.func_res_now?.get()) !== "undefined" ? (this.func_res_now?.get()) : null
        break
      }
      case "get_param": {
        if (Event.params.hasOwnProperty(this.param_name)) { this.func_params_get?.set(Event.params[this.param_name]) } else { console.warn("不存在参数：" + this.param_name) }
        break
      }
    }
  };
}
export default Functions_xr