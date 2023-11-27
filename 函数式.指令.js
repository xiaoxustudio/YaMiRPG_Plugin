/*
 * @Author: xuranXYS
 * @LastEditTime: 2023-11-27 12:51:16
 * @GitHub: www.github.com/xiaoxustudio
 * @WebSite: www.xiaoxustudio.top
 * @Description: By xuranXYS
 */
/*
@plugin 函数式.指令
@version 1.1
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

@option call_op_sw {"common","scene","actor","skill","state","equip","item","light","elem","region"}
@alias 事件类型 {普通函数式,场景,角色,技能,状态,装备,物品,光源,元素,区域}
@cond op {"call"}

@option call_op_scene {"ori","enum"}
@alias 事件子分类 {原生事件,枚举事件}
@cond call_op_sw {"scene"}

@option SceneEvent_ori {"create","autorun"}
@alias 事件键 {创建事件,自动执行}
@desc 场景原生事件列表
@cond call_op_scene {"ori"}

@enum SceneEvent
@filter scene-event
@alias 事件键
@desc 填入相应的事件键值或中文事件名称
@cond call_op_scene {"enum"}

@option call_op_actor {"ori","enum"}
@alias 事件子分类 {原生事件,枚举事件}
@cond call_op_sw {"actor"}

@actor-getter Actor
@alias 角色
@cond call_op_sw {"actor"}

@option ActorEvent_ori {"create","autorun","collision","hittrigger","talk","level-up","death","drop"}
@alias 事件键 {创建事件,自动执行,碰撞事件,击中触发器,对话事件,升级事件,死亡事件,掉落事件}
@desc 角色原生事件列表
@cond call_op_actor {"ori"}

@enum ActorEvent
@filter actor-event
@alias 事件键
@desc 填入相应的事件键值或中文事件名称
@cond call_op_actor {"enum"}

@option call_op_skill {"ori","enum"}
@alias 事件子分类 {原生事件,枚举事件}
@cond call_op_sw {"skill"}

@skill-getter Skill
@alias 技能
@cond call_op_sw {"skill"}

@option SkillEvent_ori {"skillcast","skilladd","skillremove"}
@alias 事件键 {施放技能,技能添加,技能移除}
@desc 技能原生事件列表
@cond call_op_skill {"ori"}

@enum SkillEvent
@filter skill-event
@alias 事件键
@desc 填入相应的事件键值或中文事件名称
@cond call_op_skill {"enum"}

@option call_op_state {"ori","enum"}
@alias 事件子分类 {原生事件,枚举事件}
@cond call_op_sw {"state"}

@state-getter State
@alias 状态
@cond call_op_sw {"state"}

@option StateEvent_ori {"stateadd","stateremove","autorun"}
@alias 事件键 {添加状态,移除状态,自动执行}
@desc 状态原生事件列表
@cond call_op_state {"ori"}

@enum StateEvent
@filter state-event
@alias 事件键
@desc 填入相应的事件键值或中文事件名称
@cond call_op_state {"enum"}

@option call_op_equip {"ori","enum"}
@alias 事件子分类 {原生事件,枚举事件}
@cond call_op_sw {"equip"}

@equipment-getter Equipment
@alias 装备
@cond call_op_sw {"equip"}

@option EquipmentEvent_ori {"equipmentadd","equipmentremove","create"}
@alias 事件键 {添加装备,移除装备,创建事件}
@desc 装备原生事件列表
@cond call_op_equip {"ori"}

@enum EquipmentEvent
@filter equipment-event
@alias 事件键
@desc 填入相应的事件键值或中文事件名称
@cond call_op_equip {"enum"}

@option call_op_item {"ori","enum"}
@alias 事件子分类 {原生事件,枚举事件}
@cond call_op_sw {"item"}

@item-getter Item
@alias 物品
@cond call_op_sw {"item"}

@option ItemEvent_ori {"itemuse"}
@alias 事件键 {使用物品}
@desc 物品原生事件列表
@cond call_op_item {"ori"}

@enum ItemEvent
@filter item-event
@alias 事件键
@desc 填入相应的事件键值或中文事件名称
@cond call_op_item {"enum"}

@option call_op_light {"ori","enum"}
@alias 事件子分类 {原生事件,枚举事件}
@cond call_op_sw {"light"}

@light Light
@alias 光源
@cond call_op_sw {"light"}

@option LightEvent_ori {"autorun"}
@alias 事件键 {自动执行}
@desc 光源原生事件列表
@cond call_op_light {"ori"}

@enum LightEvent
@filter light-event
@alias 事件键
@desc 填入相应的事件键值或中文事件名称
@cond call_op_light {"enum"}

@option call_op_elem {"ori","enum"}
@alias 事件子分类 {原生事件,枚举事件}
@cond call_op_sw {"elem"}

@element-getter element
@alias 元素
@cond call_op_sw {"elem"}

@option ElementEvent_ori {"keydown","keyup","mousedown","mousedownLB","mousedownRB","mouseup","mouseupLB","mouseupRB","mousemove","mouseenter","mouseleave","click","doubleclick","wheel","input","focus","blur","destroy"}
@alias 事件键 {键盘按下,键盘抬起,鼠标按下,左键按下,右键按下,鼠标抬起,左键抬起,右键抬起,鼠标移动,鼠标进入,鼠标离开,鼠标点击,鼠标双击,滚轮滑动,输入事件,获取焦点,失去焦点,销毁事件}
@desc 元素原生事件列表
@cond call_op_elem {"ori"}

@enum ElementEvent
@filter element-event
@alias 事件键
@desc 填入相应的事件键值或中文事件名称
@cond call_op_elem {"enum"}

@string func_name_call
@alias 函数名称
@cond call_op_sw {"common"}
@desc 函数名称，用于调用函数

@option call_op_region {"ori","enum"}
@alias 事件子分类 {原生事件,枚举事件}
@cond call_op_sw {"region"}

@region Region
@alias 区域
@cond call_op_sw {"region"}

@option RegionEvent_ori {"autorun","playerenter","playerleave","actorenter","actorleave"}
@alias 事件键 {自动执行,玩家进入,玩家离开,角色进入,角色离开}
@desc 区域原生事件列表
@cond call_op_region {"ori"}

@enum RegionEvent
@filter region-event
@alias 事件键
@desc 填入相应的事件键值或中文事件名称
@cond call_op_region {"enum"}

@string func_name
@alias 函数名称
@cond op {"create"}
@desc 函数名称，用于调用函数

@string[] params
@alias 参数列表
@cond op {"create","call"}
@desc 函数的参数列表
key : value -> 设置或传入参数key的(默认)值为value
key -> 设置或传入参数key的(默认)值为null （单独key）

PS：当value为(value)格式时，会将value转换为js值
可用<*:*>格式获取当前到参数列表里面

@boolean is_share
@alias 共享当前本地变量
@cond op {"call"}
@desc 共享当前的本地变量

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
        for (let i in obj.commands) {
          let cmdf = obj.commands[i]
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
  }
  filter()
  arr = undefined
  func_list.MapTo = f_arr
}
function SelfGUID() {
  function getException() { try { throw Error(''); } catch (err) { return err; } }
  return String(getException().stack).split("\n")[1].substring("at getException (").match(/[./]([0-9a-f]{16})\.\S+$/)[1].trim()
}
const TypeMap = {}
const TypeMap_Ori = {
  update: '更新事件',
  create: '创建事件',
  autorun: '自动执行',
  collision: '碰撞事件',
  hittrigger: '击中触发器',
  hitactor: '击中角色',
  destroy: '销毁事件',
  playerenter: '玩家进入',
  playerleave: '玩家离开',
  actorenter: '角色进入',
  actorleave: '角色离开',
  skillcast: '施放技能',
  skilladd: '技能添加',
  skillremove: '技能移除',
  stateadd: '状态添加',
  stateremove: '状态移除',
  equipmentadd: '装备添加',
  equipmentremove: '装备移除',
  itemuse: '物品使用',
  keydown: '键盘按下',
  keyup: '键盘抬起',
  mousedown: '鼠标按下',
  mousedownLB: '左键按下',
  mousedownRB: '右键按下',
  mouseup: '鼠标抬起',
  mouseupLB: '左键抬起',
  mouseupRB: '右键抬起',
  mousemove: '鼠标移动',
  mouseenter: '鼠标进入',
  mouseleave: '鼠标离开',
  click: '鼠标点击',
  doubleclick: '鼠标双击',
  wheel: '滚轮滑动',
  input: '输入事件',
  focus: '获取焦点',
  blur: '失去焦点',
  destroy: '销毁事件',
}
let key = Object.values(TypeMap_Ori)
let val = Object.keys(TypeMap_Ori)
for (let i in key) {
  TypeMap[key[i]] = val[i]
}
class Functions_xr {
  onStart() {
    init(this)
    window.func_list = func_list
  }
  compileParam(params) {
    let p = {}
    for (let i in params) {
      let content = String(params[i]).trim()
      if (/\s*([a-zA-Z0-9]+)\s*:\s*(.+)\s*/.test(content)) {
        let res = content.match(/\s*([a-zA-Z0-9]+)\s*:\s*(.+)\s*/)
        if (/\s*\(\s*(.+)\s*\)\s*/.test(res[2])) {
          try {
            let val = res[2].match(/\s*\(\s*(.+)\s*\)\s*/)[1]
            if (typeof val === "object") { p[res[1]] = val }
            else { p[res[1]] = new Function("return " + val)() }
          } catch (e) {
            console.error("编译参数列表错误")
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
    return p
  }
  compileType(type) {
    type = typeof type === "object" ? type : String(type).trim()
    type = TypeMap[type] || type
    let stype = Enum.getValue(type.id) || type
    return stype
  }
  call() {
    switch (this.op) {
      case "call": {
        switch (this.call_op_sw) {
          case "common": {
            if (func_list.has(this.func_name_call)) {
              try {
                let p = this.compileParam(this.params)
                let res = this.func_res_set
                let event = new EventHandler(func_list.obj[this.func_name].obj.commands)
                event.params = p
                if (this.is_share) { event.inheritEventContext(Event) }
                EventHandler.call(event, new ModuleList())
                if (event.complete) {
                  res?.set(event.result || null)
                }
              } catch (e) {
                console.error("函数式事件调用失败：" + this.func_name_call + "\n\n报错文件：" + func_list.MapTo[0][func_list.obj[this.func_name_call].index])
                throw e
              }
            }
            break
          }
          case "scene": {
            try {
              let p = this.compileParam(this.params)
              let res = this.func_res_set
              const type = this.call_op_scene == "enum" ? this.compileType(this.SceneEvent) : this.compileType(this.SceneEvent_ori)
              let e_cmd = Scene.binding?.events[type]
              if (e_cmd) {
                const event = new EventHandler(e_cmd)
                event.params = p
                if (this.is_share) { event.inheritEventContext(Event) }
                EventHandler.call(event, Scene.binding?.updaters)
                if (event.complete) {
                  res?.set(event.result || null)
                }
              }
            } catch (e) {
              console.error("场景函数式事件调用失败：" + this.call_op_scene == "enum" ? this.compileType(this.SceneEvent) : this.compileType(this.SceneEvent_ori))
              throw e
            }
            break
          }
          case "actor": {
            try {
              let p = this.compileParam(this.params)
              let res = this.func_res_set
              const getActor = this.Actor
              const type = this.call_op_actor == "enum" ? this.compileType(this.ActorEvent) : this.compileType(this.ActorEvent_ori)
              let e_cmd = getActor?.events[type]
              if (e_cmd) {
                const event = new EventHandler(e_cmd)
                event.params = p
                if (this.is_share) { event.inheritEventContext(Event) }
                event.triggerActor = getActor
                event.selfVarId = getActor.selfVarId
                EventHandler.call(event, getActor?.updaters)
                if (event.complete) {
                  res?.set(event.result || null)
                }
              }
            } catch (e) {
              console.error("角色函数式事件调用失败：" + this.call_op_actor == "enum" ? this.compileType(this.ActorEvent) : this.compileType(this.ActorEvent_ori))
              throw e
            }
            break
          }
          case "skill": {
            try {
              let p = this.compileParam(this.params)
              let res = this.func_res_set
              const getObj = this.Skill
              const actor = getObj.parent?.actor
              const type = this.call_op_skill == "enum" ? this.compileType(this.SkillEvent) : this.compileType(this.SkillEvent_ori)
              let e_cmd = getObj?.events[type]
              if (e_cmd) {
                switch (type) {
                  case 'skilladd':
                  case 'skillremove':
                    EventManager.emit(type, null, {
                      triggerSkill: getObj,
                      triggerActor: actor,
                      casterActor: actor,
                    })
                    break
                }
                const event = new EventHandler(e_cmd)
                event.params = p
                if (this.is_share) { event.inheritEventContext(Event) }
                event.triggerSkill = getObj
                event.triggerActor = actor
                event.casterActor = actor
                EventHandler.call(event, actor?.updaters)
                if (event.complete) {
                  res?.set(event.result || null)
                }
              }
            } catch (e) {
              console.error("技能函数式事件调用失败：" + this.call_op_skill == "enum" ? this.compileType(this.SkillEvent) : this.compileType(this.SkillEvent_ori))
              throw e
            }
            break
          }
          case "state": {
            try {
              let p = this.compileParam(this.params)
              let res = this.func_res_set
              const getObj = this.State
              const actor = getObj.parent?.actor
              const caster = getObj.caster ?? undefined
              const type = this.call_op_state == "enum" ? this.compileType(this.StateEvent) : this.compileType(this.StateEvent_ori)
              let e_cmd = getObj?.events[type]
              if (e_cmd) {
                switch (type) {
                  case 'stateadd':
                  case 'stateremove':
                    EventManager.emit(type, null, {
                      triggerState: getObj,
                      triggerActor: actor,
                      casterActor: caster,
                    })
                    break
                }
                const event = new EventHandler(e_cmd)
                event.params = p
                if (this.is_share) { event.inheritEventContext(Event) }
                event.triggerState = getObj
                event.triggerActor = actor
                event.casterActor = caster
                EventHandler.call(event, getObj?.updaters)
                if (event.complete) {
                  res?.set(event.result || null)
                }
              }
            } catch (e) {
              console.error("状态函数式事件调用失败：" + this.call_op_state == "enum" ? this.compileType(this.StateEvent) : this.compileType(this.StateEvent_ori))
              throw e
            }
            break
          }
          case "equipment": {
            try {
              let p = this.compileParam(this.params)
              let res = this.func_res_set
              const getObj = this.Equipment
              const actor = getObj.parent?.actor
              const type = this.call_op_equip == "enum" ? this.compileType(this.EquipmentEvent) : this.compileType(this.EquipmentEvent_ori)
              let e_cmd = getObj?.events[type]
              if (e_cmd) {
                switch (type) {
                  case 'equipmentadd':
                  case 'equipmentremove':
                  case 'equipmentgain':
                    EventManager.emit(type, null, {
                      triggerActor: actor,
                      triggerEquipment: getObj,
                    })
                    break
                }
                const event = new EventHandler(e_cmd)
                event.params = p
                if (this.is_share) { event.inheritEventContext(Event) }
                event.triggerActor = actor
                event.triggerEquipment = getObj
                EventHandler.call(event, actor?.updaters)
                if (event.complete) {
                  res?.set(event.result || null)
                }
              }
            } catch (e) {
              console.error("装备函数式事件调用失败：" + this.call_op_equip == "enum" ? this.compileType(this.EquipmentEvent) : this.compileType(this.EquipmentEvent_ori))
              throw e
            }
            break
          }
          case "Item": {
            try {
              let p = this.compileParam(this.params)
              let res = this.func_res_set
              const getObj = this.Item
              const actor = getObj.parent?.actor
              const type = this.call_op_item == "enum" ? this.compileType(this.ItemEvent) : this.compileType(this.ItemEvent_ori)
              let e_cmd = getObj?.events[type]
              if (e_cmd) {
                switch (type) {
                  case 'itemgain':
                    EventManager.emit(type, null, {
                      triggerActor: actor,
                      triggerItem: getObj,
                    })
                    break
                }
                const event = new EventHandler(e_cmd)
                event.params = p
                if (this.is_share) { event.inheritEventContext(Event) }
                event.triggerActor = actor
                event.triggerItem = getObj
                EventHandler.call(event, actor?.updaters)
                if (event.complete) {
                  res?.set(event.result || null)
                }
              }
            } catch (e) {
              console.error("物品函数式事件调用失败：" + this.call_op_item == "enum" ? this.compileType(this.ItemEvent) : this.compileType(this.ItemEvent_ori))
              throw e
            }
            break
          }
          case "light": {
            try {
              let p = this.compileParam(this.params)
              let res = this.func_res_set
              const getObj = this.Light
              const type = this.call_op_light == "enum" ? this.compileType(this.LightEvent) : this.compileType(this.LightEvent_ori)
              let e_cmd = getObj?.events[type]
              if (e_cmd) {
                const event = new EventHandler(e_cmd)
                event.params = p
                if (this.is_share) { event.inheritEventContext(Event) }
                event.triggerLight = getObj
                event.selfVarId = getObj.selfVarId
                EventHandler.call(event, getObj?.updaters)
                if (event.complete) {
                  res?.set(event.result || null)
                }
              }
            } catch (e) {
              console.error("物品函数式事件调用失败：" + this.call_op_light == "enum" ? this.compileType(this.LightEvent) : this.compileType(this.LightEvent_ori))
              throw e
            }
            break
          }
          case "elem": {
            try {
              let p = this.compileParam(this.params)
              let res = this.func_res_set
              const getObj = this.Element
              const type = this.call_op_elem == "enum" ? this.compileType(this.ElementEvent) : this.compileType(this.ElementEvent_ori)
              let e_cmd = getObj?.events[type]
              if (e_cmd) {
                const event = new EventHandler(e_cmd)
                event.params = p
                if (this.is_share) { event.inheritEventContext(Event) }
                event.priority = true
                event.bubble = true
                event.triggerElement = getObj
                EventHandler.call(event, getObj?.updaters)
                if (event.complete) {
                  res?.set(event.result || null)
                }
              }
            } catch (e) {
              console.error("物品函数式事件调用失败：" + this.call_op_elem == "enum" ? this.compileType(this.ElementEvent) : this.compileType(this.ElementEvent_ori))
              throw e
            }
            break
          }
          case "region": {
            try {
              let p = this.compileParam(this.params)
              let res = this.func_res_set
              const getObj = this.Region
              const type = this.call_op_region == "enum" ? this.compileType(this.RegionEvent) : this.compileType(this.RegionEvent_ori)
              let e_cmd = getObj?.events[type]
              if (e_cmd) {
                const event = new EventHandler(e_cmd)
                event.params = p
                if (this.is_share) { event.inheritEventContext(Event) }
                event.triggerRegion = getObj
                event.selfVarId = getObj.selfVarId
                EventHandler.call(event, getObj?.updaters)
                if (event.complete) {
                  res?.set(event.result || null)
                }
              }
            } catch (e) {
              console.error("区域函数式事件调用失败：" + this.call_op_region == "enum" ? this.compileType(this.RegionEvent) : this.compileType(this.RegionEvent_ori))
              throw e
            }
            break
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