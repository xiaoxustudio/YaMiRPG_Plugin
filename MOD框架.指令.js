/*
@plugin MOD框架
@version 1.0
@author 徐然
@link https://space.bilibili.com/291565199
@desc

MOD框架：可动态修改场景中的对象，UI，动画等内容

基础指令：
【暴露当前对象】
将当前对象实例暴露给脚本，使得脚本可以调用该实例

【获取暴露列表】
获取当前已加载的全部暴露实例


运行指令：
【加载指定后缀文件】
加载指定后缀的脚本

【运行全部文件】
运行已加载的全部脚本

【重新运行指定文件】
重新运行已加载的脚本


配置指令：
【指定脚本后缀】
指定脚本的后缀

配置指令：
【指定配置文件后缀】
指定配置文件的后缀

【解析配置文件】
加载并解析.init配置文件
init文件：
key = value 格式


@option op {"base_cmd", "run_cmd" , "config_cmd"}
@alias MOD框架 {基础指令,运行指令, 配置指令}

@option config_cmd_list {"assign_suffix","assign_suffix_init","load_init"}
@alias 操作 {指定脚本后缀,指定配置后缀,解析配置文件}
@cond op {"config_cmd"}



@string assign_suffix_name
@alias 后缀（不用加.）
@cond config_cmd_list {"assign_suffix","assign_suffix_init"}


@string init_file_path
@alias 配置文件路径
@cond config_cmd_list {"load_init"}


@string init_save_var
@alias 存储到变量
@cond config_cmd_list {"load_init"}



@option run_cmd_list {"import_file","run_all_file","run_file_custom"}
@alias 操作 {加载指定后缀文件,运行全部文件,运行指定文件}
@cond op {"run_cmd"}

@string import_file_path
@alias 文件路径
@cond run_cmd_list {"import_file"}






@option base_cmd_list {"export_self","get_list"}
@alias 操作 {暴露当前对象,获取暴露列表}
@cond op {"base_cmd"}

@string export_tag
@alias 标识
@cond base_cmd_list {"export_self"}

@string save_var
@alias 结果存储到变量
@cond base_cmd_list {"get_list"}

*/

const fs = require("fs")
const path = require("path")


