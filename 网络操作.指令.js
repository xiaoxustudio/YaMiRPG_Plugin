/*
 * @Author: xuranXYS
 * @LastEditTime: 2023-08-08 21:36:00
 * @GitHub: www.github.com/xiaoxustudio
 * @WebSite: www.xiaoxustudio.top
 * @Description: By xuranXYS
 */
/*
@plugin 网络操作
@version 1.1
@author 徐然
@link https://space.bilibili.com/291565199
@desc 

——————————网页操作——————————
拥有操作get和post请求的指令

get使用注意：
解析表达式：
  可捕获标签，如要捕获head标签里面的title标签，则填写head title
  如果要捕获class类名则用.类名，id用#
  中间用空格隔开


Post使用注意：
  请求参数列表：
  如有多个请用&分割，入a=123&n=123


——————————局域网操作——————————
创建局域网：指定地址和端口

设置局域网监听：
  成功事件：当有客户端首次连接时处理，发送的数据会存到@result本地变量里面
  监听事件：当有客户端发送数据时处理，发送的数据会存到@result本地变量里面
  断开事件：当有客户端断开连接时处理，@result本地变量存储断开的连接

局域网发送数据：
  信息：信息可使用<global:*><local:*>的标签，此内容将作为消息发出
  port：当值为0时将对连接里面的所有客户端发送消息，不为0时将对指定port发送消息

获取局域网连接列表：获取当前服务器连接列表的实例，然后存储到指定本地变量中

关闭局域网

创建客户端：指定地址和端口
  成功事件：当连接成功时执行

设置客户端监听：
  失败事件：当连接服务器失败处理
  监听事件：当服务器发送过来数据时处理，发送来的数据会存到@result本地变量里面

客户端发送数据：
  信息：信息可使用<global:*><local:*>的标签，此内容将作为消息发出

关闭客户端

@option rootop {"web_op","lan_op","parse_op"}
@alias 操作 {网页操作,局域网操作,解析取值操作}

@option web_op_root {"http_get","http_post","parse_label"}
@alias 数据操作 {请求get,请求post,取标签}
@cond rootop {"web_op"}

@option lan_op_root {"local_server","local_server_listening","server_send","get_server_list","close_server","local_client","local_client_listening","client_send","close_client"}
@alias 数据操作 {创建局域网,设置局域网监听,局域网发送数据,获取局域网连接列表,关闭局域网,创建客户端,设置客户端监听,客户端发送数据,关闭客户端}
@cond rootop {"lan_op"}


@option parse_op_root {"parse_data","object_get_value"}
@alias 数据操作 {解析数据,对象取值}
@cond rootop {"parse_op"}

@string http_url
@alias 请求地址
@cond web_op_root {"http_get","http_post"}


@string save_var
@alias 存储到本地变量
@cond web_op_root {"http_get","http_post"}

@option save_type {"html","xml","ori"}
@alias 存储类型 {Html,Xml,原始}
@cond web_op_root {"http_get","http_post"}


@string[] post_header
@alias 请求头
@default ["Content-Type","application/x-www-form-urlencoded"]
@cond web_op_root {"http_post"}

@string post_list
@alias 请求参数列表
@cond web_op_root {"http_post"}

@string parse_var
@alias 解析的本地变量
@cond web_op_root {"parse_label"}

@option parse_type {"html","xml","ori","Img"}
@alias 解析类型 {Html,Xml,原始,Img}
@cond web_op_root {"parse_label"}

@string parse_identifiter
@alias 解析表达式
@cond web_op_root {"parse_label"}


@option parse_operater {"content"}
@alias 操作 {取内容}
@cond web_op_root {"parse_label"}

@string parse_save_var
@alias 存储到本地变量
@cond web_op_root {"parse_label"}

@boolean parse_wite
@alias 是否等待
@default false
@cond web_op_root {"parse_label"}


@string server_host
@alias 地址
@default 127.0.0.1
@cond lan_op_root {"local_server"}


@number server_port
@alias 端口
@default 8080
@cond lan_op_root {"local_server"}


@string client_host
@alias 地址
@default 127.0.0.1
@cond lan_op_root {"local_client"}


@number client_port
@alias 端口
@default 8080
@cond lan_op_root {"local_client"}


@option send_type {"string","other"}
@alias 信息类型 {字符串,其他}
@cond lan_op_root {"server_send","client_send"}


@string msg
@alias 信息
@cond lan_op_root {"server_send","client_send"}

@string msg_id
@alias port(0则发送全局)
@default 0
@cond lan_op_root {"server_send"}

@file event_success
@filter event
@alias 成功事件
@cond lan_op_root {"local_client","local_server_listening"}

@file event_fail
@filter event
@alias 失败事件
@cond lan_op_root {"local_client_listening"}

@file event_listening
@filter event
@alias 监听事件
@cond lan_op_root {"local_server_listening","local_client_listening"}

@file event_close
@filter event
@alias 断开事件
@cond lan_op_root {"local_server_listening"}


@string server_save_var
@alias 存储到本地变量
@cond lan_op_root {"get_server_list"}



@string parse_data_var
@alias 解析的本地变量
@cond parse_op_root {"parse_data"}

@string parse_data_var_after
@alias 解析后存储的本地变量
@cond parse_op_root {"parse_data"}



@string obj_save_var_before
@alias 要取值本地变量
@cond parse_op_root {"object_get_value"}

@string obj_save_var_expression
@alias 取值表达式
@cond parse_op_root {"object_get_value"}

@string obj_save_var_after
@alias 解析后存储的本地变量
@cond parse_op_root {"object_get_value"}

*/
const request = require("request");
const net = require("net");

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

