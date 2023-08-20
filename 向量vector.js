/*
 * @Author: xuranXYS
 * @LastEditTime: 2023-08-19 23:06:59
 * @GitHub: www.github.com/xiaoxustudio
 * @WebSite: www.xiaoxustudio.top
 * @Description: By xuranXYS
 */
/*
@plugin 向量vector
@version 1.0
@author 徐然
@link https://space.bilibili.com/291565199
@desc 

*/



class Vector2 {
  /**
   * @description: 创建vector
   * @param {Number} x
   * @param {Number} y
   * @return {*}
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * @description: 设置向量的坐标值为给定的x和y。
   * @param {*} x
   * @param {*} y
   * @return {*}
   */
  set(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * @description: 设置向量的坐标值为给定的x和y。
   * @param {*} vector
   * @return {*}
   */
  add(vector) {
    this.x += vector.x;
    this.y += vector.y;
  }

  /**
   * @description: 从当前向量中减去给定的向量。
   * @param {*} vector
   * @return {*}
   */
  subtract(vector) {
    this.x -= vector.x;
    this.y -= vector.y;
  }

  /**
   * @description: 将当前向量乘以给定的标量。
   * @param {*} scalar
   * @return {*}
   */
  multiply(scalar) {
    this.x *= scalar;
    this.y *= scalar;
  }

  /**
   * @description: 将当前向量除以给定的标量。
   * @param {*} scalar
   * @return {*}
   */
  divide(scalar) {
    this.x /= scalar;
    this.y /= scalar;
  }

  /**
   * @description: 计算当前向量的长度（模）并返回。
   * @return {*}
   */
  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * @description: 将当前向量归一化，即将其长度缩放为1。
   * @return {*}
   */
  normalize() {
    const magnitude = this.magnitude();
    this.divide(magnitude);
  }
  // ————————————————————————————
  // 静态方法：不用创建实例就可使用
  //——————————————————————————————
  /**
   * @description: 将两个向量相加并返回结果向量。
   * @param {*} vector1
   * @param {*} vector2
   * @return {*}
   */
  static add(vector1, vector2) {
    return new Vector2(vector1.x + vector2.x, vector1.y + vector2.y);
  }

  /**
   * @description: 从第一个向量中减去第二个向量并返回结果向量。
   * @param {*} vector1
   * @param {*} vector2
   * @return {*}
   */
  static subtract(vector1, vector2) {
    return new Vector2(vector1.x - vector2.x, vector1.y - vector2.y);
  }

  /**
   * @description: 将给定的向量乘以给定的标量并返回结果向量。
   * @param {*} vector
   * @param {*} scalar
   * @return {*}
   */
  static multiply(vector, scalar) {
    return new Vector2(vector.x * scalar, vector.y * scalar);
  }

  /**
   * @description: 将给定的向量除以给定的标量并返回结果向量。
   * @param {*} vector
   * @param {*} scalar
   * @return {*}
   */
  static divide(vector, scalar) {
    return new Vector2(vector.x / scalar, vector.y / scalar);
  }
  /**
   * @description: 模拟游戏中对象的移动和滑动
   * @param {*} position 当前对象的位置向量
   * @param {*} velocity 当前对象的速度向量
   * @param {*} gravity 重力向量（表示重力对对象的影响）
   * @param {*} delta_time 每帧的时间间隔，用于计算运动的增量
    * @return {*} 包含新的位置向量和速度向量的对象
    */
  static move_and_slide(position, velocity, gravity, delta_time) {
    const new_velocity = this.add(velocity, this.multiply(gravity, delta_time));
    const new_position = this.add(position, this.multiply(new_velocity, delta_time));
    if (new_position.y <= 0) {
      new_position.y = 0;
      new_velocity.y = 0;
    }
  
    return { position: new_position, velocity: new_velocity };
  }
}
