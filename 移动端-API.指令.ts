/* 
@plugin 移动端-安卓API
@version 1.0
@author 徐然
@link https://space.bilibili.com/291565199
@desc 

本指令包括一些常用安卓API、TapTap继承

注意：本指令仅适用于徐然安卓壳，在其他壳下无法正常运行。

@option emitCommand {"退出APP","弹出提示","弹出通知栏消息","TapTap集成"}
@alias API
@desc 调用API

@string titleString
@alias 标题
@cond emitCommand {"弹出通知栏消息"}

@string contentString
@alias 内容
@cond emitCommand {"弹出提示","弹出通知栏消息"}


@option emitCommandTapTap {"初始化","调用登录","调用更新","初始化成就","解锁成就"}
@alias TapTap操作
@cond emitCommand {"TapTap集成"}

@string TapTap_clientId
@alias Client ID
@desc 游戏 Client ID
@cond emitCommandTapTap {"初始化"}

@string TapTap_clientToken
@alias Client Token
@desc 游戏 Client Token
@cond emitCommandTapTap {"初始化"}

@option TapTap_region {0,1}
@alias 区域 {CN, GLOBAL}
@desc 游戏可玩区域: [CN]=国内 [GLOBAL]=海外
@cond emitCommandTapTap {"初始化"}

@string TapTap_channel
@alias 分包渠道名称
@desc 分包渠道即为上报数据时其中的 channel 字段信息，方便大家对数据进行拆分。
@cond emitCommandTapTap {"初始化"}

@string TapTap_gameVersion
@alias 游戏版本号
@default "1.0"
@cond emitCommandTapTap {"初始化"}

@boolean TapTap_autoIAPEventEnabled
@alias 上报 GooglePlay
@default false
@desc 是否自动上报 GooglePlay 内购支付成功事件 仅 [TapTapRegion.GLOBAL] 生效
@cond emitCommandTapTap {"初始化"}

@boolean TapTap_overrideBuiltInParameters
@alias 覆盖内置字段
@default false
@desc 自定义字段是否能覆盖内置字段
@cond emitCommandTapTap {"初始化"}

@string TapTap_oaidCert
@alias OAID 证书
@desc 用于上报 OAID 仅 [Region.CN] 生效
@cond emitCommandTapTap {"初始化"}

@boolean TapTap_enableLog
@alias 开启 log
@default false
@desc 建议 Debug 开启，Release 关闭，默认关闭 log
@cond emitCommandTapTap {"初始化"}



@file TapTapLogin_success
@filter event
@alias 成功登录事件
@desc 
回调本地变量：accessToken、avatar、email、name、openId、unionId
@cond emitCommandTapTap {'调用登录'}

@file TapTapLogin_failure
@filter event
@alias 失败登录事件
@cond emitCommandTapTap {'调用登录'}

@file TapTapLogin_cancel
@filter event
@alias 取消登录事件
@cond emitCommandTapTap {'调用登录'}


@file TapTapUpdate_cancel
@filter event
@alias 取消更新事件
@desc 已上架的游戏，需确保更新资料版本中的 APK 包名和已上架的 APK 包名保持一致
@cond emitCommandTapTap {'调用更新'}

@file TapTapAchievement_success
@filter event
@alias 成就状态更新成功
@desc
回调本地变量：code、achievementId、achievementName、achievementType、currentSteps
@cond emitCommandTapTap {'初始化成就'}

@file TapTapAchievement_failure
@filter event
@alias 成就状态更新失败
@desc
回调本地变量：code、achievementId、currentSteps、errorMessage
@cond emitCommandTapTap {'初始化成就'}


@string TapTapAchievementUnlock_id
@alias 成就ID
@desc achievementId
@cond emitCommandTapTap {'解锁成就'}

@boolean TapTapAchievementUnlock_isStep
@alias 分步
@default false
@desc 如果此成就是分步成就，请开启此选项，并填写下面的分步值
@cond emitCommandTapTap {"解锁成就"}

@number TapTapAchievementUnlock_stepValue
@alias 分步值
@desc 分步开启时有效
@cond emitCommandTapTap {"解锁成就"}

*/

declare global {
	interface Window {
		JSApi?: {
			/**
			 * @description: 退出App
			 * @return {*}
			 */
			exitApp: () => void;
			/**
			 * @description: 弹出提示信息Toast
			 * @return {*}
			 */
			toast: (content: string) => void;
			/**
			 * @description: 弹出通知栏消息
			 * @return {*}
			 */
			notifyApp: (title: string, content: string) => void;
			/**
			 * @description: 初始化TapTap
			 * @return {*}
			 */
			initTapTap: (config: string) => void;

			/**
			 * @description: 登录TapTap
			 * @return {*}
			 */
			loginTapTap: (sid: string, fid: string, cid: string) => void;
			/**
			 * @description: 调用更新TapTap
			 * @return {*}
			 */
			updateTapTap: (cid: string) => void;
			/**
			 * @description: TapTap成就初始化
			 * @return {*}
			 */
			achievementInitTapTap: (sid: string, fid: string) => void;
			/**
			 * @description: TapTap解锁成就
			 * @return {*}
			 */
			achievementUnlockTapTap: (id: string, step: number) => void;
		};
	}
}

