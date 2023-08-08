/*
@plugin 自定义角色属性插件
@version 1.1
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

@option op_zl {"get_actor","set_ac_att_last"}
@alias 操作 {获取角色,设置最新创建的角色属性}
@default {"xpm_open"}

@string obj_att
@alias 根据属性
@cond op_zl {"get_actor","set_ac_att_last"}

@string obj_att_val
@alias 根据属性值
@cond op_zl {"get_actor","set_ac_att_last"}

@string save_var
@alias 存储到本地变量
@cond op_zl {"get_actor"}




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

let type_all;
let xucore_mode;
let actor;

// 按照变量名获取全局变量
function get_glocal(str) {
  for (let i in Variable.groups) {
    for (let k in Variable.groups[i]) {
      if (str == Variable.groups[i][k].name) {
        return Variable.groups[i][k].value;
      }
    }
  }
  return null;
}

class xucore {
  constructor(val) {
    this.val = val;
  }

  compileStr(msg, event) {
    let regex = /<(.*?):(.*?)>+/g;
    let matches = [];
    let match;
    while ((match = regex.exec(msg)) !== null) {
      matches.push({ type: match[1], content: match[2] });
    }
    for (let i in matches) {
      if (matches[i]["type"] == "local") {
        if (typeof event.attributes[matches[i]["content"]] == "object") {
          let data = event.attributes[matches[i]["content"]];
          let ms_l = {};
          for (let obj_name in data) {
            if (typeof data[obj_name] != "object") {
              ms_l[obj_name] = data[obj_name];
            }
          }
          msg = String(msg).replace(
            "<" + matches[i]["type"] + ":" + matches[i]["content"] + ">",
            JSON.stringify(ms_l)
          );
        } else {
          msg = String(msg).replace(
            "<" + matches[i]["type"] + ":" + matches[i]["content"] + ">",
            event.attributes[matches[i]["content"]]
          );
        }
      }

      if (matches[i]["type"] == "global") {
        if (typeof get_glocal(matches[i]["content"]) == "object") {
          let data = get_glocal(matches[i]["content"]);
          let ms_l = {};
          for (let obj_name in data) {
            if (typeof data[obj_name] != "object") {
              ms_l[obj_name] = data[obj_name];
            }
          }
          msg = String(msg).replace(
            "<" + matches[i]["type"] + ":" + matches[i]["content"] + ">",
            JSON.stringify(ms_l)
          );
        } else {
          msg = String(msg).replace(
            "<" + matches[i]["type"] + ":" + matches[i]["content"] + ">",
            get_glocal(matches[i]["content"])
          );
        }
      }
    }
    return msg
  }

  jx_sxlist() {
    if (type_all == "actor") {
      for (var i in this.sxlist) {
        var head = this.sxlist[i].match(/(.*):+/);
        var val = this.sxlist[i].match(/:(.*)+/);
        this.actor.attributes[head[1]] = val[1];
      }
    }
  }

  callv(val) {
    var type_local = val.constructor.name;
    if (type_all == "actor" && type_local == "GlobalActor") {
      this.actor = val;
      this.jx_sxlist();
    } else if (type_all == "ui" && type_local == "TextElement") {
      this.ui = val;
      var the_t = this.ui.content.match(/{(.*)+}/);
      var s_text = the_t[1].toString().split(",");
      for (var i in s_text) {
        if (s_text[i].indexOf(":") != -1) {
          var head = s_text[i].match(/(.*):+/);
          var end = s_text[i].match(/:(.*)+/);
          var a_end = the_t[1].toString().match(/actor:(.*)+/);
          a_end[1] = a_end[1].replace(",", "");
          a_end[1] = a_end[1].replace("}", "");
          if (a_end[1]) {
            this.find_actor(a_end[1]);
          }
          if (head[1] == "name") {
            this.find_actor(a_end[1]);
            if (actor) {
              var min = String(actor.attributes[String(end[1])]);
              this.ui.content = this.ui.content.replace(the_t[0], min);
            }
          }
        }
      }
    } else {
      this.static = true;
    }
  }

  find_actor(actorname) {
    if (ActorManager.list) {
      for (var i in ActorManager.list) {
        if (ActorManager.list[i].attributes.name == actorname) {
          actor = ActorManager.list[i];
        }
      }
    }
  }

  find_actorv(att, att_v) {
    if (ActorManager.list) {
      for (var i in ActorManager.list) {
        let att_v_c = this.compileStr(att_v, Event)
        console.log(ActorManager.list[i])
        if (ActorManager.list[i].attributes[String(att)] == att_v_c) {
          
          return ActorManager.list[i];
        }
      }
    }
  }

  set_actorv(att, att_v) {
    if (ActorManager.list) {
      for (var i in ActorManager.list) {
        let att_v_c = this.compileStr(att_v, Event)
        if (ActorManager.list[i].attributes[String(att)] == att_v_c) {
          ActorManager.list[i].attributes[String(att)] = att_v_c
        }
      }
    }
  }

  change_actor(actorname, a_name, val) {
    this.find_actor(actorname);
    if (actor) {
      if (actor.attributes[a_name]) {
        actor.attributes[a_name] = val;
      }
    }
  }

  get_actor(actorname, a_name) {
    this.find_actor(actorname);
    if (actor) {
      if (actor.attributes[a_name]) {
        return actor.attributes[a_name];
      }
    }
  }

  setText(id, actorname, val) {
    this.find_actor(actorname);
    if (UI.get(id)) {
      if (val) {
        var mat_head = val.match(/{name:(.*)}+/);
        if (actor.attributes[String(mat_head[1])]) {
          var Element = UI.get(id);
          var head = String(actor.attributes[String(mat_head[1])]);
          Element.content = Element.content.replace(mat_head[0], head);
        }
      } else {
        var Element = UI.get(id);
        var mat_head = Element.content.match(/{name:(.*)}+/);
        if (mat_head) {
          var head = String(actor.attributes[String(mat_head[1])]);
          Element.content = Element.content.replace(mat_head[0], head);
        }
      }
    }
  }

  call() {
    switch (this.op_zl) {
      case "get_actor":
        Event.attributes[String(this.save_var)] = this.find_actorv(this.obj_att, this.obj_att_val) ? this.find_actorv(this.obj_att, this.obj_att_val) : false
        break;
      case "set_ac_att_last":
        ActorManager.list[ActorManager.list.length-1].attributes[this.obj_att] = this.compileStr(this.obj_att_val, Event)
      break;
    }
  }

  onStart() {
    window.xucore = this;
    switch (this.xucore_plugin_mode) {
      case "xpm_open":
        xucore_mode = true;
      case "xpm_close":
        xucore_mode = false;
    }
    switch (this.state) {
      case "stete_ui":
        type_all = "ui";
        if (!xucore_mode) {
          this.callv(this.val);
        }
        return true;
      case "stete_actor":
        type_all = "actor";
        if (!xucore_mode) {
          this.callv(this.val);
        }
        return true;
      case "stete_static":
        type_all = "static";
        if (!xucore_mode) {
          this.callv(this.val);
        }
        return true;
    }
  }
}

export default xucore;
