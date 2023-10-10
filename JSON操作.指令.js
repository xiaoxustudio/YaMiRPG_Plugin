/*
 * @Author: xuranXYS
 * @LastEditTime: 2023-10-10 11:35:51
 * @GitHub: www.github.com/xiaoxustudio
 * @WebSite: www.xiaoxustudio.top
 * @Description: By xuranXYS
 * 

 */

/*
@plugin Json操作
@version 1.0
@author 徐然
@link https://space.bilibili.com/291565199
@desc 

可以创建JSON对象
对JSON对象进行操作

空对象：创建一个空的对象
变量对象：将变量中的JSON对象复制过来
填充对象：使用输入的键值作为对象
字符串JSON：将JSON字符串转换为JSON对象

键列表和值列表可一次添加多个（逗号分割）
键列表会移除空格
键列表和值列表可使用<local|global:var_name>


@option op {"create_json","add_key_val","rm_key","is_key","map_json","change_str_json"}
@alias 操作 {创建JSON,设置键值,移除键,键是否存在,遍历键值,转换为JSON字符串}

@option create_sub {"null_obj","var_obj","fill_obj","str_json"}
@alias 类型 {空对象,变量对象,填充对象,字符串JSON}
@cond op {"create_json"} 
@desc 
空对象：创建一个空的对象
变量对象：将变量中的JSON对象复制过来
填充对象：使用输入的键值作为对象

@string key_list_f
@alias 键列表
@cond create_sub {"fill_obj"}
@desc key列表（多个用逗号分割）

@string val_list_f
@alias 值列表
@cond create_sub {"fill_obj"}
@desc value列表（多个用逗号分割）

@string extend_var
@alias 继承变量
@cond create_sub {"var_obj"}
@desc 继承变量里面的JSON对象

@string json_content
@alias json字符串
@cond create_sub {"str_json"}
@desc 将JSON字符串转换为JSON对象


@string set_var
@alias 目标变量
@default "json_obj"
@desc 设置要操作的目标对象
@cond op {"add_key_val","is_key","map_json","change_str_json"}

@string key_list
@alias 键列表
@cond op {"add_key_val","rm_key","is_key"}
@desc key列表（多个用逗号分割）

@string val_list
@alias 值列表
@cond op {"add_key_val"}
@desc value列表（多个用逗号分割）


@string save_var
@alias 存储变量
@default "json_obj"
@desc 操作结果存储到本地变量
@cond op {"create_json","is_key","change_str_json"}

@file event_map
@filter event
@alias 遍历事件
@desc 固定变量：
$key：遍历出的键
$val：遍历出的值
@cond op {"map_json"} 
*/
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
export default class JSON_xr {
  call() {
    switch (this.op) {
      case "create_json":
        switch (this.create_sub) {
          case "null_obj":
            Event.attributes[String(this.save_var)] = {}
            break
          case "var_obj":
            var var_str = Event.attributes[xr.compileVar(this.extend_var)]
            Event.attributes[String(this.save_var)] = typeof var_str == "object" ? Object.assign({}, var_str) : undefined
            break
          case "fill_obj":
            var key = xr.compileVar(String(this.key_list_f)).split(",")
            key.map((val, index) => {
              key[index] = val.trim()
            })
            var val = xr.compileVar(String(this.val_list_f)).split(",")
            val.map((vals, index) => {
              val[index] = vals.trim()
            })
            if (key.length > 1) {
              for (let i = 0; i < key.length; i++) {
                if (xr.is_obj(Event.attributes[String(this.save_var)])) {
                  Event.attributes[String(this.save_var)][key[i]] = xr.compileVar(val[String(i)])
                }
              }
            } else {
              if (xr.is_obj(Event.attributes[String(this.save_var)])) {
                Event.attributes[String(this.save_var)][key[0]] = xr.compileVar(this.val_list)
              }
            }
            key = undefined
            val = undefined
            break
          case "str_json":
            try {
              let json_str = xr.compileVar(this.json_content)
              var json_p = JSON.parse(json_str)
              Event.attributes[String(this.save_var)] = Object.assign({}, json_p)
              json_p = undefined
            } catch {
              Event.attributes[String(this.save_var)] = undefined
            }
            break
        }
        break
      case "add_key_val":
        var key = xr.compileVar(String(this.key_list)).split(",")
        key.map((val, index) => {
          key[index] = val.trim()
        })
        var val = xr.compileVar(String(this.val_list)).split(",")
        val.map((vals, index) => {
          val[index] = vals.trim()
        })
        if (key.length > 1) {
          for (let i = 0; i < key.length; i++) {
            if (xr.is_obj(Event.attributes[String(this.set_var)])) {
              Event.attributes[String(this.set_var)][key[i]] = xr.compileVar(val[String(i)])
            }
          }
        } else {
          if (xr.is_obj(Event.attributes[String(this.set_var)])) {
            Event.attributes[String(this.set_var)][key[0]] = xr.compileVar(this.val_list)
          }
        }
        key = undefined
        val = undefined
        break
      case "rm_key":
        if (typeof Event.attributes[String(this.set_var)] == "object") {
          var key = xr.compileVar(String(this.key_list)).split(",")
          key.map((val, index) => {
            key[index] = val.trim()
          })
          if (key.length > 1) {
            for (let i = 0; i < key.length; i++) {
              delete Event.attributes[String(this.set_var)][key[i]]
            }
          }
          else {
            delete Event.attributes[String(this.set_var)][key[0]]
          }
        }
        break
      case "is_key":
        if (typeof Event.attributes[String(this.set_var)] == "object") {
          var key = xr.compileVar(String(this.key_list)).split(",")
          key.map((val, index) => {
            key[index] = val.trim()
          })
          var db_arr = Array(key.length).fill(true);
          if (key.length > 1) {
            for (let i = 0; i < key.length; i++) {
              if (Event.attributes[String(this.set_var)][key[i]]) {
                db_arr = db_arr.slice(0, 1)
                continue
              }
            }
            if (db_arr.length == 0) {
              Event.attributes[String(this.save_var)] = true
            } else {
              Event.attributes[String(this.save_var)] = false
            }
          }
          else {
            Event.attributes[String(this.save_var)] = typeof Event.attributes[String(this.set_var)][key[0]] !== "undefined" ? true : false
          }
        }
        break
      case "map_json":
        var arr = Event.attributes[xr.compileVar(this.set_var)]
        var emap = this.event_map
        if (typeof arr == "object" && emap) {
          for (let i in arr) {
            const commands = EventManager.guidMap[emap]
            if (commands) {
              const e_event = new EventHandler(commands)
              e_event.inheritEventContext(Event)
              e_event.attributes["$key"] = i
              e_event.attributes["$val"] = arr[i]
              EventHandler.call(e_event)
            }
          }
        }
        arr = undefined
        emap = undefined
        break
      case "change_str_json":
        var v1 = Event.attributes[xr.compileVar(this.set_var)]
        if (typeof v1 == "object") {
          Event.attributes[this.save_var] = JSON.stringify(v1)
        }
        break
    }
  }
}