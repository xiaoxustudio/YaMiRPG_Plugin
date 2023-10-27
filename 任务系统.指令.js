/*
 * @Author: xuranXYS
 * @LastEditTime: 2023-10-27 20:51:50
 * @GitHub: www.github.com/xiaoxustudio
 * @WebSite: www.xiaoxustudio.top
 * @Description: By xuranXYS
 */
/*
@plugin 任务系统
@version 1.0
@author 徐然
@link 
@desc 

任务系统
可进行添加任务，删除任务，保存任务数据等操作

任务标识如果为0，则不会添加任务（除非开启是索引选项）

任务物品列表类型标识：
item（物品）,actor（角色）,skill（技能）,equip（装备）,state（状态）

使用方法：
类型，id，数量

可对任务数据结构添加额外的属性

获取任务键指令如果获取多个键，则会返回列表（可用遍历指令进行遍历）

任务遍历用于遍历任务

@option op {"base","advanced","other"}
@alias 操作 {基础操作,高级操作,其他操作}

@option other_op {"read","save","remove"}
@alias 子操作 {读取任务数据,保存任务数据,删除任务数据}
@cond op {"other"}

@string rw_data_num
@alias 存档索引
@default 0
@cond other_op {"read","save","remove"}

@option advanced_op {"get","set","add_e"}
@alias 子操作 {获取任务键,设置任务键,添加额外任务结构}
@cond op {"advanced"}


@string ad_get
@alias 任务对象变量
@cond advanced_op {"get","set"}

@string ad_exp
@alias 任务键表达式
@cond advanced_op {"get","set"}

@string ad_exp_val
@alias 任务值表达式
@cond advanced_op {"set"}

@string[] rw_struct
@alias 额外任务数据结构
@desc 这里用于添加额外的数据结构
@cond advanced_op {"add_e"}




@string ad_save_var
@alias 保存到本地变量
@cond advanced_op {"get"}

@option base_op {"add","remove","get","check"}
@alias 子操作 {添加任务,删除任务,获取任务,任务遍历}
@cond op {"base"}

@string tag_rw
@alias 任务标识
@cond base_op {"add","get"}

@string title_rw
@alias 任务标题
@cond base_op {"add"}

@number type_rw
@alias 任务类型
@default 0
@cond base_op {"add"}

@string desc_rw
@alias 任务描述
@cond base_op {"add"}

@string[] item_list_str
@alias 开启物品列表
@cond base_op {"add"}

@string remove_rw
@alias 移除任务标识
@cond base_op {"remove"}


@file event_check
@filter event
@alias 遍历事件
@cond base_op {"check"}
@desc 内置变量：
1.@result -> 任务对象
2.@index -> 任务索引

@boolean inherit_check
@alias 继承变量
@default false
@cond base_op {"check"}

@boolean is_reverse
@alias 倒叙遍历
@default false
@desc 从后往前遍历任务
@cond base_op {"check"}

@boolean is_index
@default false
@alias 是索引
@cond base_op {"get"}

@string save_var
@alias 保存到本地变量
@cond base_op {"get"}

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
    while ((match = regex.exec(msg)) !== null) {
      matches.push({ type: match[1], content: match[2] });
    }
    for (let i in matches) {
      if (matches[i]["type"] == "local") {
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
      // 获取attributes属性
      if (matches[i]["type"] == "target") {
        return Event.attributes[matches[i]["content"]]["attributes"]["target"]
      }
    }
    return msg
  }
}


/**
 * @description: 设置对象嵌套值
 * @param {*} a 
 * @param {*} b
 * @param {*} obj
 * @return {*}
 */
function setNestedProperty(a, b, obj) {
  const pathArr = a.split(',');
  const propName = pathArr.pop();
  let nestedObj = obj;
  for (const path of pathArr) {
    if (!nestedObj.hasOwnProperty(path) || typeof nestedObj[path] !== 'object') {
      nestedObj[path] = {};
    }
    nestedObj = nestedObj[path];
  }
  nestedObj[propName] = b;
  return obj;
}

