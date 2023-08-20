/*
 * @Author: xuranXYS
 * @LastEditTime: 2023-08-20 22:27:26
 * @GitHub: www.github.com/xiaoxustudio
 * @WebSite: www.xiaoxustudio.top
 * @Description: By xuranXYS
 */
/*
@plugin 扩展事件
@version 1.0
@author 徐然
@link https://space.bilibili.com/291565199
@desc 

【基础】
弹出系统通知
调用CMD命令：
指令用空格分开



【其他】
数据加密：

aes128：
密钥需要16字节

输出格式介绍：
'base64'：以 Base64 编码表示哈希结果。
'latin1'：以 Latin-1（ISO-8859-1） 编码表示哈希结果。
'binary'：以二进制格式表示哈希结果。
'hex'：以十六进制格式表示哈希结果（已在你提供的示例中使用）。
'utf8'：以 UTF-8 编码表示哈希结果。
'ascii'：以 ASCII 编码表示哈希结果。

@option op {"base", "other"}
@alias 操作 {基础, 其他}

@option op_base {"os_message","callcmd"}
@alias 基础操作 {弹出系统通知,调用CMD命令}
@cond op {"base"}

@string cmd_string
@alias 指令(空格分开)
@cond op_base {"callcmd"}

@string msg_title
@alias 标题
@cond op_base {"os_message"}

@string msg_content
@alias 内容
@cond op_base {"os_message"}

@file msg_onclik
@filter event
@alias 点击消息事件
@cond op_base {"os_message"}


@option op1 {"encrpty","dencrpty"}
@alias 其他操作 {数据加密,数据解密}
@cond op {"other"}

@option op1_op {"md5","sha256","Hmac","aes128"}
@alias 加密类型 {md5加密,sha256加密,HMAC加密,AES128}
@cond op1 {"encrpty"}

@option op1_op1 {"Base64","latin1","binary","hex","utf8",ascii}
@alias 输出格式 {Base64,latin1(ISO-8859-1),binary,hex,utf8,ascii}
@cond op1_op {"md5","sha256","Hmac","aes128"}

@string encrpty_key
@alias 加密密钥
@cond op1_op {"Hmac","aes128"}

@boolean is_local_key
@alias 是否本地变量
@default false
@desc 加密密钥是否本地变量
@cond op1_op {"md5","sha256","Hmac","aes128"}

@string encrpty_text
@alias 加密文本
@cond op1_op {"md5","sha256","Hmac","aes128"}

@boolean is_local
@alias 是否本地变量
@default false
@desc 加密文本是否本地变量
@cond op1_op {"md5","sha256","Hmac","aes128"}

@string save_var
@alias 存储到本地变量
@cond op1_op {"md5","sha256","Hmac","aes128"}

@option op1_opa {"aes128"}
@alias 解密类型 {AES128}
@cond op1 {"dencrpty"}

@string encrpty_key_de
@alias 解密密钥
@cond op1_opa {"aes128"}

@boolean is_local_key_de
@alias 是否本地变量
@default false
@desc 解密密钥是否本地变量
@cond op1_opa {"aes128"}

@string encrpty_text_de
@alias 解密文本
@cond op1_opa {"aes128"}

@boolean is_local_de
@alias 是否本地变量
@default true
@desc 加密文本是否本地变量
@cond op1_opa {"aes128"}

@string save_var_de
@alias 存储到本地变量
@cond op1_opa {"aes128"}

*/

const crypto = require('node:crypto');
const { Notification } = require('electron')
const spawn = require("child_process").spawn;

const  iconvLite = require('iconv-lite');

