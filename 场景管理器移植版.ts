/*
@plugin #plugin
@version 1.1.4
@author ZHAN
@link
@desc #desc

@option mode {0,2,3,1}
@alias #mode {#mode0,#mode2,#mode3,#mode1}
@desc #mode-desc

@file scene
@alias #scene
@filter scene
@cond mode {0,1,3}

@variable-getter sceneDataOut
@alias #sceneDataOut
@desc #sceneDataOut-desc
@cond mode {3}

@boolean isLoadData
@alias #isLoadData
@desc #desc_isLoadData
@cond mode {0}

@option transfer {1,0}
@alias #transfer {#transfer1,#transfer0}
@cond mode {0}

@position-getter pos
@alias #pos
@cond transfer {1}

@option transferMember {0,1,2}
@alias #transferMember {#transferMember0,#transferMember1,#transferMember2}
@cond transfer {1}

@boolean isSaveData
@alias #isSaveData
@desc #desc_isSaveData
@cond mode {0}

@lang zh
#plugin 场景管理器
#desc
（徐然移植版）

修复了加载场景时全局角色没有触发自动执行事件的问题

version 1.1.2
新增了转移队友选项
选择队伍时，只转移队伍中的角色
选择全体时，转移团队中所有的角色

可以通过设置角色属性，禁止转移团队中的某些角色

禁止转移属性
type 	boolean
key 	禁止转移（可自定义）
value 	dontTransfer

version 1.1.3
新增了不离开场景也能保存的选项
version 1.1.4
新增了输出保存的场景数据到变量的功能

#mode 操作
#mode0 加载场景
#mode2 保存场景(临时)
#mode1 清理数据(临时)
#mode3 输出场景数据
#mode-desc 注意，这里的保存或清理数据的操作只是临时的，在使用原生存档指令后才会真正写到存档文件里面

#scene 选择场景

#transfer 带上主角
#transfer0 否
#transfer1 是

#transferMember 带上队友
#transferMember0 无
#transferMember1 队伍
#transferMember2 全体

#pos 主角位置

#isLoadData 读取场景数据
#desc_isLoadData 勾选后，优先加载上次保存的场景数据
如果数据不存在，则重新加载新的场景

#isSaveData 离开前保存(临时)
#desc_isSaveData 勾选后，在离开这个场景之前
会先将场景的数据保存下来，注意，这里数据保存是临时的，只有使用原生存档指令时，这个数据才会真正写到存档文件里面

下次加载这个场景时，可以通过勾选 读取场景数据 加载保存的数据

#sceneDataOut 变量
#sceneDataOut-desc 将场景数据输出到这个变量


*/

export default class ScenerPlugin implements Script<Command> {
	static baseLoadData = Object.getPrototypeOf(Scene).loadData;
	static baseSaveData = Object.getPrototypeOf(Scene).saveData;
	static sceneDatas: Record<string, any> = {};
	transfer: string;
	isSaveData: boolean;
	isLoadData: boolean;
	transferMember: number;
	mode: number;
	pos?: { x: number; y: number };
	sceneDataOut?: VariableSetter;
	scene: any;
	getDatas() {
		return ScenerPlugin.sceneDatas;
	}

	constructor() {
		this.transfer = "";
		this.isSaveData = false;
		this.isLoadData = false;
		this.transferMember = 0;
		this.mode = 0;
		Object.getPrototypeOf(Scene).loadData = function (data: {
			sceneDatas?: {};
		}) {
			ScenerPlugin.sceneDatas = data.sceneDatas || {};
			return ScenerPlugin.baseLoadData.call(this, data);
		};

		Object.getPrototypeOf(Scene).saveData = function () {
			let data = ScenerPlugin.baseSaveData.call(this);
			data.sceneDatas = ScenerPlugin.sceneDatas;
			return data;
		};

		GlobalActor.prototype.callEvent = function (type) {
			const commands = this.events[type];
			if (commands) {
				this.updaters
					.filter(e => {
						return e.event_type == type;
					})
					.forEach(e => {
						e.finish();
					});

				const event = new EventHandler(commands);
				(event as any).event_type = type;
				event.triggerActor = this;
				event.selfVarId = this.selfVarId;
				return EventHandler.call(event, this.updaters);
			}
		};

		GlobalActor.prototype.autorun = function () {
			this.emit("autorun");
		};

		GlobalActor.prototype.transferToScene = function (x, y) {
			let scene = Scene.binding;
			if (!scene || this.destroyed) {
				return;
			}

			// 在转移非全局角色时需要借助这个函数来实现
			// 需要将它们排除掉
			if (this instanceof GlobalActor) {
				for (let i in ActorManager.idMap) {
					if (
						ActorManager.idMap[i] &&
						ActorManager.idMap[i].entityId == this.entityId
					) {
						for (let j in ScenerPlugin.sceneDatas) {
							let data = ScenerPlugin.sceneDatas[j].sceneData;
							let actors = data.actors;
							let count = actors.length;
							for (let k = count - 1; k >= 0; k--) {
								if (actors[k].globalId == i) {
									actors.splice(k, 1);
									break;
								}
							}
						}
						break;
					}
				}
			}

			if (this.parent == scene.actor) {
				//说明在这个场景里面，移动就行了
				this.target.reset();
				this.setPosition(x, y);
				this?.navigator?.stopMoving();
				(this as any).updateSceneActorData();
			} else {
				this.parent?.remove(this);
				this.target.reset();
				this.setPosition(x, y);
				this?.navigator?.stopMoving();
				(this as any).updateSceneActorData();
				scene.actor.append(this);
			}
		};

		//注册reset事件，退出时清理掉sceneDatas
		Game.on("reset", () => {
			ScenerPlugin.sceneDatas = {};
		});
	}

