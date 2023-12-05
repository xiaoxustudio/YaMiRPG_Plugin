/*
@plugin 徐然工具
@version 1.0
@author 徐然
@link https://space.bilibili.com/291565199
@desc 

用于调试的插件
面板快捷键开关：shift + ctrl + V

双击选中角色（角色被选中时会改变透明度）

当修改角色属性，无焦点时会自动修改对应属性，属性不正确会提示

*/


/**
 * @description: 原生Html
 * @return {*}
 */
class Elem {
  static repPX(char) {
    return char.replace("px", "")
  }
  static scrollToElement(scrollElem, characters, ind = 0) {
    let allElements = document.querySelectorAll('[data-search]');
    for (let i = 0; i < allElements.length; i++) {
      let element = allElements[i];
      if (element.dataset.search.includes(characters) && ind == i) {
        scrollElem.scrollTo({
          top: element.offsetTop,//需要父元素设置postion(relative、absolute、fixed)
          behavior: "smooth"
        })
        break;
      }
    }
  }
  static findElemDataTag(prenet, data_tag) {
    let findarr = []
    for (let i of prenet.children) {
      if (i.dataset[data_tag]) {
        findarr.push(i)
      }
      if (i.children.length > 1) {
        let f = Elem.findElemDataTag(i, data_tag)
        findarr = Array.prototype.concat(findarr, f)
      }
      if (findarr.length > 100) {
        break
      }
    }
    return findarr
  }
  static removeChildAll(elemment, callback = () => { }) {
    elemment.innerHTML = ""
    callback()
  }
  // 检测元素是否在可见区域
  static isElementInViewport(el) {
    var rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
  static convertTo(inputString) {
    const matches = inputString.match(/[a-zA-Z0-9_]+/g);
    if (!matches) {
      return [];
    }
    const resultArray = matches.map(match => `["${match}"]`);
    return resultArray;
  }
}
class SManager {
  static findActor(List, id, name) {
    return Object.values(List).filter((val, ind) => val instanceof Actor && val.data.id === id && val.name === name)
  }
  static changeAttr(path, key, elem_message, elem_mes_inline) {
    let path_conver = Elem.convertTo(path + key).join("")
    new Function(`
    let ori_val = this.Actor${path_conver}
    let value = arguments[0].value
    try{
    if(typeof this.Actor${path_conver} === "number"){
      value = Number(value)
    }else if(typeof this.Actor${path_conver} === "string"){
      value = String(value)
    }else if(typeof this.Actor${path_conver} === "boolean"){
      value = new Function("return " + value)()
    } }catch(e){
      console.warn("${String(path + key)} 的修改值无效: \\n"+ ori_val+ "-->" + value)
      arguments[0].value = ori_val
    }
    if(this.Actor${path_conver} != value && typeof(this.Actor${path_conver}) === typeof(value) && !([NaN,null,undefined].includes(value))){
      try{
        this.Actor${path_conver} =  value
      }catch(e){
        console.warn("${String(path + key)} 位置修改失败: \\n"+ ori_val+ "-->" + value)
        this.Actor${path_conver} =  ori_val
        arguments[0].value = ori_val
      }
    }else if(this.Actor${path_conver} !== value){
        console.warn("${String(path + key)} 位置修改失败，似乎您的值有问题 : \\n" +ori_val+ "-->" + value)
        arguments[0].value = ori_val
    }
    `).bind(elem_message)(elem_mes_inline)
  }
}
class VManager {
  static findName(id) {
    for (let i in Variable.groups) {
      let it = Variable.groups[i]
      for (let ik in it) {
        let obj = it[ik]
        if (obj.id === id) return obj.name
      }
    }
  }
}

export default class XuRan_Tool {
  onStart() {
    // 更新器
    const updaters = new ModuleList()
    Game.updaters.push({
      update: () => {
        for (let i in updaters) {
          let isf = updaters[i]
          if (typeof isf === "function") isf(this)
        }
      }
    })
    window.xurantool = {}
    window.xurantool.promise = new Promise((res, rej) => res("ok"))
    const debounce = (func, delay) => {
      let timeoutId;
      return function () {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(this, arguments);
        }, delay);
      }
    }
    window.addEventListener("keydown", debounce(e => {
      if (e.shiftKey && e.ctrlKey && e.code == "KeyV") {
        if (elem.style.display == "none") {
          elem.show(); Game.updaters.push({
            update: () => {
              for (let i in updaters) {
                let isf = updaters[i]
                if (typeof isf === "function") isf(this)
              }
            }
          })
        } else { elem.hide(); Game.updaters.remove(updaters); }
      }
    }, 100))
    // 初始化
    let isDragging = false
    let offsetX, offsetY;
    let elem = document.createElement("div")
    elem.style.display = "block"
    elem.style.height = "400px"
    elem.style.width = "200px"
    elem.style.position = "absolute"
    elem.style.backgroundColor = "white"
    elem.style.userSelect = "none"
    elem.style.padding = "10px 10px 10px 10px"
    document.body.appendChild(elem)
    elem.hide = function () {
      this.style.display = "none"
    }
    elem.show = function () {
      this.style.display = "block"
      Elem.removeChildAll(elem_ul, () => {
        xurantool?.["update"]?.(xurantool?.["scene"])
      })
    }
    let elem_buttonsgroup = document.createElement("div")
    elem_buttonsgroup.style.width = "200px"
    const add_Elem = ({ name, type = "button", func = {}, parent = {} }) => {
      let elem_button = document.createElement(type)
      elem_button.innerHTML = name
      elem_buttonsgroup.appendChild(elem_button)
      for (let i in func) {
        let fn = func[i]
        if (typeof fn === "function") {
          elem_button.addEventListener(i, fn)
        }
      }
      parent.appendChild(elem_button)
      return elem_button
    }
    add_Elem({
      name: "刷新",
      parent: elem_buttonsgroup,
      func: {
        click: () => {
          Elem.removeChildAll(elem_ul, () => {
            xurantool["update"]?.(xurantool["scene"])
          })
        }
      }
    })
    add_Elem({
      name: "徐然工具",
      parent: elem_buttonsgroup,
      func: {
        click: () => {
          alert("徐然工具——Yami编辑器的好助手")
        }
      }
    })
    add_Elem({
      name: "全局变量",
      parent: elem_buttonsgroup,
      func: {
        click: () => {
          if (node.style.display == "none") { node.show() } else { node.hide() }
        }
      }
    })
    add_Elem({
      name: "信息",
      parent: elem_buttonsgroup,
      func: {
        click: () => {
          if (info.style.display == "none") { info.show() } else { info.hide() }
        }
      }
    })
    elem.appendChild(elem_buttonsgroup)
    elem.center = () => {
      // 获取视口的宽度和高度
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      // 计算居中位置
      const centerX = (viewportWidth - myDiv.offsetWidth) / 2;
      const centerY = (viewportHeight - myDiv.offsetHeight) / 2;
      this.style.left = centerX + 'px';
      this.style.top = centerY + 'px';
    }
    let elem_message = document.createElement("div")
    elem_message.style.display = "none"
    elem_message.style.height = "400px"
    elem_message.style.width = "340px"
    elem_message.style.position = "absolute"
    elem_message.style.backgroundColor = "white"
    elem_message.style.overflow = "scroll"
    elem_message.style.userSelect = "none"
    elem_message.style.padding = "10px 10px 10px 10px"
    elem.appendChild(elem_message)
    elem_message.hide = function () {
      this.Actor = null
      this.style.display = "none"
      Elem.removeChildAll(this)
    }
    elem_message.show = function (bind) {
      if(bind === elem_message.actorBind){return false;}
      let ori = bind.animation.opacity
      Elem.removeChildAll(this)
      this.style.display = "block"
      let elem_search = document.createElement("div")
      elem_search.style.display = "block"
      elem_search.style.width = "100%"
      let elem_search_input = document.createElement("input")
      elem_search_input.placeholder = "需要搜索的路径属性"
      elem_search.appendChild(elem_search_input)
      this.appendChild(elem_search)
      let elem_message_buttonsgroup = document.createElement("div")
      elem_message_buttonsgroup.style.width = "100%"
      let elem_message_buttons1 = document.createElement("button")
      elem_message_buttons1.innerHTML = "关闭面板"
      elem_message_buttonsgroup.appendChild(elem_message_buttons1)
      this.appendChild(elem_message_buttonsgroup)
      elem_message_buttons1.onclick = () => {
        this.hide()
      }
      elem_search_input.onblur = (e) => {
        elem_message.scrollTo({ x: 0, y: 500 })
        xurantool.promise.then(() => {
          Elem.scrollToElement(elem_message, elem_search_input.value)
        })
      }
      this.style.display = "block"
      elem_message.style.left = `${this.getBoundingClientRect().width}px`;
      elem_message.actorBind = bind || {}
      elem_message.Actor = new Proxy(bind || {}, {
        set: (obj, prop, value) => {
          if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
            let nodes = Elem.findElemDataTag(elem_message, prop)[0] ?? {}
            nodes.value = value
            obj[prop] = value;
            return true;
          } else {
            obj[prop] = value;
            return false;
          }
        },
        get: (obj, prop) => {
          if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
            return obj[prop];
          } else {
            return obj[prop];
          }
        },
      })
      let updateself = () => {
        if (elem_message.actorBind instanceof Actor && elem_message.Actor) {
          elem_message.actorBind.animation.opacity -= 0.01
          if (elem_message.actorBind.animation.opacity > 1) elem_message.actorBind.animation.opacity = ori
        } else {
          updaters.remove(updateself)
          bind.animation.opacity = ori
          delete elem_message.actorBind
        }
      }
      updaters.push(updateself)
      let _cache_stack = [bind]
      let runIndex = 0
      let maxIndex = 100
      let allowedKeys = ["attributes", "name", "visible", "entityId",
        "presetId", "selfVarId", "data", "cellId", "gridId", "teamId",
        "teamIndex", "active", "destroyed", "priority", "x", "y",
        , "scale", "angle", "angleFixed", "hitTimestamp", "started",
        "collider", "animationManager", "skillManager", "stateManager", "equipmentManager",
        "cooldownManager", "shortcutManager", "targetManager", "inventory"]
      // 开始
      const buildLi = (objBuild, path = ".", ind = 0) => {
        let foreach = (objBuild, path = ".", ind = 0) => {
          for (let key in objBuild) {
            // 排除引用自身索引和重复索引
            if (bind === objBuild[key] || _cache_stack.indexOf(objBuild[key]) !== -1) {
              if (runIndex > maxIndex) { runIndex = 0; break }
              runIndex++
              continue
            }
            // 排除数字索引
            if (/^[0-9]+$/i.test(key)) {
              if (runIndex > maxIndex) { runIndex = 0; break }
              runIndex++
              continue
            }
            if (typeof objBuild[key] === "string" || typeof objBuild[key] === "number" || typeof objBuild[key] === "boolean") {
              switch (typeof objBuild[key]) {
                case "boolean": {
                  let elem_sub = document.createElement("div")
                  elem_sub.style.display = "block"
                  elem_sub.style.width = "100%"
                  elem_sub.dataset.search = path + key
                  let elem_mes_inline = document.createElement("input")
                  elem_mes_inline.value = "true"
                  elem_mes_inline.dataset.id = key
                  elem_mes_inline.dataset.path = path
                  elem_mes_inline.type = "radio"
                  elem_mes_inline.name = path + key
                  let node_mes_inline1 = document.createElement("input")
                  node_mes_inline1.value = "false"
                  node_mes_inline1.dataset.id = key
                  node_mes_inline1.dataset.path = path
                  node_mes_inline1.type = "radio"
                  node_mes_inline1.name = path + key
                  elem_sub.appendChild(elem_mes_inline)
                  elem_sub.appendChild(node_mes_inline1)
                  if (objBuild[key]) { elem_mes_inline.checked = true } else { node_mes_inline1.checked = true }
                  elem_mes_inline.after(elem_mes_inline.value)
                  node_mes_inline1.after(node_mes_inline1.value)
                  this.appendChild(elem_sub)
                  elem_mes_inline.before(key + "(" + path + "):")
                  elem_mes_inline.onclick = (e) => {
                    SManager.changeAttr(path, key, elem_message, elem_mes_inline)
                    Elem.removeChildAll(elem_ul, () => {
                      xurantool["update"]?.(xurantool["scene"])
                    })
                  }
                  node_mes_inline1.onclick = (e) => {
                    SManager.changeAttr(path, key, elem_message, node_mes_inline1)
                    Elem.removeChildAll(elem_ul, () => {
                      xurantool["update"]?.(xurantool["scene"])
                    })
                  }
                  break
                }
                case "number": {
                  let elem_sub = document.createElement("div")
                  elem_sub.style.display = "block"
                  elem_sub.style.width = "100%"
                  elem_sub.dataset.search = path + key
                  let elem_mes_inline = document.createElement("input")
                  elem_mes_inline.value = objBuild[key]
                  elem_mes_inline.dataset.id = key
                  elem_mes_inline.dataset.path = path
                  elem_mes_inline.type = "number"
                  elem_sub.appendChild(elem_mes_inline)
                  this.appendChild(elem_sub)
                  elem_mes_inline.before(key + "(" + path + "):")
                  elem_mes_inline.onchange = (e) => {
                    SManager.changeAttr(path, key, elem_message, elem_mes_inline)
                    Elem.removeChildAll(elem_ul, () => {
                      xurantool["update"]?.(xurantool["scene"])
                    })
                  }
                  break
                }
                default: {
                  let elem_sub = document.createElement("div")
                  elem_sub.style.display = "block"
                  elem_sub.style.width = "100%"
                  elem_sub.dataset.search = path + key
                  let elem_mes_inline = document.createElement("input")
                  elem_mes_inline.value = objBuild[key]
                  elem_mes_inline.dataset.id = key
                  elem_mes_inline.dataset.path = path
                  elem_sub.appendChild(elem_mes_inline)
                  this.appendChild(elem_sub)
                  elem_mes_inline.before(key + "(" + path + "):")
                  elem_mes_inline.onchange = (e) => {
                    SManager.changeAttr(path, key, elem_message, elem_mes_inline)
                    Elem.removeChildAll(elem_ul, () => {
                      xurantool["update"]?.(xurantool["scene"])
                    })
                  }
                  break
                }
              }

              if (_cache_stack.indexOf(objBuild[key]) === -1) {
                _cache_stack.push(objBuild[key])
              }
            } else {
              // 是对象
              if (typeof objBuild[key] === "object") {
                let i = foreach(objBuild[key], path + key + ".", 0)
                _cache_stack.push(objBuild[key])
              }
            }
            ind++
          }
        }
        // 过滤
        let obj = {}
        for (let i in objBuild) {
          if (allowedKeys.includes(i)) {
            obj[i] = objBuild[i]
          }
        }
        foreach(obj, path)
      }
      buildLi(bind)
      _cache_stack = undefined
    }

    let elem_ul = document.createElement("ul")
    elem_ul.style.height = "80%"
    elem_ul.style.width = "80%"
    elem_ul.style.position = "absolute"
    elem_ul.style.left = "0px"
    elem_ul.style.overflow = "scroll"
    elem.appendChild(elem_ul)
    //  信息面板
    let info = document.createElement("div")
    info.style.display = "none"
    info.style.height = "350px"
    info.style.width = "230px"
    info.style.position = "absolute"
    info.style.backgroundColor = "white"
    info.style.overflow = "scroll"
    info.style.left = - Elem.repPX(elem.style.width) - Math.abs(Elem.repPX(elem.style.width) - Elem.repPX(info.style.width)) + "px"
    let info_div = document.createElement("div")
    info_div.style.display = "block"
    info_div.style.width = "100%"
    let info_div_span = add_Elem({
      name: "信息面板",
      type: "span",
      parent: info_div,
    })
    let info_div_show = add_Elem({
      name: "",
      type: "span",
      parent: info_div,
    })
    info_div_show.style.textAlign = "center"
    info_div_show.style.width = "100%"
    info_div_show.style.height = "100%"
    info_div_show.style.padding = "20px 20px 20px 20px"
    info_div_span.style.padding = "5px 5px 5px 5px"
    info.appendChild(info_div)
    elem.appendChild(info)
    info.show = function () {
      this.style.display = "block"
      let updateself = () => {
        if (this.style.display != "none") {
          let textstr = `\n${GL.width}x${GL.height}`
            + `\nFPS(帧率)：\n ${Time.fps}`
            + `\nActors(角色数量)：\n${Scene.visibleActors.count}/${Scene.actors.length}`
            + `\nAnims(动画数量) :\n${Scene.visibleAnimations.count}/${Scene.animations.length}`
            + `\nTriggers(触发器数量) :\n ${Scene.visibleTriggers.count}/${Scene.triggers.length}`
            + `\nParticles(粒子数量):\n ${Scene.particleCount}`
            + `\nElements(元素数量):\n ${UI.manager.count}`
            + `\nTextures(纹理数量):\n ${GL.textureManager.count}`
          info_div_show.innerText = textstr
        } else {
          updaters.remove(updateself)
        }
      }
      updaters.push(updateself)
    }
    info.hide = function () {
      this.style.display = "none"
    }
    //  全局变量
    let node = document.createElement("div")
    node.style.display = "none"
    node.style.height = "350px"
    node.style.width = "230px"
    node.style.position = "absolute"
    node.style.backgroundColor = "white"
    node.style.overflow = "scroll"
    node.style.left = - Elem.repPX(elem.style.width) - Math.abs(Elem.repPX(elem.style.width) - Elem.repPX(node.style.width)) + "px"
    elem.appendChild(node)
    let node_div = document.createElement("div")
    node_div.style.display = "block"
    node_div.style.width = "100%"
    let node_div_sp = add_Elem({
      name: "全局变量管理",
      type: "span",
      parent: node_div,
    })
    node_div_sp.style.width = "100%"
    node_div_sp.style.padding = "5px 5px 5px 5px"
    let node_div_btn = add_Elem({
      name: "刷新",
      parent: node_div,
    })
    let node_div_btn1 = add_Elem({
      name: "关闭",
      parent: node_div,
    })
    node.appendChild(node_div)
    let node_ul = document.createElement("ul")
    node_ul.style.height = "100%"
    node_ul.style.width = "100%"
    node_ul.style.position = "absolute"
    node_ul.style.left = "-30px"
    node.appendChild(node_ul)
    const varupdate = (variable) => {
      for (let i in variable.map) {
        let item = variable.map[i]
        if (typeof item === "string" || typeof item === "number" || typeof item === "boolean") {
          switch (typeof item) {
            case "boolean": {
              let node_sub = document.createElement("div")
              node_sub.style.display = "block"
              node_sub.style.width = "100%"
              node_sub.dataset.search = i
              let node_mes_inline = document.createElement("input")
              node_mes_inline.value = "true"
              node_mes_inline.dataset.id = i
              node_mes_inline.type = "radio"
              node_mes_inline.name = i
              let node_mes_inline1 = document.createElement("input")
              node_mes_inline1.value = "false"
              node_mes_inline1.dataset.id = i
              node_mes_inline1.type = "radio"
              node_mes_inline1.name = i
              node_sub.appendChild(node_mes_inline)
              node_sub.appendChild(node_mes_inline1)
              if (Variable.get(i)) { node_mes_inline.checked = true } else { node_mes_inline1.checked = true }
              node_mes_inline.after(node_mes_inline.value)
              node_mes_inline1.after(node_mes_inline1.value)
              node_ul.appendChild(node_sub)
              node_mes_inline.before(VManager.findName(i) + "(" + i + "):")
              node_mes_inline.before(document.createElement("br"))
              node_mes_inline.onclick = (e) => {
                Variable.set(i, true)
                Elem.removeChildAll(node_ul, () => {
                  xurantool["varupdate"]?.(Variable)
                })
              }
              node_mes_inline1.onclick = (e) => {
                Variable.set(i, false)
                Elem.removeChildAll(node_ul, () => {
                  xurantool["varupdate"]?.(Variable)
                })
              }
              break
            }
            case "number": {
              let node_sub = document.createElement("div")
              node_sub.style.display = "block"
              node_sub.style.width = "100%"
              node_sub.dataset.search = i
              let node_mes_inline = document.createElement("input")
              node_mes_inline.value = Variable.get(i)
              node_mes_inline.dataset.id = i
              node_mes_inline.type = "number"
              node_sub.appendChild(node_mes_inline)
              node_ul.appendChild(node_sub)
              node_mes_inline.before(VManager.findName(i) + "(" + i + "):")
              node_mes_inline.before(document.createElement("br"))
              node_mes_inline.onchange = (e) => {
                Variable.set(i, Number(node_mes_inline.value))
                Elem.removeChildAll(node_ul, () => {
                  xurantool["varupdate"]?.(Variable)
                })
              }
              break
            }
            default: {
              let node_sub = document.createElement("div")
              node_sub.style.display = "block"
              node_sub.style.width = "100%"
              node_sub.dataset.search = i
              let node_mes_inline = document.createElement("input")
              node_mes_inline.value = Variable.get(i)
              node_mes_inline.dataset.id = i
              node_sub.appendChild(node_mes_inline)
              node_ul.appendChild(node_sub)
              node_mes_inline.before(VManager.findName(i) + "(" + i + "):")
              node_mes_inline.before(document.createElement("br"))
              node_mes_inline.onchange = (e) => {
                Variable.set(i, node_mes_inline.value)
                Elem.removeChildAll(node_ul, () => {
                  xurantool["varupdate"]?.(Variable)
                })
              }
              break
            }
          }
        }
      }
    }
    node.show = function (bind) {
      this.style.display = "block"
      node.bind = new Proxy(Variable.groups, {
        set: (obj, prop, value) => {
          if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
            let nodes = Elem.findElemDataTag(node, obj.id) ?? {}
            nodes[0].value = value
            obj[prop] = value;
            return true;
          } else {
            obj[prop] = value;
            return false;
          }
        },
        get: (obj, prop) => {
          if (typeof obj[prop] === "string" || typeof obj[prop] === "number" || typeof obj[prop] === "boolean") {
            return obj[prop];
          } else {
            return obj[prop];
          }
        },
      })
      Elem.removeChildAll(node_ul, () => {
        xurantool["varupdate"]?.(Variable)
      })
    }
    node.hide = function () {
      Elem.removeChildAll(node_ul)
      this.bind = null
      this.style.display = "none"
    }
    xurantool["varupdate"] = varupdate
    // 全局变量事件
    node_div_btn.onclick = function (e) {
      Elem.removeChildAll(node_ul)
      xurantool["varupdate"]?.(Variable)
    }
    node_div_btn1.onclick = function (e) {
      node.hide()
    }

    // 加载属性
    let isResizing = false;


    elem_message.addEventListener('mousedown', (e) => {
      e.stopPropagation()
    });
    node.addEventListener('mousedown', (e) => {
      e.stopPropagation()
    });
    elem.addEventListener('mousedown', (event) => {
      if (event.ctrlKey) { return false }
      isDragging = true;
      offsetX = event.clientX - elem.getBoundingClientRect().left;
      offsetY = event.clientY - elem.getBoundingClientRect().top;
    })
    document.addEventListener('mousemove', (event) => {
      if (!isDragging) return;
      const x = event.clientX - offsetX;
      const y = event.clientY - offsetY;
      let moveElement = () => {
        // 移动操作
        elem.style.left = `${x}px`;
        elem.style.top = `${y}px`;
        if (!Elem.isElementInViewport(elem)) {
          elem.style.left = `${Math.max(0, Math.min(x, (window.innerWidth || document.documentElement.clientWidth) - elem.getBoundingClientRect().width))}px`;
          elem.style.top = `${Math.max(0, Math.min(y, (window.innerHeight || document.documentElement.clientHeight) - elem.getBoundingClientRect().height))}px`;
        }
      }
      // 异步调用
      xurantool.promise.then(() => {
        moveElement()
      })
    })
    document.addEventListener('mouseup', (e) => {
      isDragging = false;
    })

    let csss = {
      li: `
      .lis:hover{color :red;}
      `
    }
    let elem_style = document.createElement("style")
    // 加载全局样式
    for (let item in csss) {
      elem_style.innerHTML += csss[item]
    }
    document.body.appendChild(elem_style)


    // 加载角色
    Scene.on("load", scene => {
      const update = (s) => {
        for (let item of s.actors) {
          if (item instanceof Actor || item instanceof GlobalActor) {
            let elem_li = document.createElement("li")
            elem_li.innerHTML = item.attributes.name || item.name
            elem_li.style.listStyleType = "none"
            elem_li.style.userSelect = "none"
            elem_li.dataset.id = item.data.id
            elem_li.dataset.name = item.name
            elem_li.className = "lis"
            elem_ul.appendChild(elem_li)
            //加载
            elem_li.addEventListener("dblclick", function (event) {
              let id = this.dataset.id
              let name = this.dataset.name
              let factor = SManager.findActor(s.actors, id, name)[0]
              if (factor) {
                elem_message.show(factor)
              }
            })
            //加载结束
          }
        }
      }
      Elem.removeChildAll(elem_ul, () => {
        update(scene)
      })
      xurantool["update"] = update
      xurantool["scene"] = scene
      Elem.removeChildAll(node_ul)
      xurantool["varupdate"]?.(Variable)
    })
  }
}