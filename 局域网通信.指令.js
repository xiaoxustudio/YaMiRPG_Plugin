/*
 * @Author: xuranXYS
 * @LastEditTime: 2023-08-28 13:36:06
 * @GitHub: www.github.com/xiaoxustudio
 * @WebSite: www.xiaoxustudio.top
 * @Description: By xuranXYS
 */
/*
@plugin 局域网通信
@version 0.2
@author 徐然
@link https://space.bilibili.com/291565199
@desc 

实现局域网之间的通信，可用于实现联机的效果

【服务器操作】

创建服务器：指定地址和端口

监听事件：
创建失败事件：
服务器创建失败执行，结果存储到@result

创建成功事件：
服务器创建成功执行，结果存储到@result

接收数据事件：
服务器接收到数据执行
接收结果存储到@result
对端信息存储到@result1

客户端加入事件：
客户端信息存储到@result

客户端断开事件：
客户端信息存储到@result

发送数据
******单独发送******
指定ip和端口
发送消息可使用<local:*><global:*>

******广播发送******
发送消息到全部连接到该服务器的客户端
发送消息可使用<local:*><global:*>

关闭服务器

其他操作：
******是否存在客户端******
指定IP和端口，可用于查找服务器列表是否有指定客户端的连接


【客户端操作】

创建客户端：指定地址和端口

监听事件----------
连接失败事件：
客户端连接失败执行，结果存储到@result

连接成功事件：
客户端连接成功执行，结果存储到@result

接收数据事件：
客户端接收到数据执行
接收结果存储到@result
对端信息存储到@result1

服务器断开事件：
服务器信息存储到@result

发送数据
发送消息可使用<local:*><global:*>

关闭客户端

【其他操作】
对象取值：
输入指定变量
对指定变量进行取值（取多层值时，可用英文逗号（,）分割）
并将取得的结果存储到指定变量

对象取值：
将对象的值进行替换

调用事件：
调用事件，可以同步变量池

JSON文本转JSON对象：
输入指定变量
对指定变量进行转换成JSON对象（如果转换对象不是标准JSON文本则不会进行任何操作）
并将取得的结果存储到指定变量

解密数据：
输入文本内容（可使用<local:*><global:*>）
对指定内容进行解密（Base64）
并将结果存储到指定变量

解密数据：
输入文本内容（可使用<local:*><global:*>）
对指定内容进行加密（Base64）
并将结果存储到指定变量

是否是服务器：
判断当前程序是否是服务器
结果以布尔值的形式存储到指定变量

@option op {'server_op','client_op','other_op',"debug_true","debug_false"}
@alias 操作 {服务器操作, 客户端操作, 其他操作,开启调试,关闭调试}


@option op_sub_other {'get_obj_value',"replace_obj","call_event","parse_value",'decode_value','encode_value','is_server'}
@alias 子操作 {对象取值,对象替换,调用事件,JSON文本转JSON对象,解密数据,加密数据,是否是服务器}
@cond op {'other_op'}

@file call_event_id
@filter event
@alias 调用事件
@cond op_sub_other {"call_event"}

@boolean is_share
@alias 是否同步变量池
@default true
@cond op_sub_other {"call_event"}



@string replace_obj_ori
@alias 数据源本地变量
@cond op_sub_other {"replace_obj"}

@string replace_obj_after
@alias 替换对象名称(key)
@cond op_sub_other {"replace_obj"}

@string replace_obj_before
@alias 值替换成对象(value)
@cond op_sub_other {"replace_obj"}



@string parse_data_var
@alias 解析的本地变量
@cond op_sub_other {"parse_value"}

@string parse_data_var_after
@alias 解析后存储的本地变量
@cond op_sub_other {"parse_value"}



@string obj_save_var_before
@alias 要取值本地变量
@cond op_sub_other {"get_obj_value"}

@string obj_save_var_expression
@alias 取值表达式
@cond op_sub_other {"get_obj_value"}

@string obj_save_var_after
@alias 解析后存储的本地变量
@cond op_sub_other {"get_obj_value"}


@string code_text_content
@alias 文本内容
@cond op_sub_other {"decode_value","encode_value"}

@string code_var_content
@alias 操作存储变量
@cond op_sub_other {"decode_value","encode_value"}


@string exist_var_content
@alias 结果存储变量
@cond op_sub_other {"is_server"}







@option op_sub_server {'create_server','listening_server', 'send_server','close_server','other_op_server'}
@alias 子操作 {创建服务器, 监听事件 , 发送数据, 关闭服务器, 其他操作}
@cond op {'server_op'}


@option other_op_server_sub {'is_exist_client'}
@alias 其他操作 {是否存在客户端}
@cond op_sub_server {'other_op_server'}



@string address_server_other
@alias IP地址
@cond other_op_server_sub {'is_exist_client'}

@string port_server_other
@alias 端口
@cond other_op_server_sub {'is_exist_client'}

@string var_server_other
@alias 结果存储到本地变量
@cond other_op_server_sub {"is_exist_client"}





@string address_server
@alias IP地址
@default '127.0.0.1'
@cond op_sub_server {'create_server'}

@number port_server
@alias 端口
@default 8080
@cond op_sub_server {'create_server'}

@file event_success_server
@filter event
@alias 创建成功事件
@cond op_sub_server {"listening_server"}

@file event_failure_server
@filter event
@alias 创建失败事件
@cond op_sub_server {"listening_server"}

@file event_receive_server
@filter event
@alias 接收数据事件
@cond op_sub_server {"listening_server"}

@file event_enter_server
@filter event
@alias 客户端加入事件
@cond op_sub_server {"listening_server"}

@file event_disconnect_server
@filter event
@alias 客户端断开事件
@cond op_sub_server {"listening_server"}




@option send_msg_server_type {'only_send',"broadcast_send"}
@alias 发送类型 {单独发送,广播发送}
@cond op_sub_server {'send_server'}

@string send_msg_server
@alias 发送消息
@default ''
@cond send_msg_server_type {'only_send',"broadcast_send"}

@number send_port_server
@alias 发送客户端端口
@cond send_msg_server_type {'only_send'}

@number send_address_server
@alias 发送客户端地址
@cond send_msg_server_type {'only_send'}





@option op_sub_client {'create_client','listening_client', 'send_client','close_client','other_op'}
@alias 子操作 {创建客户端, 监听事件, 发送数据,关闭客户端, 其他操作}
@cond op {'client_op'}

@string address_client
@alias 连接IP地址
@default '127.0.0.1'
@cond op_sub_client {'create_client'}

@number port_client
@alias 连接端口
@default 8080
@cond op_sub_client {'create_client'}

@file event_success_client
@filter event
@alias 连接成功事件
@cond op_sub_client {"listening_client"}

@file event_failure_client
@filter event
@alias 创建失败事件
@cond op_sub_client {"listening_client"}

@file event_receive_client
@filter event
@alias 接收数据事件
@cond op_sub_client {"listening_client"}

@file event_disconnect_client
@filter event
@alias 服务器断开事件
@cond op_sub_client {"listening_client"}

@string send_msg_client
@alias 发送消息
@default ''
@cond op_sub_client {'send_client'}


*/

