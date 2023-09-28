/*
 * @Author: xuranXYS
 * @LastEditTime: 2023-09-28 21:01:14
 * @GitHub: www.github.com/xiaoxustudio
 * @WebSite: www.xiaoxustudio.top
 * @Description: By xuranXYS
 */
/*
@plugin 系统操作
@version 1.0
@author 徐然
@link https://space.bilibili.com/291565199
@desc

@option op {"get_version","get_in_version","get_core_name","get_temp","get_home","get_os_name","get_arch","get_platform","get_cpus","get_freemem","get_priority","get_networkInterfaces","get_allmem","get_uptime","get_userinfo"}
@alias 操作 {获取系统版本,获取系统内部版本,获取系统内核名称,获取系统临时文件路径,获取系统用户路径,获取系统主机名,获取编译nodejs架构,获取编译nodejs平台,获取cpu核心信息,获取系统空闲内存字节,获取指定pid进程优先级,获取本机网络适配器,获取系统内存总量,获取系统正常运行时间,获取当前用户信息}

@number priority_pid
@alias 进程pid(-1为自身)
@default -1
@cond op {"get_priority"}

@string store_var
@alias 保存到变量


*/
const os = require('os')

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
      JSON.parse(str);
      return true;
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
    while ((match = regex.exec(msg)) !== null) {
      matches.push({ type: match[1], content: match[2] });
    }
    for (let i in matches) {
      if (matches[i]["type"] == "local") {
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
          );
        } else {
          msg = String(msg).replace(
            "<" + matches[i]["type"] + ":" + matches[i]["content"] + ">",
            Event.attributes[matches[i]["content"]]
          );
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

export default class os_xr {
  call() {
    switch (this.op) {
      case "get_in_version":
        Event.attributes[String(xr.compileVar(this.store_var))] = os.version()
        break
      case "get_version":
        Event.attributes[String(xr.compileVar(this.store_var))] = os.release()
        break
      case "get_core_name":
        Event.attributes[String(xr.compileVar(this.store_var))] = os.type()
        break
      case "get_temp":
        Event.attributes[String(xr.compileVar(this.store_var))] = os.tmpdir()
        break
      case "get_home":
        Event.attributes[String(xr.compileVar(this.store_var))] = os.homedir()
        break
      case "get_os_name":
        Event.attributes[String(xr.compileVar(this.store_var))] = os.hostname()
        break
      case "get_platform":
        Event.attributes[String(xr.compileVar(this.store_var))] = os.platform()
        break
      case "get_cpus":
        Event.attributes[String(xr.compileVar(this.store_var))] = os.cpus()
        break
      case "get_cpus":
        Event.attributes[String(xr.compileVar(this.store_var))] = os.cpus()
        break
      case "get_freemem":
        Event.attributes[String(xr.compileVar(this.store_var))] = os.freemem()
        break
      case "get_priority":
        if (xr.compileVar(this.priority_pid) == "-1") {
          Event.attributes[String(xr.compileVar(this.store_var))] = os.getPriority()
        } else {
          Event.attributes[String(xr.compileVar(this.store_var))] = os.getPriority(xr.compileVar(this.priority_pid))
        }
        break
      case "get_networkInterfaces":
        Event.attributes[String(xr.compileVar(this.store_var))] = os.networkInterfaces()
        break
      case "get_allmem":
        Event.attributes[String(xr.compileVar(this.store_var))] = os.totalmem()
        break
      case "get_uptime":
        Event.attributes[String(xr.compileVar(this.store_var))] = os.uptime()
        break
      case "get_userinfo":
        Event.attributes[String(xr.compileVar(this.store_var))] = os.userInfo()
        break
    }
  }
}