class Server_xr {
  server;
  list;
  socket;
  Master;
  event;
  connect_event;
  event_close;
  event_closed;
  constructor({ host, port, fum }) {
    this.event = () => {};
    this.connect_event = () => {};
    this.event_close = () => {};
    this.event_closed = () => {
      const index = this.list.indexOf(this.socket);
      if (index !== -1) {
        this.list.splice(index, 1);
      }
      this.event_close.call(this);
    };
    this.server = net.createServer(fum);
    this.list = [];
    this.Master = net.Socket();
    this.Master.connect(port, host, () => {});
  }
  send(msg, id = null, event, type = "string") {
    console.log(msg);
    // 将字符串里面的变量编译为文本
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
    id = id != 0 ? event.attributes?.[String(id)] : id;
    let ms_pack = {
      type: type,
      value: msg,
    };
    if (id && id != 0) {
      for (let i in this.list) {
        if (Number(id) == this.list[i].remotePort)
          this.list[i].write(JSON.stringify(ms_pack));
      }
    } else {
      for (let i in this.list) {
        this.list[i].write(JSON.stringify(ms_pack));
      }
    }
  }
  listen(port, fun) {
    this.server.listen(port, fun);
  }
  getSocket() {
    return this.socket;
  }
  getMaster() {
    return this.Master;
  }
  close(fn) {
    return this.server.close(fn);
  }
  isListening() {
    return this.server.listening;
  }
  get_connectlist() {
    return this.list;
  }
}

class Client_xr {
  client;
  event;
  event_close;
  constructor({ host, port, fum }) {
    this.event = () => {};
    this.event_close = () => {};
    this.client = net.connect(port, host, () => {
      const commands = EventManager.guidMap[fum];
      if (commands) {
        Callback.push(() => {
          let hder = new EventHandler(commands);
          hder.attributes[String("@result")] = [
            this.client.localAddress,
            this.client.localPort,
          ];
          EventHandler.call(hder);
        });
      }
    });
  }
  send(msg, event, type = "string") {
    // 将字符串里面的变量编译为文本
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
    let ms_pack = {
      type: type,
      value: JSON.stringify(msg),
    };
    return this.client.write(JSON.stringify(ms_pack));
  }
  end() {
    this.client.destroy();
  }

  n_server(fn = () => {}) {
    this.client.on("close", fn);
  }
  dis_server(fn = () => {}) {
    this.client.on("error", fn);
  }
  receive_data(fn = () => {}) {
    this.client.on("data", function (data) {
      fn.call(this, data);
    });
  }
}

//  本地实例
let local_server_object;
let local_client_object;