class xr {
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
    text = xr.compilteVar(text)
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

class XR_Console {
  promise
  constructor() {
    this.msg = []
    this.status = 0
    this.promise = new Promise((resolve, reject) => { resolve("ok") }).then(() => { })
    this.instance = document.createElement("div")
    this.div_content = null
    this.div_c = document.querySelector("div")
    window.addEventListener("resize", (event) => {
      this.promise.then(() => {
        if (this.status == 1) {
          this.show()
        } else {
          this.hide()
        }
        this.c_update()
      }).then(() => {
        this.clearChild()
      }).then(() => {
        this.loading()
      }).then(() => {
        this.update_log()
      })
    });
    this.c_update()
    this.hide()
    document.body.appendChild(this.instance)
    // 快捷键
    Input.on("keydown", () => {
      let event = window.event;
      if (event.key == "C" && event.shiftKey && event.ctrlKey) {
        if (this.status == 0) {
          this.show()
          this.status = 1
        } else {
          this.hide()
          this.status = 0
        }
      }
    })

    this.loading()
    let sty = document.createElement("style")
    sty.innerHTML = `
    .but {
      background-color: rgb(52, 86, 52);
      border-color:lightgreen;
      overflow: hidden;
      width: 100px;
      height: 25px;
      transition: all 0.3s linear;
      color: rgb(144, 238, 144);
    }
    .but:hover {
      background-color: rgba(144, 238, 144,1);
      box-shadow: 10px 10px 99px 6px rgba(144, 238, 144,1);
      color:green;
    }

    .ipt {
      background-color: rgb(52, 86, 52);
      border-color:lightgreen;
      overflow: hidden;
      width: 100px;
      height: 25px;
      transition: all 0.3s linear;
      color: rgb(144, 238, 144);
      outline-style: none ;
      padding: 5px;
    }
    .ipt:hover {
      background-color: rgba(144, 238, 144,1);
      box-shadow: 1px 3px 99px rgba(144, 238, 144,1);
      color:green;
    }
    .scroll_conent{
      background-color: transparent;
      height: 80px;
      width: 100px;
      overflow:scroll;
      overflow-x:hidden;
  }
  .result_log{
      font-size: 10px;
      font-weight: bold;
      padding-top:2px;
      padding-bottom:2px;
      padding-left:2px;
      color: rgb(144, 238, 144);
      padding-right:2px;
      display:"inline-block";
  }

  .obj_root {
    display: block;
    user-select: none;
  }
  .obj_key {
    display: inline-block;
    user-select: none;
  }
  .obj_con {
    display: inline;
    user-select: none;
  }
  .obj_con::after{
    content :"：";
    display: inline;
  }
  .obj_value {
    display: inline-block;
    user-select: none;
  }

  .obj_br {
    display: inline;
  }
  .obj_br::after {
    content: "\\A";
    display: block;
    white-space: pre;
  }

  .obj_nbsp {
    display: inline;
  }
  .obj_nbsp::after {
    content: "\\0020";
    display: inline;
    white-space: pre;
  }
  .obj_hidden {
    height: none;
  }
  .obj_arrows {
    display: inline-block;
  }
  .obj_child {
    display: inline-block;
  }
    `
    document.head.appendChild(sty)
  }
  c_update = () => {
    this.instance.id = "control_panel_xuran"
    this.instance.style.left = "0px"
    this.instance.style.position = "fixed"
    this.instance.style.backgroundColor = "rgba(200,200,200,0.3)"
    this.instance.style.height = (window.innerHeight * 0.3) + "px"
    this.instance.style.width = window.innerWidth + "px"
  }
  hide = () => {
    this.instance.style.top = (this.removePX(this.div_c.style.height) + this.removePX(this.div_c.style.top) + 50) + "px"
    setTimeout(() => {
      Scene.continue()
      Scene.restoreInput()
    }, 100);
  }
  show = () => {
    Scene.pause()
    Scene.preventInput()
    this.instance.style.top = (this.removePX(this.div_c.style.height) + this.removePX(this.div_c.style.top)) + "px"
    this.instance.style.top = (this.removePX(this.instance.style.top) - this.removePX(this.instance.style.height) - 50) + "px"
  }
  removePX(str) {
    return Number.parseFloat(String(str).replace("px", ""))
  }
  clearChild() {
    this.instance.innerHTML = ""
  }
  log() {
    this.msg.push(...arguments)
  }
  update_log() {
    this.div_content.innerHTML = ""
    for (let i in this.msg) {
      let data = this.msg[i]
      if (typeof data == "string" || typeof data == "number") {
        let p = document.createElement("p")
        p.className = "result_log"
        p.innerText = data.toString()
        this.div_content.appendChild(p)
      } else if (typeof data == "object") {
        let p = document.createElement("p")
        p.className = "result_log"
        p.appendChild(this.paseOBJ(data))
        this.div_content.appendChild(p)
      } else {
        let p = document.createElement("p")
        p.className = "result_log"
        p.innerText = data
        this.div_content.appendChild(p)
      }
    }
  }
  hasLoop(obj) {
    // 判断对象内部是否有和源相同的属性
    function findLoop(target, src) {
      // 源数组，并将自身传入
      const source = src.slice().concat([target])

      for (const key in target) {
        // 如果是对象才需要判断
        if (typeof target[key] === 'object') {
          // 如果在源数组中找到 || 递归查找内部属性找到相同
          if (source.indexOf(target[key]) > -1 || findLoop(target[key], source)) {
            return true
          }
        }
      }
      return false
    }
    // 如果传入值是对象，则执行判断，否则返回false
    return typeof obj === 'object' ? findLoop(obj, []) : false
  }

