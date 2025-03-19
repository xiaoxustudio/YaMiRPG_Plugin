/*
@plugin 移动端-操作轮盘
@version 1.0
@author 徐然
@link https://space.bilibili.com/291565199
@desc 

受控一个元素使其成为操作轮盘

@element-id parentElem
@alias 操作背景定位元素
@desc 操作背景定位元素，仅用于定位，它应该包含一个操作杆

@element-id childElem
@alias 操作杆元素
@desc 操作杆元素，它的父级应该是一个定位元素

*/

/** 插件脚本 */
export default class Mobile_OperatingWheel
	implements Script<Mobile_OperatingWheel>
{
	maxRadius: number; // 最大半径
	isDragging: boolean;
	parentElem: string;
	childElem: string;
	active: boolean; // 是否激活
	player: GlobalActor | null;
	classInstance: any;

	constructor() {
		this.parentElem = "";
		this.childElem = "";
		this.maxRadius = 0;
		this.isDragging = false;
		this.active = false;
		this.player = null;
		const change = (b: boolean = !this.active) => {
			this.active = b;
		};
		this.classInstance = new (class LocalSpace {
			onStart() {
				change();
			}
			onDestroy() {
				change();
			}
		})();

		Scene.on("load", () => {
			this.player = Party.player;
			const elem = this.getElem()!;
			const childElem = this.getChildElem()!;
			elem.script.add(this.classInstance);
			if (elem && childElem)
				this.maxRadius =
					elem.transform.width / 2 - childElem.transform.width / 2;
		});

		Input.on("touchstart", this.handleTouchStart, true);
		Input.on("touchend", this.handleTouchEnd, true);
		Input.on("touchmove", this.handleTouchMove, true);
	}
	getElem() {
		const target = UI.get(this.parentElem);
		return target;
	}
	getChildElem() {
		const target = UI.get(this.childElem);
		return target;
	}
	/**
	 * 判断点是否在矩形内（支持多种参数形式）
	 * @param point 点的坐标，支持格式：
	 *              { x: number, y: number } 或 [x, y]
	 * @param rect 矩形的定义，支持格式：
	 *              { x: number, y: number, width: number, height: number }
	 *              或 [x, y, width, height]
	 * @param useScreenCoordinates 是否使用屏幕坐标系（y轴向下），默认true
	 * @returns boolean
	 */
	isPointInRect(
		point: { x: number; y: number } | [number, number],
		rect:
			| { x: number; y: number; width: number; height: number }
			| [number, number, number, number],
		useScreenCoordinates: boolean = true
	): boolean {
		// 参数标准化
		const [px, py] = Array.isArray(point) ? point : [point.x, point.y];
		const [rx, ry, rw, rh] = Array.isArray(rect)
			? rect
			: [rect.x, rect.y, rect.width, rect.height];

		// 计算矩形边界
		const left = rx;
		const right = rx + rw;
		const top = useScreenCoordinates ? ry : ry - rh; // 处理坐标系差异
		const bottom = useScreenCoordinates ? ry + rh : ry;

		// 判断坐标关系
		return (
			px >= left &&
			px <= right &&
			(useScreenCoordinates
				? py >= top && py <= bottom // y轴向下
				: py <= top && py >= bottom)
		); // y轴向上
	}

	/**
	 * @description: 获取操作杆中心坐标
	 * @return {*}
	 */
	getCenterPosition() {
		const target = this.getElem();
		const child = this.getChildElem();
		if (target && child) {
			const rect = target.transform;
			const rect1 = child.transform;
			return {
				x: rect.anchorX + rect.x + rect.width / 2 + rect1.width / 6,
				y: rect.anchorY + rect.y + rect.height / 2 + rect1.height / 6,
			};
		}
		return {
			x: 0,
			y: 0,
		};
	}
	handleTouchStart = (e: TouchEventInit) => {
		if (this.isDragging) return;
		const target = this.getElem();
		const touches = e.touches;
		if (target && this.active && touches) {
			for (const touch of touches) {
				if (
					this.isPointInRect(
						{ x: touch.screenX, y: touch.screenY },
						{ ...target.transform }
					)
				) {
					this.isDragging = true;
					return;
				}
			}
		}
	};
	handleTouchEnd = (e: ScriptTouchEvent) => {
		const changed = e.changedTouches;
		const target = this.getElem();
		if (!target || !changed || !this.active) return;
		for (const touch of changed) {
			if (
				this.isPointInRect(
					{ x: touch.screenX, y: touch.screenY },
					{ ...target.transform }
				)
			) {
				this.isDragging = false;
				const child = this.getChildElem();
				if (child && child.parent)
					child.move({
						x: child.parent.transform.width / 2 - child.transform.width / 2,
						y: child.parent.transform.height / 2 - child.transform.height / 2,
					});
				this.player?.navigator.stopMoving();
				break;
			}
		}
	};
	handleTouchMove = (e: TouchEventInit) => {
		const touches = e.touches;
		const elem = this.getElem();
		const child = this.getChildElem();

		if (!this.isDragging || !touches || !this.active || !child || !elem) return;

		// 获取点击坐标
		const clientX = touches[0].screenX;
		const clientY = touches[0].screenY;

		// 计算偏移量
		const center = this.getCenterPosition();
		let deltaX = clientX - center.x;
		let deltaY = clientY - center.y;

		// // 限制移动范围
		const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
		if (distance > this.maxRadius) {
			deltaX = (deltaX / distance) * this.maxRadius;
			deltaY = (deltaY / distance) * this.maxRadius;
		}

		if (child)
			child.move({
				x: deltaX + this.maxRadius,
				y: deltaY + this.maxRadius,
			});

		this.player?.navigator.moveTowardAngle(Math.atan2(deltaY, deltaX));
	};
	removeInit() {
		this.getElem()?.script.remove(this.classInstance);
	}
	onDestroy(): void {
		this.removeInit();
	}
	onScriptRemove(): void {
		this.removeInit();
	}
}