	loadCurrentSceneData(data: { sceneData: any; itemData: any }) {
		CurrentEvent.continue();
		const localScene = Scene as any;
		//填充场景数据
		const sceneData = Data.getScene(data.sceneData.id);
		let scene = new SceneContext({
			...sceneData,
			...data.sceneData,
			tileHeight: sceneData.tileHeight,
			tileWidth: sceneData.tileWidth,
		});
		scene.actor.loadData(data.sceneData.actors);
		scene.parallax.loadData(data.sceneData.parallaxes);
		scene.light.loadData(data.sceneData.lights);
		scene.emitter.loadData(data.sceneData.emitters);
		scene.region.loadData(data.sceneData.regions);
		scene.animation.loadData(data.sceneData.animations);
		localScene.bind(localScene.set(scene));
		return Scene.on("load", () => {
			//填充物品数据
			PluginManager?.DropItem?.loadData?.(data.itemData);
		});
	}

	saveCurrentSceneData() {
		let scene = Scene.binding;
		if (!scene) {
			return;
		}
		ScenerPlugin.sceneDatas[scene.id] = {
			sceneData: scene.saveData(),
			itemData: PluginManager?.DropItem?.saveData?.(),
		};
	}

	call() {
		const transfer = this.transfer;
		const isSave = this.isSaveData;
		const to = this.scene;
		const isLoad = this.isLoadData;
		const transferMember = this.transferMember;

		const isExist = Data.manifest.scenes.some(v => v.guid === to);

		if (!isExist && [0, 1].includes(this.mode)) {
			throw `场景资源不存在 ${to}`;
		}

		switch (this.mode) {
			case 0:
				//加载场景
				let teams: any[] | null = null;
				(async () => {
					CurrentEvent.pause()
					await void 0;
					let current = Scene.binding;

					if (current && transferMember) {
						let actors = current.actor;
						let count = actors.list.length;
						teams = [];

						for (let i = count - 1; i >= 0; i--) {
							let actor = actors.list[i];
							if (!actor.active || actor.destroyed) {
								continue;
							}

							if (Party.player && actor.teamId == Party.player.teamId) {
								if (!actor.isActive() || actor.attributes.dontTransfer || (!(actor instanceof GlobalActor) && transferMember == 1)) {
									continue;
								}

								actor.parent?.remove(actor);
								teams.push(actor);
							}
						}
					}

					if (isSave) this.saveCurrentSceneData();

					// 销毁当前场景上下文
					current?.destroy();

					if (isLoad) {
						//优先使用存档
						const data = ScenerPlugin.sceneDatas[to];
						//检查是否有存档
						if (data) return this.loadCurrentSceneData(data);
					}

					//不使用存档
					//使用默认的加载方式
					return Scene.load(to);
				})().then(() => {
					if (transfer) {
						let pos = this.pos || { x: 0, y: 0 };
						if (teams) {
							for (let i = 0; i < teams.length; i++) {
								GlobalActor.prototype.transferToScene.call(
									teams[i],
									pos.x + 0.5,
									pos.y + 0.5
								);
							}
						} else {
							Party.player?.transferToScene(pos.x + 0.5, pos.y + 0.5);
						}
					}
				});

				return;
			case 2:
				//保存场景
				this.saveCurrentSceneData();
				break;
			case 1:
				//清理场景数据
				delete ScenerPlugin.sceneDatas[to];
				return true;
			case 3:
				//输出场景数据
				this.sceneDataOut?.set?.(ScenerPlugin.sceneDatas[to]);
				return true;
		}
	}
}