const dgram = require('dgram');
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
      "\n\n局域网通信\n\n" +
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
class Clinet_XR {
  servers
  client
  port
  address
  cache
  obj
  Destection
  promise
  obj_event
  constructor(obj) {
    this.promise = new Promise((resolve, rejects) => { resolve("ok") })
    this.obj = obj
    this.cache = ""
    this.servers = []
    this.port = obj.port_client
    this.address = obj.address_client
    this.client = dgram.createSocket("udp4")
  }
  isPortAvailable(port, ip = null) {
    return new Promise((resolve, reject) => {
      let socket = dgram.createSocket('udp4');
      socket.on('error', (error) => {
        // 端口已被占用
        socket.close();
        reject(error);
      });
      socket.bind(port, ip, () => {
        // 端口可用
        socket.close();
        resolve();
      });
    });
  }

  run(obj_event) {
    this.obj_event = obj_event
    this.client.on('listening', () => {
      const address = this.client.address();
      if (is_debug) console.log(`client listening ${address.address}:${address.port}`);
      let send_s = xr.CompileData("check", 0, 0, "client_check")
      this.client.send(send_s, this.port, this.address, (e) => {
        this.isPortAvailable(this.port, this.address).then(() => {
          // 断开
          let client = {
            IP: this.address,
            port: this.port
          }
          if (i !== -1) {
            this.servers.splice(i, 1);
          }
          if (is_debug) console.log("服务器" + client.port + "意外断开！")
          const commands = EventManager.guidMap[this.obj_event.event_disconnect_client];
          if (commands) {
            Callback.push(() => {
              let hder = new EventHandler(commands);
              hder.attributes[String("@result")] = client
              EventHandler.call(hder);
            });
          }
        }).catch((error) => {
        })
      })
      const commands = EventManager.guidMap[this.obj_event.event_success_client];
      if (commands) {
        Callback.push(() => {
          let hder = new EventHandler(commands);
          hder.attributes[String("@result")] = address
          hder.attributes[String("@result1")] = { port: this.port, address: this.address }
          EventHandler.call(hder);
        });
      }

      // 记录新连接的客户端
      let client = {
        id: Date.now(),
        cache: {},
        socket: { port: this.port, address: this.address } // 记录客户端的 socket 对象
      }
      this.servers.push(client);

      // 意外断开检测
      this.Destection = setInterval(() => {
        for (let i in this.servers) {
          let send_s = xr.CompileData("check", 0, 0, "client_check")
          this.client.send(send_s, 0, send_s.length, (e) => {
            this.isPortAvailable(this.servers[i].socket.port, this.servers[i].socket.address).then(() => {
              // 断开
              let client = this.servers[i].socket
              if (i !== -1) {
                this.servers.splice(i, 1);
              }
              if (is_debug) console.log("服务器" + client.port + "意外断开！")
              const commands = EventManager.guidMap[this.obj_event.event_disconnect_client];
              if (commands) {
                Callback.push(() => {
                  let hder = new EventHandler(commands);
                  hder.attributes[String("@result")] = client
                  EventHandler.call(hder);
                });
              }
            }).catch((error) => {
            })
          })
        }
      }, 100);
    });

    this.isPortAvailable(this.port, this.address).then((r) => {
      // 连接失败
      if (is_debug) console.log("连接失败，服务器：" + this.address + ":" + this.port)
      const commands = EventManager.guidMap[this.obj_event.event_failure_client];
      if (commands) {
        Callback.push(() => {
          let hder = new EventHandler(commands);
          hder.attributes[String("@result")] = { ip: this.address, port: this.port }
          EventHandler.call(hder);
        });
      }
    }).catch((e) => {
      this.client.connect(this.port, this.address, () => {
      })
    })


    // 处理客户端数据
    this.client.on('message', (data, rinfo) => {
      // 判断消息是否是自己发的，是就不处理
      if (rinfo == this.client.address()) { return; }
      let c_index = this.servers.findIndex(client => client.socket.address == rinfo.address && client.socket.port == rinfo.port)
      let msg = JSON.parse(data.toString())
      if (msg.type == "server_check") {
        let c_index = this.servers.findIndex(client => client.socket.address == rinfo.address && client.socket.port == rinfo.port)
        if (c_index == -1) {
          if (is_debug) console.log("记录新服务器" + rinfo.port + "连接")
          // 记录新连接的客户端
          let client = {
            id: Date.now(),
            cache: {},
            socket: rinfo // 记录客户端的 socket 对象
          }
          this.servers.push(client);
          // 意外断开检测
          this.Destection = setInterval(() => {
            for (let i in this.servers) {
              let send_s = xr.CompileData("check", 0, 0, "server_check")
              this.server.send(send_s, 0, send_s.length, this.servers[i].socket.port, this.servers[i].socket.address, (e) => {
                this.isPortAvailable(this.servers[i].socket.port).then(() => {
                  // 断开
                  let client = this.servers[i].socket
                  if (i !== -1) {
                    this.servers.splice(i, 1);
                  }
                  if (is_debug) console.log("服务器" + client.port + "意外断开！")
                  const commands = EventManager.guidMap[this.obj_event.event_disconnect_client];
                  if (commands) {
                    Callback.push(() => {
                      let hder = new EventHandler(commands);
                      hder.attributes[String("@result")] = client
                      EventHandler.call(hder);
                    });
                  }
                }).catch((error) => {
                })
              })
            }
          }, 0);
        }
      }
      if (this.client.getRecvBufferSize() != msg.data["BufferSize"] && !Number.isNaN(msg.data["BufferSize"]) && msg.data["BufferSize"]) {
        this.client.setRecvBufferSize(msg.data["BufferSize"])
      }
      if (msg.type == "close") {
        let client = this.servers[c_index].socket
        if (c_index !== -1) {
          this.servers.splice(c_index, 1);
        }
        if (is_debug) console.log("服务器" + client.port + "断开！")
        const commands = EventManager.guidMap[this.obj_event.event_disconnect_client];
        if (commands) {
          Callback.push(() => {
            let hder = new EventHandler(commands);
            hder.attributes[String("@result")] = client
            EventHandler.call(hder);
          });
        }
      } else if (msg.type == "pack_all") {
        // 接收整包数据
        const commands = EventManager.guidMap[this.obj_event.event_receive_client];
        if (commands) {
          Callback.push(() => {
            let hder = new EventHandler(commands);
            hder.attributes[String("@result")] = msg
            hder.attributes["@result1"] = rinfo
            EventHandler.call(hder);
          });
        }
      } else if (msg.type == "pack_start") {
        this.servers[c_index].cache[msg.id] = []
        this.servers[c_index].cache[msg.id].push(msg)
      } else if (msg.type == "chunk") {
        this.servers[c_index].cache[msg.id].push(msg)
      } else if (msg.type == "pack_end") {
        this.servers[c_index].cache[msg.id].push(msg)
        // 合并分包
        let m_data = this.servers[c_index].cache[msg.id]
        let str_to = ""
        for (let re in m_data) {
          str_to += m_data[re].value
        }
        const commands = EventManager.guidMap[this.obj_event.event_receive_client];
        if (commands) {
          Callback.push(() => {
            let hder = new EventHandler(commands);
            hder.attributes[String("@result")] = {
              type: "pack_all",
              id: m_data[0].id,
              pack_num: 0,
              value: xr.from64(str_to),
              data: {}
            }
            hder.attributes["@result1"] = rinfo
            EventHandler.call(hder);
          });
        }
        delete this.servers[c_index].cache[msg.id]
      }

    });
  }
  send(msg, cbk = () => { }) {
    // 发送一次检查
    let send_s = xr.CompileData("check", 0, 0, "client_check")
    this.client.send(send_s, (e) => {
      this.isPortAvailable(this.port, this.address).then(() => {
        // 断开
        let client = {
          IP: this.address,
          port: this.port
        }
        if (i !== -1) {
          this.servers.splice(i, 1);
        }
        if (is_debug) console.log("服务器" + client.port + "意外断开！")
        const commands = EventManager.guidMap[this.obj_event.event_disconnect_client];
        if (commands) {
          Callback.push(() => {
            let hder = new EventHandler(commands);
            hder.attributes[String("@result")] = client
            EventHandler.call(hder);
          });
        }
      }).catch((error) => {
      })
    })
    msg = xr.compileVar(msg)
    // 要发送的数据
    let send_string = xr.to64(msg)
    const size = 1024  // 数据包大小
    const chunkNums = Math.ceil(send_string.length / size) // 要发送的数据包数量
    if (chunkNums < 3) {
      // 发送整包
      this.promise.then((r) => {
        this.client.send(xr.CompileData(send_string, null, null, "pack_all"), (e) => {
          cbk.call(this, e)
        });
      })
    }
    else {
      // 发送分段包
      for (let i = 0; i < chunkNums; i++) {
        let data = send_string.slice(i * size, i * size + size)
        let other = { PackLength: chunkNums, BufferSize: Math.ceil((chunkNums * size) * 2) }
        this.client.setSendBufferSize(other.BufferSize)
        this.client.setRecvBufferSize(other.BufferSize)
        if (i == 0) {
          this.promise.then((r) => {
            this.client.send(xr.CompileData(data, null, i, "pack_start", other), (e) => {
              cbk.call(this, e)
            });
          })
        } else if (i == chunkNums - 1) {
          this.promise.then((r) => {
            this.client.send(xr.CompileData(data, null, i, "pack_end", other), (e) => {
              cbk.call(this, e)
            });
          })
        } else {
          this.promise.then((r) => {
            this.client.send(xr.CompileData(data, null, i, null, other), (e) => {
              cbk.call(this, e)
            });
          })
        }
      }
    }
  }
  close(cb = () => { }) {
    clearInterval(this.Destection)
    return this.client.close(cb)
  }
}
class Server_XR {
  clients
  server
  port
  address
  cache
  obj
  Destection
  promise
  obj_event
  constructor(obj) {
    this.promise = new Promise((resolve, rejects) => { resolve("ok") })
    this.obj = obj
    this.cache = ""
    this.clients = []
    this.port = obj.port_server
    this.address = obj.address_server
    this.server = dgram.createSocket("udp4")
  }
  isPortAvailable(port, ip = null) {
    return new Promise((resolve, reject) => {
      let socket = dgram.createSocket('udp4');
      socket.on('error', (error) => {
        // 端口已被占用
        socket.close();
        reject(error);
      });
      socket.bind(port, () => {
        // 端口可用
        socket.close();
        resolve();
      });
    });
  }
  run(obj_event) {
    this.obj_event = obj_event
    this.server.on('listening', () => {
      const address = this.server.address();
      if (is_debug) console.log(`server listening ${address.address}:${address.port}`);

      const commands = EventManager.guidMap[this.obj_event.event_success_server];
      if (commands) {
        Callback.push(() => {
          let hder = new EventHandler(commands);
          hder.attributes[String("@result")] = address
          EventHandler.call(hder);
        });
      }


    });

    this.isPortAvailable(this.port, this.address).then((r) => {
      this.server.bind(this.port, this.address);
    }).catch((e) => {
      // 连接失败
      if (is_debug) console.log("创建失败，服务器：" + this.address + ":" + this.port)
      const commands = EventManager.guidMap[this.obj_event.event_failure_server];
      if (commands) {
        Callback.push(() => {
          let hder = new EventHandler(commands);
          hder.attributes[String("@result")] = { ip: this.address, port: this.port }
          EventHandler.call(hder);
        });
      }
    })

    // 处理客户端数据
    this.server.on('message', (data, rinfo) => {
      // 判断消息是否是自己发的，是就不处理
      if (rinfo == this.server.address()) { return; }
      let msg = JSON.parse(data.toString())
      if (msg.type == "client_check") {
        let c_index = this.clients.findIndex(client => client.socket.address == rinfo.address && client.socket.port == rinfo.port)
        if (c_index == -1) {
          if (is_debug) console.log("客户端" + rinfo.port + "连接")
          // 记录新连接的客户端
          let client = {
            id: Date.now(),
            cache: {},
            socket: rinfo // 记录客户端的 socket 对象
          }
          this.clients.push(client);
          // 意外断开检测
          this.Destection = setInterval(() => {
            for (let i in this.clients) {
              let send_s = xr.CompileData("check", 0, 0, "server_check")
              this.server.send(send_s, 0, send_s.length, this.clients[i].socket.port, this.clients[i].socket.address, (e) => {
                this.isPortAvailable(this.clients[i].socket.port).then(() => {
                  // 断开
                  let client = this.clients[i].socket
                  if (i !== -1) {
                    this.clients.splice(i, 1);
                  }
                  if (is_debug) console.log("客户端" + client.port + "意外断开！")
                  const commands = EventManager.guidMap[this.obj_event.event_disconnect_server];
                  if (commands) {
                    Callback.push(() => {
                      let hder = new EventHandler(commands);
                      hder.attributes[String("@result")] = client
                      EventHandler.call(hder);
                    });
                  }
                }).catch((error) => {
                })
              })
            }
          }, 0);
          const commands = EventManager.guidMap[this.obj_event.event_enter_server];
          if (commands) {
            Callback.push(() => {
              let hder = new EventHandler(commands);
              hder.attributes[String("@result")] = client
              EventHandler.call(hder);
            });
          }
        }
      }
      let c_index = this.clients.findIndex(client => client.socket.address == rinfo.address && client.socket.port == rinfo.port)

      if (this.server.getRecvBufferSize() != msg.data["BufferSize"] && !Number.isNaN(msg.data["BufferSize"]) && msg.data["BufferSize"]) {
        this.server.setRecvBufferSize(msg.data["BufferSize"])
      }
      if (msg.type == "close") {
        let client = this.clients[c_index].socket
        if (c_index !== -1) {
          this.clients.splice(c_index, 1);
        }
        if (is_debug) console.log("客户端" + client.port + "断开！")
        const commands = EventManager.guidMap[this.obj_event.event_disconnect_server];
        if (commands) {
          Callback.push(() => {
            let hder = new EventHandler(commands);
            hder.attributes[String("@result")] = client
            EventHandler.call(hder);
          });
        }
      } else if (msg.type == "pack_all") {
        // 接收整包数据
        const commands = EventManager.guidMap[this.obj_event.event_receive_server];
        if (commands) {
          Callback.push(() => {
            let hder = new EventHandler(commands);
            hder.attributes[String("@result")] = msg
            hder.attributes["@result1"] = rinfo
            EventHandler.call(hder);
          });
        }
      } else if (msg.type == "pack_start") {
        this.clients[c_index].cache[msg.id] = []
        this.clients[c_index].cache[msg.id].push(msg)
      } else if (msg.type == "chunk") {
        this.clients[c_index].cache[msg.id].push(msg)
      } else if (msg.type == "pack_end") {
        this.clients[c_index].cache[msg.id].push(msg)
        // 合并分包
        let m_data = this.clients[c_index].cache[msg.id]
        let str_to = ""
        for (let re in m_data) {
          str_to += m_data[re].value
        }
        const commands = EventManager.guidMap[this.obj_event.event_receive_server];
        if (commands) {
          Callback.push(() => {
            let hder = new EventHandler(commands);
            hder.attributes[String("@result")] = {
              type: "pack_all",
              id: m_data[0].id,
              pack_num: 0,
              value: xr.from64(str_to),
              data: {}
            }
            EventHandler.call(hder);
          });
        }
        delete this.clients[c_index].cache[msg.id]
      }
      if (Event.attributes[String("@result1")]) {
        delete Event.attributes[String("@result1")]
      }
      Event.attributes[String("@result1")] = rinfo
    });
  }
  send(msg, port = this.port, address = this.address, callback = () => { }) {
    for (let i in this.clients) {
      let client = this.clients[i].socket
      if (this.port == client.port && this.address == client.address) {
        let send_s = xr.CompileData("check", 0, 0, "server_check")
        this.server.send(send_s, 0, send_s.length, this.clients[i].socket.port, this.clients[i].socket.address, (e) => {
          this.isPortAvailable(this.clients[i].socket.port).then(() => {
            // 断开
            let client = this.clients[i].socket
            if (i !== -1) {
              this.clients.splice(i, 1);
            }
            if (is_debug) console.log("客户端" + client.port + "意外断开！")
            const commands = EventManager.guidMap[this.obj_event.event_disconnect_server];
            if (commands) {
              Callback.push(() => {
                let hder = new EventHandler(commands);
                hder.attributes[String("@result")] = client
                EventHandler.call(hder);
              });
            }
          }).catch((error) => {
          })
        })
      }
    }
    msg = xr.compileVar(msg)
    // 要发送的数据
    let send_string = xr.to64(msg)
    const size = 1024  // 数据包大小
    const chunkNums = Math.ceil(send_string.length / size) // 要发送的数据包数量
    if (chunkNums < 3) {
      // 发送整包
      this.promise.then((r) => {
        this.server.send(xr.CompileData(send_string, null, null, "pack_all"), port, address, callback);
      })
    }
    else {
      // 发送分段包
      for (let i = 0; i < chunkNums; i++) {
        let data = send_string.slice(i * size, i * size + size)
        let other = { PackLength: chunkNums, BufferSize: Math.ceil((chunkNums * size) * 2) }
        this.server.setSendBufferSize(other.BufferSize)
        this.server.setRecvBufferSize(other.BufferSize)
        if (i == 0) {
          this.promise.then((r) => {
            this.server.send(xr.CompileData(data, null, i, "pack_start", other), port, address, callback);
          })
        } else if (i == chunkNums - 1) {
          this.promise.then((r) => {
            this.server.send(xr.CompileData(data, null, i, "pack_end", other), port, address, callback);
          })
        } else {
          this.promise.then((r) => {
            this.server.send(xr.CompileData(data, null, i, null, other), port, address, callback);
          })
        }
      }
    }
  }
  sendbroadcast(msg) {
    for (let i in this.clients) {
      let data = this.clients[i]
      this.send(msg, data.socket.port, data.socket.address)
    }
  }
  close(cb = () => { }) {
    clearInterval(this.Destection)
    return this.server.close(cb)
  }
  /**
   * @description: 根据端口查找客户端
   * @param {*} port
   * @return {*}
   */
  getClientByPort(port = 0) {
    const index = this.clients.findIndex(client => client.socket.port === port);
    return index != -1 ? this.clients[index].localPort : -1
  }
  /**
   * @description: 根据指定IP和端口查找客户端
   * @param {*} port
   * @param {*} address
   * @return {*}
   */
  getClient(port = 0, address = 0) {
    let index = this.clients.findIndex(client => String.prototype.trim(client.socket.address) == String.prototype.trim(address) && String.prototype.trim(client.socket.port) == String.prototype.trim(port))
    console.log(index)
    return index != -1 ? this.clients[index] : index
  }
  /**
   * @description: 获取服务器连接客户端列表
   * @return {*}
   */
  getClients() {
    return this.clients
  }
}