export default class Http_Op {
  run({ url, type, svar, event, type_c }) {
    var xhr = new XMLHttpRequest();
    xhr.open(type_c, url, false);
    if (type_c == "POST") {
      let index = 0;
      for (let i = 0; i < Number(this.post_header.length / 2); i++) {
        xhr.setRequestHeader(
          this.post_header[index],
          this.post_header[(index % 2) + 1]
        );
        index += 1;
      }
    }

    xhr.onreadystatechange = function (e) {
      if (xhr.readyState === 4 && xhr.status === 200) {
        let data = "";
        if (svar && svar.length != 0) {
          let domparser = new XMLSerializer();
          let doc = null;
          switch (type) {
            case "ori":
              doc = xhr.response;
              break;
            case "xml":
              doc = xhr.responseXML;
              break;
            case "html":
              doc = xhr.responseText;
              break;
          }
          event.attributes[String(svar)] = doc;
        }
      }
    };

    xhr.onerror = function (e) {
      console.error(xhr.statusText);
    };
    if (type_c == "POST") {
      xhr.send(this.post_list);
    } else {
      xhr.send(null);
    }
  }
  compile(r) {
    let commands = [...Event.commands];
    commands.unshift(Command.compile(r, () => {})[0]);
    let eh = new EventHandler(Command.compile(r, () => {}));
    EventHandler.call(eh);
  }

  parse({ rvar, type, event, svar }) {
    // 初始化
    let running = true;
    let domparser = new DOMParser();
    let datas = null;

    if (this.parse_wite) {
      // 等待
      while (running) {
        if (event.attributes[rvar]) {
          let q = domparser.parseFromString(
            event.attributes[rvar],
            type == "html"
              ? "text/html"
              : type == "axmlx"
              ? "application/xhtml+xml"
              : type == "axml"
              ? "application/xml"
              : type == "xml"
              ? "text/xml"
              : "image/svg+xml"
          );
          running = false;
          if (event.attributes[svar]) {
            delete event.attributes[svar];
          }
          event.attributes[svar] = q.querySelector(
            this.parse_identifiter
          ).textContent;
        }
      }
    } else {
      // 不等待
      let run_obj = setInterval(() => {
        if (event.attributes[rvar]) {
          let q = domparser.parseFromString(
            event.attributes[rvar],
            type == "html"
              ? "text/html"
              : type == "axmlx"
              ? "application/xhtml+xml"
              : type == "axml"
              ? "application/xml"
              : type == "xml"
              ? "text/xml"
              : "image/svg+xml"
          );
          running = false;
          if (event.attributes[svar]) {
            delete event.attributes[svar];
          }
          event.attributes[svar] = q.querySelector(
            this.parse_identifiter
          ).textContent;
          clearInterval(run_obj);
        }
      }, 1);
    }
  }
  clientStart(host, port, fn) {
    if (!local_client_object) {
      local_client_object = new Client_xr({
        host: host,
        port: port,
        fum: fn,
      });
    }
  }
  serverStart(host, port) {
    if (!local_server_object) {
      local_server_object = new Server_xr({
        host: host,
        port: port,
        fum: (s) => {
          s.setEncoding("utf8");
          // 获取客户端地址和端口
          const clientAddress = s.remoteAddress;
          const clientPort = s.remotePort;
          local_server_object.list.push(s);

          // s.pipe(s)
          local_server_object.socket = s;
          local_server_object.server.on(
            "connection",
            local_server_object.connect_event
          );
          s.on("data", local_server_object.event);
          s.on("close", local_server_object.event_closed);
          s.on("error", (err) => {
            console.log(err);
          });
        },
      });
    }

    local_server_object.listen(this.server_port, function () {
      console.log("server is listening");
    });
  }

  setListening(id, id1, id2) {
    local_server_object.connect_event = (data) => {
      const commands = EventManager.guidMap[id];
      if (commands) {
        Callback.push(() => {
          let hder = new EventHandler(commands);
          hder.attributes[String("@result")] = {
            ip: data.remoteAddress,
            port: data.remotePort,
          };
          EventHandler.call(hder);
        });
      }
    };
    local_server_object.event = (data) => {
      const commands = EventManager.guidMap[id1];
      if (commands) {
        Callback.push(() => {
          let hder = new EventHandler(commands);
          hder.attributes[String("@result")] = data.toString();
          EventHandler.call(hder);
        });
      }
    };
    local_server_object.event_close = (a) => {
      console.log("client is closing");
      const commands = EventManager.guidMap[id2];
      if (commands) {
        Callback.push(() => {
          let hder = new EventHandler(commands);
          hder.attributes[String("@result")] = a;
          hder.attributes[String("@result1")] = [
            local_server_object.socket.remoteAddress,
            local_server_object.socket.remotePort,
          ];
          EventHandler.call(hder);
        });
      }
    };
  }

