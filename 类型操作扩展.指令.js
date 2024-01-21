/*
@plugin 类型操作扩展
@version 1.0
@author 徐然
@link https://space.bilibili.com/291565199
@desc 

对布尔值、字符串、列表类型进行了功能扩展
使其对布尔值、字符串、列表拥有了更多的处理操作方法

@variable-getter var_target
@alias 目标变量
@desc 需要操作的变量

@option op {"bool","str","list"}
@alias 目标类型 {布尔值,字符串,列表}

@option bool_op {"reverse"}
@alias 功能操作 {值反向}
@cond op {"bool"}
@desc 
值反向：目标变量为true，则设置其为false，反之亦然

@option str_op {"reg","toupper","tolower","indexof","lastindexof","endwith","trim","u_create"}
@alias 功能操作 {正则匹配,转换为大写字母,转换为小写字母,第一次出现的位置,最后一次出现的位置,结尾是否包含特定字符,去除全部空格,Unicode值序列创建字符串}
@cond op {"str"}

@string reg_tag
@alias 匹配标识
@cond op {"str"}
@desc
g （全局匹配）
找到所有的匹配，而不是在第一个匹配之后停止。

i （忽略大小写）
如果u标志也被启用，使用 Unicode 大小写折叠。

m （多行匹配）
将开始和结束字符 (^ and $) 视为在多行上工作。换句话说，匹配每一行的开头或结尾each line (由\n或者\r 分隔)，而不仅仅是整个输入字符串的开头或结尾。

s （点号匹配所有字符）
允许. 去匹配新的行

u （unicode）
将模式视为Unicode代码点的序列。(参见二进制字符串)。

y （sticky，粘性匹配）
只匹配目标字符串中由该正则表达式的lastIndex属性所指示的索引。不尝试从任何后面的索引进行匹配。

@string regstr
@alias 正则表达式
@cond str_op {"reg"}
@desc 正则表达式

@option list_op {"unpop","pop","unshift","concat","reverse","slice"}
@alias 功能操作 {移出第一项,移出最后一项,添加到列表开头,拼接两个列表,翻转列表,切割列表}
@cond op {"list"}
@desc
翻转列表：将列表从后往前翻转
切割列表：切割列表从 数字 到 数字1 （不包括该元素），如果 数字1 为空则从 数字 处切割到最后

@variable-number var_num
@alias 数字
@cond str_op {"u_create","fill","slice"}
@desc 操作的数字

@string op_string
@alias 字符串
@cond str_op {"endwith","indexof","lastindexof"}
@desc 操作字符串

@variable-getter var_var
@alias 变量
@cond list_op {"unshift","concat","fill"}
@desc 操作变量

@variable-number var_num_list
@alias 数字
@cond list_op {"slice"}
@desc 操作的数字

@variable-number var_num_list1
@alias 数字1
@cond list_op {"slice"}
@desc 操作的数字

@boolean is_save
@alias 是否另存变量
@default false
@desc 是否将操作结果另存为一个变量

@variable-getter var_save
@alias 保存到变量
@desc 存储结果的变量(是否另存变量开启才可存储)

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
export default class TypeOp_xr {
  call() {
    switch (this.op) {
      case "bool": {
        switch (this.bool_op) {
          case "reverse": {
            if (this.is_save) { this.var_save?.set(!this.var_target?.get()) }
            else { this.var_target?.set(!this.var_target?.get()) }
            break
          }
        }
        break
      }
      case "str": {
        switch (this.str_op) {
          case "reg":{
            if (this.is_save) {
              this.var_save?.set(String(this.var_target?.get()).match(new RegExp(this.regstr,this.reg_tag)))
            } else {
              this.var_target?.set(String(this.var_target?.get()).match(new RegExp(this.regstr,this.reg_tag)))
              console.warn("设置不匹配类型，你应该另存一个数据")
            }
            break
          }
          case "u_create": {
            if (this.is_save) {
              this.var_save?.set(String.fromCharCode(typeof this.var_num == "number" ? this.var_num : this.var_num?.get()))
            } else {
              this.var_target?.set(String.fromCharCode(typeof this.var_num == "number" ? this.var_num : this.var_num?.get()))
            }
            break
          }
          case "endwith": {
            if (this.is_save) {
              this.var_save?.set(String(this.var_target?.get()).endsWith(xr.compileVar(this.op_string)))
            } else {
              this.var_target?.set(String(this.var_target?.get()).endsWith(xr.compileVar(this.op_string)))
            }
            break
          } case "tolower": {
            if (this.is_save) {
              this.var_save?.set(String(this.var_target?.get()).toLowerCase())
            } else { this.var_target?.set(String(this.var_target?.get()).toLowerCase()) }
            break
          } case "toupper": {
            if (this.is_save) {
              this.var_save?.set(String(this.var_target?.get()).toUpperCase())
            } else { this.var_target?.set(String(this.var_target?.get()).toUpperCase()) }
            break
          } case "indexof": {
            if (this.is_save) {
              this.var_save?.set(String(this.var_target?.get()).indexOf(xr.compileVar(this.op_string)))
            } else { this.var_target?.set(String(this.var_target?.get()).indexOf(xr.compileVar(this.op_string))) }
            break
          } case "lastindexof": {
            if (this.is_save) {
              this.var_save?.set(String(this.var_target?.get()).lastIndexOf(xr.compileVar(this.op_string)))
            } else { this.var_target?.set(String(this.var_target?.get()).lastIndexOf(xr.compileVar(this.op_string))) }
            break
          } case "trim": {
            if (this.is_save) {
              this.var_save?.set(String(this.var_target?.get().replace(/\s+/g, "")))
            } else { this.var_target?.set(String(this.var_target?.get().replace(/\s+/g, ""))) }
            break
          }
        }
        break
      }
      case "list": {
        switch (this.list_op) {
          case "unpop": {
            if (this.is_save) { let list = xr.deepObject(this.var_target?.get()); list.shift(); this.var_save?.set(list) }
            else { this.var_target?.get().shift(); this.var_target?.set(this.var_target?.get()) }
            break
          } case "pop": {
            if (this.is_save) { let list = xr.deepObject(this.var_target?.get()); list.pop(); this.var_save?.set(list) }
            else { this.var_target?.get().pop(); this.var_target?.set(this.var_target?.get()) }
            break
          } case "unshift": {
            if (this.is_save) { let list = xr.deepObject(this.var_target?.get()); list.unshift(this.var_var?.get()); this.var_save?.set(list) }
            else { this.var_target?.get().unshift(this.var_var?.get()) }
            break
          } case "concat": {
            if (this.is_save) { let list = [...xr.deepObject(this.var_target?.get()), ...this.var_var?.get()]; this.var_save?.set(list) }
            else { let list = [...xr.deepObject(this.var_target?.get()), ...this.var_var?.get()]; this.var_target?.set(list) }
            break
          } case "reverse": {
            if (this.is_save) { let list = xr.deepObject(this.var_target?.get()); list.reverse(); this.var_save?.set(list) }
            else { this.var_target?.get().reverse(); this.var_target?.set(this.var_target?.get()) }
            break
          } case "slice": {
            if (this.is_save) {
              let s_num = (typeof this.var_num_list == "number" ? this.var_num_list : this.var_num_list?.get());
              let s_num1 = (typeof this.var_num_list1 == "number" ? this.var_num_list1 : this.var_num_list1?.get());
              ; this.var_save?.set(this.var_target?.get().slice(s_num, s_num1))
            }
            else {
              let s_num = (typeof this.var_num_list == "number" ? this.var_num_list : this.var_num_list?.get());
              let s_num1 = (typeof this.var_num_list1 == "number" ? this.var_num_list1 : this.var_num_list1?.get());
              this.var_target?.set(this.var_target?.get().slice(s_num, s_num1))
            }
            break
          }
        }
        break
      }
    }
  }
}