let server
let client
let is_debug = false

export default class Online_XR {
  call() {
    switch (this.op) {
      case "server_op":
        switch (this.op_sub_server) {
          case "create_server":
            server = new Server_XR(this)
            break
          case "close_server":
            if (server) server.close(); server = null
            break
          case "listening_server":
            let event_list = {
              event_disconnect_client: this.event_disconnect_client,
              event_disconnect_server: this.event_disconnect_server,
              event_enter_server: this.event_enter_server,
              event_failure_client: this.event_failure_client,
              event_failure_server: this.event_failure_server,
              event_receive_client: this.event_receive_client,
              event_receive_server: this.event_receive_server,
              event_success_client: this.event_success_client,
              event_success_server: this.event_success_server,
            }
            server.run(event_list)
            break
          case "send_server":
            if (server) {
              let str = this.send_msg_server
              switch (this.send_msg_server_type) {
                case "broadcast_send":
                  server.sendbroadcast(str)
                  break
                case "only_send":
                  server.send(str, this.send_port_server, this.send_address_server)
                  break
              }
            }
            break
          case "other_op_server":
            switch (this.other_op_server_sub) {
              case "is_exist_client":
                if (server) {
                  let res = server.getClient(xr.compileVar(this.address_server_other).length == 0 ? 0 : xr.compileVar(this.address_server_other), xr.compileVar(this.port_server_other).length == 0 ? 0 : xr.compileVar(this.port_server_other))
                  if (Event.attributes[String(this.var_server_other)]) {
                    delete Event.attributes[String(this.var_server_other)]
                  }
                  Event.attributes[String(this.var_server_other)] = res
                }
                break
            }
            break
        }
        break
      case "client_op":
        switch (this.op_sub_client) {
          case "create_client":
            client = new Clinet_XR(this)
            break
          case "close_client":
            if (client) client.close(); client = null
            break
          case "listening_client":
            let event_list = {
              event_disconnect_client: this.event_disconnect_client,
              event_disconnect_server: this.event_disconnect_server,
              event_enter_server: this.event_enter_server,
              event_failure_client: this.event_failure_client,
              event_failure_server: this.event_failure_server,
              event_receive_client: this.event_receive_client,
              event_receive_server: this.event_receive_server,
              event_success_client: this.event_success_client,
              event_success_server: this.event_success_server,
            }
            client.run(event_list)
            break
          case "send_client":
            if (client) {
              let str = this.send_msg_client
              client.send(str)
            }
            break
        }
        break
      case "other_op":
        switch (this.op_sub_other) {
          case "parse_value":
            let data = Event.attributes[String(this.parse_data_var)];
            if (xr.is_json(data)) {
              Event.attributes[String(this.parse_data_var_after)] = JSON.parse(data);
            }else{
              Event.attributes[String(this.parse_data_var_after)] = "not json";
            }
            break
          case "is_server":
            if (Event.attributes[String(this.exist_var_content)]) {
              delete Event.attributes[String(this.exist_var_content)]
            }
            Event.attributes[String(this.exist_var_content)] = xr.is_server()
            break
          case "decode_value":
            var str = xr.compileVar(this.code_text_content)
            if (Event.attributes[String(this.code_var_content)]) {
              delete Event.attributes[String(this.code_var_content)]
            }
            Event.attributes[String(this.code_var_content)] = xr.from64(str)
            break
          case "encode_value":
            var str = xr.compileVar(this.code_text_content)
            if (Event.attributes[String(this.code_var_content)]) {
              delete Event.attributes[String(this.code_var_content)]
            }
            Event.attributes[String(this.code_var_content)] = xr.to64(str)
            break
          case "get_obj_value":
            if (typeof Event.attributes[String(this.obj_save_var_before)] == "object") {
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
                  put_value = put_value?.[c_data?.[index]];
                  index++;
                }
              }
            }
            break
          case "replace_obj":
            let af = Event.attributes[String(this.replace_obj_after)]
            let be = Event.attributes[String(this.replace_obj_before)]
            Event.attributes[String(this.replace_obj_ori)][af] = be
            break
          case "call_event":
            const commands = EventManager.guidMap[this.call_event_id];
            if (this.is_share) {
              if (commands) {
                let hder = new EventHandler(commands);
                hder.attributes = Event.attributes
                EventHandler.call(hder);
              }
            }
        }
        break
      case "debug_true":
        is_debug = true
        break
      case "debug_false":
        is_debug = false
        break
    }
  }
  onStart() {
    xr.showInfo()
  }

}