  setClientListening(id, id1) {
    local_client_object.receive_data((data) => {
      const commands = EventManager.guidMap[id1];
      if (commands) {
        Callback.push(() => {
          let hder = new EventHandler(commands);
          hder.attributes[String("@result")] =
            JSON.parse(data).type == "string"
              ? JSON.parse(data).value
              : JSON.parse(JSON.parse(data).value);
          EventHandler.call(hder);
        });
      }
    });
    local_client_object.dis_server((a) => {
      console.log("client is closing");
      const commands = EventManager.guidMap[id];
      if (commands) {
        Callback.push(() => {
          let hder = new EventHandler(commands);
          EventHandler.call(hder);
        });
      }
    });
    local_client_object.n_server((a) => {});
  }

  is_json(str){
    try {
      JSON.parse(str);
      return true;
    } catch(e) {
      return false;
    }
  }

  call() {
    switch (this.rootop) {
      case "web_op":
        switch (this.web_op_root) {
          case "http_get":
            this.run({
              url: this.http_url,
              type_c: "GET",
              svar: this.save_var,
              type: this.save_type,
              event: Event,
            });
            break;
          case "http_post":
            this.run({
              url: this.http_url,
              type_c: "POST",
              svar: this.save_var,
              type: this.save_type,
              event: Event,
            });
            break;
          case "parse_label":
            this.parse({
              rvar: this.parse_var,
              type: this.parse_type,
              event: Event,
              svar: this.parse_save_var,
            });
            break;
        }
        break;
      case "lan_op":
        switch (this.lan_op_root) {
          case "local_server":
            this.serverStart(this.server_host, this.server_port);
            break;
          case "local_server_listening":
            if (local_server_object) {
              this.setListening(
                this.event_success,
                this.event_listening,
                this.event_close
              );
            }
            break;
          case "server_send":
            if (local_server_object) {
              local_server_object.send(
                this.msg,
                this.msg_id,
                Event,
                this.send_type
              );
            }
            break;
          case "close_server":
            if (local_server_object) {
              if (local_server_object.isListening()) {
                setTimeout(() => {
                  local_server_object.server.close((e) => {});
                  local_server_object = null;
                }, 1);
              }
            }
            break;
          case "local_client":
            this.clientStart(
              this.server_host,
              this.server_port,
              this.event_success
            );
            break;
          case "client_send":
            if (local_client_object) {
              local_client_object.send(this.msg, Event, this.send_type);
            }
            break;
          case "local_client_listening":
            if (local_client_object) {
              this.setClientListening(this.event_fail, this.event_listening);
            }
            break;
          case "close_client":
            if (local_client_object) {
              setTimeout(() => {
                local_client_object.end();
                local_client_object = null;
              }, 1);
            }
            break;
          case "get_server_list":
            if (local_server_object) {
              Event.attributes[String(this.server_save_var)] =
                local_server_object.get_connectlist();
            }
            break;
        }
        break;
      case "parse_op":
        switch (this.parse_op_root) {
          case "parse_data":
            let data = Event.attributes[String(this.parse_data_var)];
            if (data && this.is_json(data)) {
              let new_data = eval("("+data+")");
              new_data.value = JSON.parse(new_data.value);
              new_data.value = JSON.parse(new_data.value);
              Event.attributes[String(this.parse_data_var_after)] = new_data;
            }
            break;
          case "object_get_value":
            if (typeof Event.attributes[String(this.obj_save_var_before)] =="object") {
              let c_data = String(this.obj_save_var_expression).split(",");
              let is_start = true;
              let index = 0;
              let put_value =
                Event.attributes[String(this.obj_save_var_before)];
              while (is_start) {
                if (c_data.length == index) {
                  Event.attributes[String(this.obj_save_var_after)] = put_value;
                  is_start = false;
                  break;
                } else {
                  put_value = put_value[c_data[index]];
                  index++;
                }
              }
            }
            break;
        }
        break;
    }
  }
  onStart() {
    console.log(Party);
  }
}
