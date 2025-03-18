/* 
@plugin 移动端-多触点点击
@version 1.1
@author 徐然
@link https://space.bilibili.com/291565199
@desc 

当指定触点数量点击时，则触发指定行为

@number thresholdValue
@alias 触发阈值时间
@clamp 1 1000
@default 200
@desc 当双击时间小于该值时触发

@number thresholdDist
@alias 触发阈值距离
@clamp 1 1000
@default 300
@desc 当各触点点位之间的距离总和小于该值时触发

@number touchLength
@alias 触点数
@clamp 1 10
@default 2

@option emitType {'按键','事件'}
@alias 触发类型
@desc 当触点成立时触发

@keycode emitKeyCode
@alias 被触发按键
@default 'Escape'
@cond emitType {'按键'}

@file emitEvent
@filter event
@alias 被触发事件
@cond emitType {'事件'}

*/

export default class Mobile_MultiTouchClick
	implements Script<Mobile_MultiTouchClick>
{
	emitType: string;
	emitEvent: string;
	emitKeyCode: string;
	touchLength: number;
	thresholdValue: number;
	thresholdDist: number;
	pressTime: number; // 按下事件
	active: boolean; // 是否激活

	/**
	 * @description: 检测距离是否成立
	 * @param {TouchList} touches
	 * @return {*}
	 */
	checkAllDistances(touches: TouchPoint[]) {
		for (let i = 1; i < touches.length; i++) {
			const prev = touches[i - 1];
			const curr = touches[i];
			const dx = curr.screenX - prev.screenX;
			const dy = curr.screenY - prev.screenY;
			if (dx * dx + dy * dy >= Math.pow(this.thresholdDist, 2)) {
				return false;
			}
		}
		return true;
	}
	constructor() {
		this.emitType = "";
		this.emitEvent = "";
		this.emitKeyCode = "";
		this.pressTime = 0;
		this.thresholdValue = 200;
		this.thresholdDist = 100;
		this.touchLength = 2;
		this.active = false;
		Input.on(
			"touchstart",
			(event: ScriptTouchEvent) => {
				const touchs = event.touches;
				if (
					touchs.length === this.touchLength &&
					this.checkAllDistances(touchs)
				) {
					this.pressTime = Date.now();
					this.active = true;
					return;
				}
				this.active = false;
			},
			true
		);
		Input.on(
			"touchend",
			() => {
				if (this.active && Date.now() - this.pressTime < this.thresholdValue) {
					switch (this.emitType) {
						case "按键":
							Input.simulateKey("keydown", this.emitKeyCode);
							Input.simulateKey("keyup", this.emitKeyCode);
							break;
						case "事件":
							EventManager.call(this.emitEvent);
							break;
					}
				}
				this.pressTime = 0;
			},
			true
		);
	}
}
