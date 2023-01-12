/*
@plugin 自定义角色属性插件
@version 1.0
@author 徐然
@link https://space.bilibili.com/291565199
@desc #desc

@option xucore_plugin_mode {"xpm_open","xpm_close"}
@alias #xucore_plugin_mode {#xpm_open,#xpm_close}
@default {"xpm_open"}



--脚本模式
@option state {"stete_static", "stete_actor", "stete_ui"}
@alias #state {#stete_static, #stete_actor, #stete_ui}
@cond xucore_plugin_mode {"xpm_close"}

@string[] sxlist
@alias #sxlist
@default ['测试属性:1']
@cond state {"stete_static"}



@lang zh
#desc 自定义角色属性插件
说明方法：   
PluginManager.xucore.setText(id,text)
说明：设置文本控件内容
PluginManager.xucore.change_actor(actorname,actor_sx,values)
说明：改变角色属性
PluginManager.xucore.get_actor(actorname,actor_sx)
说明：获取角色属性

PS：PluginManager前缀可以省略不写

#sxlist 属性列表
#state 开启状态

#xucore_plugin_mode 指令模式
#xpm_open 开启
#xpm_close 关闭

#stete_static 静态模式
#stete_actor 角色模式
#stete_ui UI模式

*/



let type_all
let xucore_mode
let actor

class xucore {
  constructor(val) {
    this.val = val
  }
  
  jx_sxlist() {
    if (type_all == "actor") {
      for (var i in this.sxlist) {
        var head = this.sxlist[i].match(/(.*):+/)
        var val = this.sxlist[i].match(/:(.*)+/)
        this.actor.attributes[head[1]] = val[1]
      }
    }
  }

  callv(val) {
    var type_local = val.constructor.name
    if (type_all == "actor" && type_local == "GlobalActor") {
      this.actor = val
      this.jx_sxlist()
    } else if (type_all == "ui" && type_local == "TextElement") {
      this.ui = val
      var the_t = this.ui.content.match(/{(.*)+}/)
      var s_text = the_t[1].toString().split(",")
      for (var i in s_text) {
        if (s_text[i].indexOf(":") != -1) {
          var head = s_text[i].match(/(.*):+/)
          var end = s_text[i].match(/:(.*)+/)
          var a_end = the_t[1].toString().match(/actor:(.*)+/)
          a_end[1] = a_end[1].replace(",", "")
          a_end[1] = a_end[1].replace("}", "")
          if (a_end[1]) {
            this.find_actor(a_end[1])
          }
          if (head[1] == "name") {
             this.find_actor(a_end[1])
              if (actor) {
                var min=String(actor.attributes[String(end[1])])
                this.ui.content = this.ui.content.replace(the_t[0], min)
              }
          }
        }
      }
    } else {
      this.static = true
    }
  }

  find_actor(actorname) {
      if (ActorManager.list) {
        for (var i in ActorManager.list) {
          if (ActorManager.list[i].attributes.name == actorname) {
            actor = ActorManager.list[i]
          }
        }
      }
  }

  change_actor(actorname,a_name,val){
    this.find_actor(actorname)
    if(actor){
      if(actor.attributes[a_name]){
        actor.attributes[a_name]=val
      }
    }
  }

  get_actor(actorname,a_name){
    this.find_actor(actorname)
    if(actor){
      if(actor.attributes[a_name]){
       return actor.attributes[a_name]
      }
    }
  }

  setText(id, actorname, val) {
    this.find_actor(actorname)
      if (UI.get(id)) {
        if (val) {
          var mat_head = val.match(/{name:(.*)}+/)
          if (actor.attributes[String(mat_head[1])]) {
            var Element = UI.get(id)
            var head=String(actor.attributes[String(mat_head[1])])
            Element.content = Element.content.replace(mat_head[0],head)
          }
        } else {
          var Element = UI.get(id)
          var mat_head = Element.content.match(/{name:(.*)}+/)
          if (mat_head) {
            var head=String(actor.attributes[String(mat_head[1])])
            Element.content = Element.content.replace(mat_head[0],head)
          }
        }
      }
  }

  onStart() {
    window.xucore = this
    switch (this.xucore_plugin_mode) {
      case "xpm_open":
        xucore_mode = true
      case "xpm_close":
        xucore_mode = false
    }
    switch (this.state) {
      case "stete_ui":
        type_all = "ui"
        if (!xucore_mode) {
          this.callv(this.val)
        }
        return true
      case "stete_actor":
        type_all = "actor"
        if (!xucore_mode) {
          this.callv(this.val)
        }
        return true
      case "stete_static":
        type_all = "static"
        if (!xucore_mode) {
          this.callv(this.val)
        }
        return true
    }
  }
}

export default xucore