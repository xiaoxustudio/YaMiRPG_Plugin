/*
@plugin 对象设置
@version 1.0
@author 徐然
@link https://space.bilibili.com/291565199
@desc

可设置Object对象的键值
键可用,(英文逗号)分割来指定嵌套键
键值都可使用变量标识<local|global:Var_Name>

@string obj
@alias 对象

@string obj_key
@alias 对象键

@string obj_value
@alias 对象值

*/

class xr {
  static showInfo() {
    console.log(
      `   ____         __   __                      \n` +
      `  |  _ \\        \\ \\ / /                      \n` +
      `  | |_) |_   _   \\ V /_   _ _ __ __ _ _ __   \n` +
      `  |  _ <| | | |   > <| | | | '__/ _\` | '_ \\  \n` +
      `  | |_) | |_| |  / . \\ |_| | | | (_| | | | | \n` +
      `  |____/ \\__, | /_/ \\_\\__,_|_|  \\__,_|_| |_| \n` +
      `          __/ |                              \n` +
      `         |___/                               \n` +
      "\n\n对象设置\n\n" +
      "🏠b站：https://space.bilibili.com/291565199\n\n" +
      "📞github：https://github.com/xiaoxustudio\n\n" +
      "🌒官网：www.xiaoxustudio.top\n\n"
    )
  }
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
        if (typeof xr.get_glocal(matches[i]["content"]) == "object") {
          let data = xr.get_glocal(matches[i]["content"]);
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
            xr.get_glocal(matches[i]["content"])
          );
        }
      }
    }
    return msg
  }
}

export default class obj_set_xr {
  call() {
    const obj = xr.compileVar(this.obj)
    const obj_key = xr.compileVar(this.obj_key)
    const obj_value = xr.compileVar(this.obj_value)
    if(obj && obj_key && obj_value){
      let str_split = String(obj_key).split(",")
      let call_str = ""
      for(let i =0;i<str_split.length;i++){
        call_str += "."+str_split[i]
      }
      new Function(obj+call_str+"="+obj_value)()
    }
  }
}