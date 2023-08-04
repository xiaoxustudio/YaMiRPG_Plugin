/*
 * @Author: xuranXYS
 * @LastEditTime: 2023-08-04 21:16:51
 * @GitHub: www.github.com/xiaoxustudio
 * @WebSite: www.xiaoxustudio.top
 * @Description: By xuranXYS
 */
/*
@plugin 网络操作
@version 1.0
@author 徐然
@link https://space.bilibili.com/291565199
@desc 

拥有操作get和post请求的指令

get使用注意：
解析表达式：
  可捕获标签，如要捕获head标签里面的title标签，则填写head title
  如果要捕获class类名则用.类名，id用#
  中间用空格隔开


Post使用注意：
  请求参数列表：
  如有多个请用&分割，入a=123&n=123



@option Option {"http_get","http_post","parse_label"}
@alias 数据操作 {请求get,请求post,取标签}


@string http_url
@alias 请求地址
@cond Option {"http_get","http_post"}


@string save_var
@alias 存储到本地变量
@cond Option {"http_get","http_post"}

@option save_type {"html","xml","ori"}
@alias 存储类型 {Html,Xml,原始}
@cond Option {"http_get","http_post"}


@string[] post_header
@alias 请求头
@default ["Content-Type","application/x-www-form-urlencoded"]
@cond Option {"http_post"}

@string post_list
@alias 请求参数列表
@cond Option {"http_post"}

@string parse_var
@alias 解析的本地变量
@cond Option {"parse_label"}

@option parse_type {"html","xml","ori","Img"}
@alias 解析类型 {Html,Xml,原始,Img}
@cond Option {"parse_label"}

@string parse_identifiter
@alias 解析表达式
@cond Option {"parse_label"}


@option parse_operater {"content"}
@alias 操作 {取内容}
@cond Option {"parse_label"}

@string parse_save_var
@alias 存储到本地变量
@cond Option {"parse_label"}

@boolean parse_wite
@alias 是否等待
@default false
@cond Option {"parse_label"}



*/
const request = require("request");

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

  call() {
    switch (this.Option) {
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
  }
  onStart() {
    console.log(this.constructor.guid);
  }
}