export default class rw_xr {
  _data // 数据
  current_rw
  config
  constructor() {
    this.data = []
    this.current_rw = 0 // 当前任务
    this.config = {}
  }
  // 属性定义
  get data() {
    return this._data
  }
  set data(val) {
    this._data = val
  }

  // 定义基础方法
  saveRwData(number) {
    const suffix = number.toString().padStart(2, '0')
    // MacOS打包缺少写入权限，暂时改成web模式
    let shell = Stats.shell
    if (!Stats.debug && Stats.isMacOS()) {
      shell = 'web'
    }
    switch (shell) {
      case 'electron': {
        const saveDir = File.route('$/Save')
        const dataPath = File.route(`$/Save/save_xr${suffix}.save`)
        let struct = {
          current: this.current_rw,
          config: this.config,
          data: this.data,
        }
        const dataText = JSON.stringify(struct, null, 2)
        const fsp = require('fs').promises
        return fsp.stat(saveDir).catch(error => {
          // 如果不存在存档文件夹，创建它
          return fsp.mkdir('Save')
        }).then(() => Promise.all([
          // 异步写入元数据和存档数据
          fsp.writeFile(dataPath, dataText).catch(error => { console.warn(error) }),
        ]))
      }
      case 'web': {
        const dataKey = `save_xr${suffix}.save`
        let struct = {
          current: this.current_rw,
          config: this.config,
          data: this.data
        }
        return Promise.all([
          IDB.setItem(dataKey, struct),
        ])
      }
    }
  }
  async loadRWData(number) {
    const suffix = number.toString().padStart(2, '0')
    let shell = Stats.shell
    if (!Stats.debug && Stats.isMacOS()) {
      shell = 'web'
    }
    switch (shell) {
      case 'electron':
        // 推迟到栈尾执行
        await void 0
        try {
          // 同步读取存档数据文件
          const path = File.route(`$/Save/save_xr${suffix}.save`)
          const json = require('fs').readFileSync(path)
          let res = JSON.parse(json)
          this.current_rw = res.current
          this.data = res.data
          this.config = res.config
        } catch (error) {
          console.warn(error)
          return
        }
        break
      case 'web': {
        const key = `save${suffix}.save`
        let res = await IDB.getItem(key)
        this.current_rw = res.current
        this.data = res.data
        this.config = res.config
        break
      }
    }
  }
  deleteRWData(number) {
    const suffix = number.toString().padStart(2, '0')
    let shell = Stats.shell
    if (!Stats.debug && Stats.isMacOS()) {
      shell = 'web'
    }
    switch (shell) {
      case 'electron': {
        const dataPath = File.route(`$/Save/save_xr${suffix}.save`)
        const fsp = require('fs').promises
        return Promise.all([
          // 异步删除元数据和存档数据
          fsp.unlink(dataPath).catch(error => { console.warn(error) }),
        ])
      }
      case 'web': {
        const dataKey = `save_xr${suffix}.save`
        return Promise.all([
          IDB.removeItem(dataKey),
        ])
      }
    }
  }
  // 定义回调
  call() {
    switch (this.op) {
      case "base":
        switch (this.base_op) {
          case "add":
            this.add_task({
              title: xr.compileVar(this.title_rw),
              type: this.type_rw,
              desc: xr.compileVar(this.desc_rw),
              tag: xr.compileVar(this.tag_rw),
              item: xr.compileVar(this.item_list_str),
            })
            break
          case "remove":
            this.remove_task(xr.compileVar(this.remove_rw))
            break
          case "get":
            var data = this.get_task(xr.compileVar(this.tag_rw), this.is_index)
            if (data) {
              Event.attributes[this.save_var] = data
            } else {
              Event.attributes[this.save_var] = undefined
            }
            break
          case "check":
            // 查找任务，如果为查找到任务则报错
            if (this.is_reverse) {
              for (let i = this.data.length - 1; i >= 0; i--) {
                const commands = EventManager.guidMap[this.event_check]
                if (commands) {
                  const event = new EventHandler(commands)
                  // 继承变量
                  if (this.inherit_check) {
                    event.inheritEventContext(Event)
                  }
                  event.attributes["@index"] = i
                  event.attributes["@result"] = this.data[i]
                  EventHandler.call(event)
                }
              }
            } else {
              this.data.map((data, ind) => {
                const commands = EventManager.guidMap[this.event_check]
                if (commands) {
                  const event = new EventHandler(commands)
                  // 继承变量
                  if (this.inherit_check) {
                    event.inheritEventContext(Event)
                  }
                  event.attributes["@index"] = ind
                  event.attributes["@result"] = data
                  EventHandler.call(event)
                }
              })
            }
            break
        }
        break
      case "advanced":
        switch (this.advanced_op) {
          case "get":
            var ad_data = xr.compileVar(this.ad_get)
            if (ad_data) {
              let str_split = String(this.ad_exp).trim().split(",")
              if (str_split.length > 1) {
                let is_obj_self = false
                // 自己是否是对象，是的话从自身获取
                if (typeof ad_data == "object") {
                  is_obj_self = true
                }
                // 填充数字键
                let save_arr = {}
                for (let j = 0; j < str_split.length; j++) {
                  save_arr[String(j)] = is_obj_self ? (ad_data?.[str_split?.[j]]) : (Event.attributes[ad_data]?.[str_split?.[j]])
                }
                Event.attributes[this.ad_save_var] = save_arr
              } else {
                let is_obj_self = false
                // 自己是否是对象，是的话从自身获取
                if (typeof ad_data == "object") {
                  is_obj_self = true
                }
                Event.attributes[this.ad_save_var] = is_obj_self ? ad_data[this.ad_exp] : (Event.attributes[ad_data][this.ad_exp])
              }
            }
            break
          case "set":
            var ad_data = xr.compileVar(this.ad_get)
            if (ad_data) {
              let str_split = String(this.ad_exp).trim().split(",")
              if (str_split.length > 1) {
                setNestedProperty(String(this.ad_exp), String(this.ad_exp_val), Event.attributes[ad_data])
              } else {
                Event.attributes[ad_data][this.ad_exp] = xr.compileVar(this.ad_exp_val)
              }
            }
            break
        }
        break
      case "other":
        switch (this.other_op) {
          case "read":
            this.loadRWData(xr.compileVar(this.rw_data_num))
            break
          case "remove":
            this.deleteRWData(xr.compileVar(this.rw_data_num))
            break
          case "save":
            this.saveRwData(xr.compileVar(this.rw_data_num))
            break
        }
        break
    }
  }
  // 定义方法
  /**
   * @description: 添加任务
   * @param {*} title
   * @param {*} desc
   * @param {*} tag
   * @return {*}
   */
  add_task({ title, desc, item = [], state = false, tag = -1 }) {
    // 额外属性
    let ex_data = {}
    for (let i = 0; i < this.rw_struct.length; i++) {
      ex_data[this.rw_struct[i]] = undefined
    }
    let item_jx = []
    for (let i in item) {
      let str_splice = String(item[i]).trim().split(",")
      item_jx.push({ type: String(str_splice[0]).trim(), id: String(str_splice[1]).trim(), num: String(str_splice[2]).trim() })
    }
    if (tag !== -1) {
      this.data.push({ title, desc, tag, state, item: item_jx, ...ex_data })
    }
  }
  /**
   * @description: 查找任务，通过tag
   * @param {*} tag 标识
   * @return {*}
   */
  find_task(tag) {
    let f_index = -1
    this.data.map((data, ind) => {
      if (data.tag == tag) {
        f_index = ind
        return f_index
      }
    })
    return f_index
  }

  /**
   * @description: 删除任务
   * @param {*} tag 任务标识
   * @return {*}
   */
  remove_task(tag) {
    if (this.find_task(tag) != -1) {
      this.data.map((data, ind) => {
        if (data.tag == tag) {
          delete data[tag]
          return f_index
        }
      })
    }
  }
  /**
   * @description: 获取任务
   * @param {*} tag 任务标识
   * @return {*}
   */
  get_task(tag, is_index = false) {
    if (is_index) {
      return this.data[tag] ? this.data[tag] : undefined
    }
    let data = this.find_task(tag)
    if (data != -1) {
      return this.data[data]
    }
    return undefined
  }
}