/** 自定义指令脚本 */
export default class Mobile_AndroidApi implements Script<Command> {
	EventFileCallBack: any;
	titleString: string;
	contentString: string;
	emitCommand: string;
	emitCommandTapTap: string;
	TapTap_clientId: string;
	TapTap_clientToken: string;
	TapTap_region: number;
	TapTap_channel: string;
	TapTap_gameVersion: string;
	TapTap_autoIAPEventEnabled: boolean;
	TapTap_overrideBuiltInParameters: boolean;
	TapTap_oaidCert: string;
	TapTap_enableLog: boolean;

	TapTapLogin_success: string;
	TapTapLogin_failure: string;
	TapTapLogin_cancel: string;

	TapTapUpdate_cancel: string;

	TapTapAchievement_success: string;
	TapTapAchievement_failure: string;

	TapTapAchievementUnlock_id: string;
	TapTapAchievementUnlock_isStep: boolean;
	TapTapAchievementUnlock_stepValue: number;
	constructor() {
		this.titleString = "";
		this.contentString = "";
		this.emitCommand = "";
		this.emitCommandTapTap = "";
		this.EventFileCallBack = null;
		this.TapTap_clientId = "";
		this.TapTap_clientToken = "";
		this.TapTap_region = 0;
		this.TapTap_channel = "";
		this.TapTap_gameVersion = "";
		this.TapTap_autoIAPEventEnabled = false;
		this.TapTap_overrideBuiltInParameters = false;
		this.TapTap_oaidCert = "";
		this.TapTap_enableLog = false;
		this.TapTapLogin_success = "";
		this.TapTapLogin_failure = "";
		this.TapTapLogin_cancel = "";
		this.TapTapUpdate_cancel = "";
		this.TapTapAchievement_success = "";
		this.TapTapAchievement_failure = "";
		this.TapTapAchievementUnlock_id = "";
		this.TapTapAchievementUnlock_isStep = false;
		this.TapTapAchievementUnlock_stepValue = 0;
	}
	checkEnv() {
		if (!window.JSApi) {
			console.warn("当前环境不是徐然安卓壳，无法执行！");
			return false;
		}
		return true;
	}
	call(): void {
		switch (this.emitCommand) {
			case "退出APP":
				if (this.checkEnv()) window.JSApi?.exitApp();
				break;
			case "弹出提示":
				if (this.checkEnv()) window.JSApi?.toast(this.contentString);
				break;
			case "弹出通知栏消息":
				if (this.checkEnv())
					window.JSApi?.notifyApp(this.titleString, this.contentString);
				break;
			case "TapTap集成":
				if (!this.checkEnv()) return;
				{
					switch (this.emitCommandTapTap) {
						case "初始化":
							const config = {
								clientId: this.TapTap_clientId,
								clientToken: this.TapTap_clientToken,
								region: this.TapTap_region,
								channel: this.TapTap_channel,
								gameVersion: this.TapTap_gameVersion,
								autoIAPEventEnabled: this.TapTap_autoIAPEventEnabled,
								overrideBuiltInParameters:
									this.TapTap_overrideBuiltInParameters,
								oaidCert: this.TapTap_oaidCert,
								enableLog: this.TapTap_enableLog,
							};
							window.JSApi?.initTapTap(JSON.stringify(config));
							break;
						case "调用登录":
							if (this.checkEnv())
								window.JSApi?.loginTapTap(
									this.TapTapLogin_success,
									this.TapTapLogin_failure,
									this.TapTapLogin_cancel
								);
							break;
						case "调用更新":
							if (this.checkEnv())
								window.JSApi?.updateTapTap(this.TapTapUpdate_cancel);
							break;
						case "初始化成就":
							if (this.checkEnv())
								window.JSApi?.achievementInitTapTap(
									this.TapTapAchievement_success,
									this.TapTapAchievement_failure
								);
							break;
						case "解锁成就":
							if (this.checkEnv())
								window.JSApi?.achievementUnlockTapTap(
									this.TapTapAchievementUnlock_id,
									this.TapTapAchievementUnlock_isStep
										? this.TapTapAchievementUnlock_stepValue
										: -1
								);
							break;
					}
				}
				break;
		}
	}
}