  paseOBJ(obj, index = 1) {
    let obj_root
    if (typeof obj == "object") {
      // 记录对象（防止对象重复迭代）
      let stack = []
      obj_root = document.createElement("div")
      obj_root.className = "obj_root"
      for (let i in obj) {
        if (typeof obj[i] == "object") {
          let obj_key = document.createElement("div")
          obj_key.className = "obj_key"
          obj_key.innerHTML = i
          let obj_con = document.createElement("div")
          obj_con.className = "obj_con"
          let obj_value = document.createElement("div")
          obj_value.className = "obj_value"
          // 不是已经迭代过的对象
          let f_obj = this.hasLoop(obj[i])
          if (!f_obj) {
            //生成空格
            for (let ik = 0; ik < index; ik++) {
              let obj_nbsp = document.createElement("div")
              obj_nbsp.className = "obj_nbsp"
              obj_value.appendChild(obj_nbsp)
            }
            //————————
            let obj_arrows = document.createElement("div")
            obj_arrows.className = "obj_arrows"
            obj_value.appendChild(obj_arrows)
            obj_value.appendChild(this.paseOBJ(obj[i], ++index))
            obj_root.appendChild(obj_key)
            obj_root.appendChild(obj_con)
            obj_root.appendChild(obj_value)
            stack.push(obj[i])
          } else {
            obj_key.innerHTML = "重复迭代对象:"
            obj_value.innerHTML = f_obj
            obj_root.appendChild(obj_key)
            obj_root.appendChild(obj_con)
            obj_root.appendChild(obj_value)
          }
        } else {
          let obj_key = document.createElement("div")
          obj_key.className = "obj_key"
          obj_key.innerHTML = i
          let obj_con = document.createElement("div")
          obj_con.className = "obj_con"
          let obj_value = document.createElement("div")
          obj_value.className = "obj_value"
          obj_value.innerHTML = obj[i]

          let obj_br = document.createElement("div")
          obj_br.className = "obj_br"

          obj_root.appendChild(obj_key)
          obj_root.appendChild(obj_con)
          obj_root.appendChild(obj_value)
          obj_root.appendChild(obj_br)
        }

      }
    }
    return obj_root
  }
  loading() {
    let div_bar = document.createElement("div")
    div_bar.style.width = this.instance.style.width
    div_bar.style.height = "20px"
    let div_bar1 = document.createElement("div")
    div_bar1.style.width = this.instance.style.width
    div_bar1.style.height = "20px"
    let div_content = document.createElement("div")
    div_content.style.width = this.instance.style.width
    div_content.style.height = (this.removePX(this.instance.style.height) - this.removePX(div_bar.style.height) - this.removePX(div_bar1.style.height)) + "px"
    div_content.className = "scroll_conent"
    this.div_content = div_content
    let tag = document.createElement("p")
    tag.innerText = "徐然控制台 PRO"
    tag.className = "but"
    tag.style.display = "inline"
    tag.style.margin = "10px"
    tag.style.pointerEvents = "none"
    tag.style.fontSize = "12px"
    tag.style.padding = "3px"
    tag.oncontextmenu = () => { return false }
    tag.onselectstart = () => { return false }
    tag.onclick = () => { return false }
    div_bar.appendChild(tag)

    let menu = {
      "清空": {
        event: {
          click: () => { this.msg = []; this.update_log(); }
        }
      },
      "隐藏": {
        event: {
          click: () => { this.hide(); this.status = 0; }
        }
      },
      "刷新控制台": {
        event: {
          click: () => { this.update_log(); }
        }
      },
      "重新加载页面": {
        event: {
          click: () => { location.reload(); }
        }
      }
    }
    for (let i in menu) {
      let data = menu[i]
      let but = document.createElement("button")
      but.innerText = i
      for (let ik in data.event) {
        but.addEventListener(ik, data.event[ik])
      }
      but.className = "but"
      div_bar.appendChild(but)
    }

    let enter = document.createElement("button")
    enter.style.width = "70px"
    enter.style.height = "30px"
    enter.innerText = "确定"
    enter.className = "but"


    let ipt = document.createElement("input")
    ipt.style.width = (this.removePX(div_bar1.style.width)) + "px"
    ipt.style.width = this.removePX(ipt.style.width) - this.removePX(enter.style.width) - 20 + "px"
    ipt.style.height = this.removePX(div_bar1.style.height) + "px"
    ipt.className = "ipt"
    enter.addEventListener("click", () => {
      let s_data = ipt.value.split(";")
      for (let i in s_data) {
        try {
          let res = new Function("return " + ipt.value).bind(MOD.manager.mod).call(MOD.manager.mod)
          console.log(res)
          this.log(res)
        } catch (e) {
          this.log(ipt.value)
          this.log(String(e))
        }
      }
      this.update_log()
      ipt.value = ""
    })
    div_bar1.appendChild(ipt)
    div_bar1.appendChild(enter)
    this.instance.appendChild(div_bar)
    this.instance.appendChild(div_content)
    this.instance.appendChild(div_bar1)

  }
}


class MOD_X {
  script
  debug
  constructor() {
    this.script = {}
    this.debug = debug
    window.MOD_X = this
  }
  expose(obj) {
    if (typeof obj === 'function') {
      this.script[obj.name] = obj
    } else {
      this.script[obj] = obj
    }
  }
}

class MOD_Manager {
  obj_list
  js_list
  promise
  config
  mod
  constructor() {
    this.obj_list = {}
    this.js_list = {}
    this.mod = new MOD_X()
    this.mod["OBJ"] = this.obj_list
    this.config = {
      suffix: "js",
      suffix_init: "init"
    }
    this.promise = new Promise((resolve, reject) => { resolve("ok") })
    this.update(true)
  }

