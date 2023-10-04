/*
 * @Author: xuranXYS
 * @LastEditTime: 2023-10-04 12:54:54
 * @GitHub: www.github.com/xiaoxustudio
 * @WebSite: www.xiaoxustudio.top
 * @Description: By xuranXYS
 */
/*
@plugin 随机生成
@version 1.0
@author 徐然
@link https://space.bilibili.com/291565199
@desc 
内置一些生成随机功能

生成48位（12字符串）
生成96位（24字符串）
生成n位数字字母混合字符串
生成n位数字字符串

@option op {"generate48","generate96","generateMixed","randomNum"}
@alias 操作 {生成48位（12字符串）,生成96位（24字符串）,生成n位数字字母混合字符串,生成n位数字字符串}

@number n_bit
@alias 位
@cond op {"generateMixed","randomNum"}


@boolean sub_alpha
@alias 加入小写字母
@default false
@cond op {"generateMixed"}

@string save_var
@alias 存储变量


*/

function Random() {
  const array = new Uint32Array(1),
    maxUint = 0xffffffff   //maxUint为最大的可能值
  const randomNum = crypto.getRandomValues(array)[0] / maxUint
  return randomNum
}

/**
 * @description: 生成48位（12字符串）
 * @return {*}
 */
function generate48() {
  const n = Random() * 0x1000000000000
  const s = Math.floor(n).toString(16)
  return s.length === 12 ? s : s.padStart(8, '0')
}

/**
 * @description: 生成96位（24字符串）
 * @return {*}
 */
function generate96() {
  let id
  // GUID通常用作哈希表的键
  // 避免纯数字的键(会降低访问速度)
  do { id = generate48() + generate48() }
  while (!/[a-f]/.test(id))
  return id
}
/**
 * @description: 生成n位数字字母混合字符串
 * @param {*} n 范围
 * @return {*}
 */
function generateMixed(n, sub_alpha = false) {
  let chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
  let chars1 = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
    'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
  let res = ""
  for (let i = 0; i < n; i++) {
    let id = Math.floor(Math.random() * (sub_alpha ? chars1.length : chars.length))
    res += sub_alpha ? chars1[id] : chars[id]
  }
  return res
}
/**
 * @description: 生成n位数字字符串
 * @param {*} n 范围
 * @return {*}
 */
function randomNum(n) {
  let res = ""
  for (let i = 0; i < n; i++) {
    res += Math.floor(Math.random() * 10)
  }
  return res
}

export default class generate_random_xr {
  call() {
    switch (this.op) {
      case "generate48":
        Event.attributes[this.save_var] = generate48()
        break
      case "generate96":
        Event.attributes[this.save_var] = generate96()
        break
      case "generateMixed":
        Event.attributes[this.save_var] = generateMixed(this.n_bit,this.sub_alpha)
        break
      case "randomNum":
        Event.attributes[this.save_var] = randomNum(this.n_bit)
        break
    }
  }
}