export default class encrypt_xr {
    type
    digest
    key
    constructor() {
        this.type = "md5"
        this.digest = "hex"
        this.key = "xuran"
    }
    call() {
        let str = ""
        switch (this.op) {
            case "other":
                switch (this.op1) {
                    case "encrpty":
                        switch (this.op1_op) {
                            case "md5" || "sha256":
                                this.type = this.op1_op
                                this.digest = this.op1_op1
                                if (Event.attributes[this.save_var]) {
                                    delete Event.attributes[this.save_var];
                                }
                                if (!this.is_local) {
                                    str = this.encrpty_text
                                } else {
                                    str = Event.attributes[this.encrpty_text] ? Event.attributes[this.encrpty_text] : "null"
                                }
                                Event.attributes[this.save_var] = this.createHash(str)
                                break
                            case "Hmac":
                                this.type = "md5"
                                this.digest = this.op1_op1
                                if (Event.attributes[this.save_var]) {
                                    delete Event.attributes[this.save_var];
                                }
                                if (!this.is_local_key) {
                                    this.key = this.encrpty_key
                                } else {
                                    this.key = Event.attributes[this.encrpty_key] ? Event.attributes[this.encrpty_key] : "null"
                                }
                                if (!this.is_local) {
                                    str = this.encrpty_text
                                } else {
                                    str = Event.attributes[this.encrpty_text] ? Event.attributes[this.encrpty_text] : "null"
                                }
                                Event.attributes[this.save_var] = this.createHmac(str, this.key)
                                break
                            case "aes128":
                                this.type = "aes-128-cbc"
                                this.digest = this.op1_op1
                                this.key = this.encrpty_key
                                if (Event.attributes[this.save_var]) {
                                    delete Event.attributes[this.save_var];
                                }
                                if (!this.is_local_key) {
                                    this.key = this.encrpty_key
                                } else {
                                    this.key = Event.attributes[this.encrpty_key] ? Event.attributes[this.encrpty_key] : "null"
                                }
                                if (!this.is_local) {
                                    str = this.encrpty_text
                                } else {
                                    str = Event.attributes[this.encrpty_text] ? Event.attributes[this.encrpty_text] : "null"
                                }
                                Event.attributes[this.save_var] = this.aes128encrypt(str, this.key)
                                break
                        }
                        break
                    case "dencrpty":
                        switch (this.op1_op) {
                            case "aes128":
                                this.type = "aes-128-cbc"
                                this.digest = this.op1_op1
                                this.key = this.encrpty_key_de
                                if (Event.attributes[this.save_var_de]) {
                                    delete Event.attributes[this.save_var_de];
                                }
                                if (!this.is_local_key_de) {
                                    this.key = this.encrpty_key_de
                                } else {
                                    this.key = Event.attributes[this.encrpty_key_de] ? Event.attributes[this.encrpty_key_de] : "null"
                                }
                                if (!this.is_local_de) {
                                    str = this.encrpty_text_de
                                } else {
                                    str = Event.attributes[this.encrpty_text_de] ? Event.attributes[this.encrpty_text_de] : "null"
                                }
                                Event.attributes[this.save_var_de] = this.unaes256encrypt(str, this.key)
                                break
                        }
                        break
                }
                break
            case "base":
                switch (this.op_base) {
                    case "os_message":
                        this.showMsg({
                            title: this.msg_title,
                            body: this.msg_content,
                        }, EventManager.guidMap[this.msg_onclik])
                        break
                        case "callcmd":
                        let arr = new String(this.cmd_string).toString().split(" ")
                        this.callCMD(arr)
                        break
                }
                break
                break
        }
    }
    createHash(str) {
        return crypto.createHash(new String(this.type).toString()).update(new String(str).toString()).digest(new String(this.digest).toString())
    }
    createHmac(str) {
        return crypto.createHmac(new String(this.type).toString(), new String(this.key).toString()).update(new String(str).toString()).digest(new String(this.digest).toString())
    }
    //aes128加密
    aes128encrypt(data, key) {
        let jm = crypto.createCipheriv('aes-128-cbc', key, "xuranxuranxuranx");
        let crypted = jm.update(data, 'utf-8', 'hex');
        crypted += jm.final('hex');
        return crypted;
    }
    //aes128解密
    unaes256encrypt(crypted, key) {
        let jm = crypto.createDecipheriv('aes-128-cbc', key, "xuranxuranxuranx");
        let decrypted = jm.update(crypted, 'hex', 'utf8');
        decrypted += jm.final('utf8');
        return decrypted;
    }
    showMsg(content, onclick) {
        let msg = new window.Notification(content.title, content);
        msg.onclick = function () {
            if (onclick) EventHandler.call(new EventHandler(onclick))
        }
    }
    callCMD(cmd_string){
        let zl = cmd_string[0]
        cmd_string.splice(0,1)
        cmd_string.splice(0,1)
        let result = spawn(zl,cmd_string);

        //输出正常情况下的控制台信息
        result.stdout.on("data", function (data) {
            console.log(iconvLite.decode(data, 'cp936'));
        });

        //输出报错信息
        result.stderr.on("data", function (data) {
            console.log("stderr:"+iconvLite.decode(data, 'cp936'));
        });

        result.on("exit", function (code) {
            console.log("child process exited with code :"+code);
        });
    }
    onStart() {
    }
}