  update(written = false) {
    if (!fs.existsSync(File.route("Data/MOD_config.json"))) {
      fs.writeFileSync(File.route("Data/MOD_config.json"), JSON.stringify(this.config))
    }
    if (written) {
      fs.writeFileSync(File.route("Data/MOD_config.json"), JSON.stringify(this.config))
    }
    this.config = JSON.parse(fs.readFileSync(File.route("Data/MOD_config.json"), { encoding: "utf-8" }))
  }
  add_obj(name, obj) {
    name = name.length == 0 ? obj.presetId : name
    this.obj_list[String(name)] = obj
  }
  get_obj(name) {
    return this.obj_list[String(name)] ? this.obj_list[String(name)] : null
  }
  get_list() {
    return this.obj_list
  }
  loadfile(file) {
    let name_r = file.substring(String(file).lastIndexOf(".") + 1, file.length)
    if (name_r === this.config.suffix) {
      try {
        this.js_list[file.substring(String(file).lastIndexOf("\\") + 1, file.length)] = new Function(this.next() + fs.readFileSync(file).toString("utf-8"))
        return true
      }
      catch(e) {
        console.log("脚本" + file.substring(String(file).lastIndexOf("\\") + 1, file.length) + "加载失败")
        debug.log("脚本" + file.substring(String(file).lastIndexOf("\\") + 1, file.length) + "加载失败")
        return false
      }
    } else {
      return false
    }
  }
  next() {
    let a = `
    console.log=(function (ori) {return function () { ori(...arguments);MOD_X.debug.log(...arguments);}})(console.log);eval = null;Function = null;
    `
    return a.toString("utf-8")
  }
  run() {
    for (let i in this.js_list) {
      this.promise.then((r) => {
        return this.js_list[i].bind(this.mod).call(this.mod)
      }).catch((e) => {
        console.log("脚本:" + i + "执行错误，" + e)
      }).finally((r) => {
        console.log("所有脚本执行完成")
      })
    }
  }
  run_coustom(name) {
    for (let i in this.js_list) {
      if (i == name) {
        this.promise.then((r) => {
          return this.js_list[i].bind(this.mod).call(this.mod)
        }).catch((e) => {
          console.log("脚本:" + i + "执行错误，" + e)
        }).finally((r) => {
          console.log("所有脚本执行完成")
        })
      }
    }
  }
}

class MOD_xr {
  manager
  constructor() {
    this.manager = new MOD_Manager()
  }
  parse_init(text) {
    const result = {};
    const lines = text.split('\n');
    for (let line of lines) {
      const matches = line.match(/^\s*([^=]+)\s*?=\s*?(.*)\s*$/);
      if (matches) {
        const key = matches[1].trim();
        const value = matches[2].trim();
        result[key] = value;
      }
    }
    return result
  }
}

const debug = new XR_Console()
const MOD = new MOD_xr()


export default class XR_MOD_Pugin {
  constructor() { }
  call() {
    switch (this.op) {
      case "base_cmd":
        switch (this.base_cmd_list) {
          case "export_self":
            MOD.manager.add_obj(this.export_tag, Event.triggerElement)
            break
          case "get_list":
            Event.attributes[String(this.save_var)] = MOD.manager.get_list()
            break
        }
        break
      case "run_cmd":
        switch (this.run_cmd_list) {
          case "import_file":
            MOD.manager.loadfile(xr.compiltePath(this.import_file_path))
            break
          case "run_all_file":
            MOD.manager.run()
            break
          case "run_file_costom":
            MOD.manager.run_coustom(this.run_file_custom)
            break
        }
        break
      case "config_cmd":
        switch (this.config_cmd_list) {
          case "assign_suffix":
            MOD.manager.config.suffix = this.assign_suffix_name.length == 0 ? "js" : this.assign_suffix_name
            MOD.manager.update(true)
            break
          case "assign_suffix_init":
            MOD.manager.config.suffix_init = this.assign_suffix_name.length == 0 ? "init" : this.assign_suffix_name
            MOD.manager.update(true)
            break
          case "load_init":
            if (this.init_file_path.substring(String(this.init_file_path).lastIndexOf(".") + 1, this.init_file_path.length) === MOD.manager.config.suffix_init) {
              let nr = fs.readFileSync(xr.compiltePath(this.init_file_path), { encoding: "utf-8" })
              Event.attributes[String(this.init_save_var)] = MOD.parse_init(nr)
            }
            break
        }
        break
    }
  }
  onStart() {
  }
}



