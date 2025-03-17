/* 
@plugin 移动端-多触点点击
@version 1.0
@author 徐然
@link https://space.bilibili.com/291565199
@desc 

当指定触点数量点击时，则触发指定行为

@number thresholdValue
@alias 触发阈值
@clamp 1 1000
@default 200
@desc 当双击时间小于该值时触发


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

export default class Mobile_DoubleTouchESC
	implements Script<Mobile_DoubleTouchESC>
{
	emitType: string;
	emitEvent: string;
	emitKeyCode: string;
	touchLength: number;
	thresholdValue: number;
	pressTime: number; // 按下事件
	constructor() {
		this.emitType = "";
		this.emitEvent = "";
		this.emitKeyCode = "";
		this.pressTime = 0;
		this.thresholdValue = 200;
		this.touchLength = 2;
		Input.on(
			"touchstart",
			(event: ScriptTouchEvent) => {
				const touchs = event.touches;
				if (touchs.length === this.touchLength) {
					this.pressTime = Date.now();
				}
			},
			true
		);
		Input.on(
			"touchend",
			() => {
				if (Date.now() - this.pressTime < this.thresholdValue) {
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
