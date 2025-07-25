/*
@plugin Excel操作
@version 1.1
@author 徐然
@link https://space.bilibili.com/291565199
@desc

Excel操作
默认是从1开始
deps module: exceljs
PS：读取Excel文件，转换为二维数组在主事件运行，其他操作都是在回调事件运行


@option operation {'read','write','to-array','get-row','get-column','get-cell','reserve-array'}
@alias 操作类型 { 读取Excel文件,写入Excel文件,转换为二维数组,获取行,获取列,获取行列值,回送数组}
@desc
读取Excel文件：读取Excel文件
写入Excel文件：写入Excel文件（只能在回调事件中运行）
转换为二维数组：将Excel文件转换为二维数组
获取行：获取Excel文件中指定行的数据
获取列：获取Excel文件中指定列的数据
获取行列值：获取Excel文件中指定行列的值
回送数组：将二维数组回送到指定Excel对象中（类似于commit操作），当你修改数据后，需要调用此操作才能将已修改数据提交到Excel对象中


@variable-setter getterData
@alias 操作对象
@cond operation {'to-array','get-row','get-column','reserve-array'}

@string filePath
@alias 文件路径
@desc 
路径操作符：
$ ：指向当前Assets文件夹
% ：指向当前工程项目文件夹
也可以使用GUID
@cond operation {'read','write'}

@string outputVariableString
@alias 输出变量
@cond operation {'read'}

@number sheetIndex
@alias 工作表索引
@default 1
@desc 第几个工作表，默认从1开始
@cond operation {'to-array'}


@boolean inhertEvent
@alias 继承
@default false
@desc 继承事件上下文
@cond operation {'to-array'}


@file commandFile
@alias 回调事件
@desc 
本地变量：@index-> 工作表索引、@result-> 转换过后的数据

@filter command
@cond operation {'to-array'}

@number Index
@alias 索引
@desc 默认从1开始（行）
@default 1
@cond operation { 'get-row','get-cell'}

@string IndexColumn
@alias 索引
@desc 默认从1开始（列），可使用字母A-Z（行）
@default 1
@cond operation {'get-column','get-cell'}

@boolean noEmpty
@alias 忽略空值
@default false
@cond operation {'get-row','get-column'}


@variable-setter outputVariableRow
@alias 输出变量
@cond operation {'get-row'}
@variable-setter outputVariableColumn
@alias 输出变量
@cond operation {'get-column'}
@variable-setter outputVariableCell
@alias 输出变量
@cond operation {'get-cell'}
*/

// @ts-ignore
const ExcelJSEx = ExcelJS as any;
if (!ExcelJSEx) {
	console.warn("未找到ExcelJS模块，请安装exceljs模块");
}
const fs = require("fs");

const ExcelOperations = new (class {
	// 创建新的工作簿
	createWorkbook() {
		return new ExcelJSEx.Workbook();
	}

	// 读取Excel文件
	async readExcel(filePath: string | Buffer) {
		const workbook = this.createWorkbook();
		await workbook.xlsx.load(filePath);
		return workbook;
	}

	// 保存Excel文件
	async saveExcel(workbook: any, filePath: string) {
		await workbook.xlsx.writeFile(filePath);
	}

	// 获取工作表
	getWorksheet(workbook: any, sheetIndex: number) {
		return workbook.getWorksheet(sheetIndex);
	}

	// 获取单元格值
	getCellValue(worksheet: any, row: number, col: number) {}

	// 设置单元格值
	setCellValue(worksheet: any, row: number, col: number, value: any) {
		worksheet.getCell(row, col).value = value;
	}
})();

export default class ExcelOperationsCommand implements Script<Command> {
	// 接口属性
	operation!:
		| "read"
		| "write"
		| "to-array"
		| "get-row"
		| "get-column"
		| "get-cell"
		| "reserve-array";
	filePath!: string;
	commandFile!: string;
	Index!: number;
	IndexColumn!: number | string;
	sheetIndex!: number;
	getterData?: VariableSetter;
	outputVariableRow?: VariableSetter;
	outputVariableColumn?: VariableSetter;
	outputVariableCell?: VariableSetter;
	outputVariableString!: string;
	noEmpty!: boolean;
	inhertEvent!: boolean;

	defers = Promise.resolve(); // 延迟执行

	// 获取指定行数据
	getRow(
		sheetData: string | any[],
		rowIndex: number,
		noEmpty: boolean = false
	) {
		if (rowIndex < 1 || rowIndex > sheetData.length) {
			throw new Error(`行索引超出范围 (1-${sheetData.length})`);
		}
		if (noEmpty) {
			return sheetData[rowIndex - 1].filter((cell: any) => cell !== null);
		}
		return [...sheetData[rowIndex - 1]];
	}

	// 获取指定列数据（支持列字母或1-based数字索引）
	getColumn(
		sheetData: any[],
		columnIdentifier: string | number,
		noEmpty: boolean = false
	) {
		let colIndex = 0;

		// 处理列字母标识（如 'A', 'B', 'AA'）
		if (typeof columnIdentifier === "string") {
			if (columnIdentifier.length > 1) {
				if (colIndex > 16384) {
					throw new Error("行索引超出范围");
				}
				for (let i = 0; i < columnIdentifier.length; i++) {
					colIndex = colIndex * 26 + (columnIdentifier.charCodeAt(i) - 64);
				}
			} else {
				colIndex = columnIdentifier.charCodeAt(0) - 64;
			}
		} else {
			colIndex = columnIdentifier;
		}
		if (typeof colIndex !== "number") {
			throw new Error("列标识必须是字符串(列字母)或数字(列索引)");
		}

		if (colIndex < 1) throw new Error("列索引不能小于1");

		if (noEmpty) {
			sheetData = sheetData.filter(
				(row: any[]) =>
					row[colIndex - 1] !== null && row[colIndex - 1] !== undefined
			);
		}

		return sheetData.map((row: string | any[]) => {
			// 检查行是否有足够的列
			return row.length >= colIndex ? row[colIndex - 1] : null;
		});
	}

	// 获取指定行列的值（支持列字母或1-based数字索引）
	getCell(sheetData: any[], rowIndex: string | number, colIndex: number) {
		let rowIndexNumber = 0;

		// 处理行字母标识（如 'A', 'B', 'AA'）
		if (typeof rowIndex === "string") {
			if (rowIndex.length > 1) {
				if (rowIndexNumber > 16384) {
					throw new Error("行索引超出范围");
				}
				for (let i = 0; i < rowIndex.length; i++) {
					rowIndexNumber = rowIndexNumber * 26 + (rowIndex.charCodeAt(i) - 64);
				}
			} else {
				rowIndexNumber = rowIndex.charCodeAt(0) - 64;
			}
		} else {
			rowIndexNumber = rowIndex;
		}
		return sheetData[colIndex - 1][rowIndexNumber - 1];
	}

	transformPath(text: string) {
		const trans_char = (__text = __dirname) => {
			let _path_local = __text.replace(/\\/, "/");
			while (/\\/.test(_path_local)) {
				_path_local = _path_local.replace(/\\/, "/");
			}
			return _path_local;
		};
		if (text.startsWith("$")) {
			text = text.slice(1, text.length);
			return trans_char(Loader.route("Assets")) + "/" + text;
		} else if (text.startsWith("%")) {
			text = text.slice(1, text.length);
			return trans_char(Loader.route("")) + "/" + text;
		}
		if (/[a-f0-9]{16}/i.test(text) && Loader.getPathByGUID(text).length > 0) {
			return trans_char(__dirname) + "/" + Loader.getPathByGUID(text);
		} else {
			return text;
		}
	}

	call() {
		switch (this.operation) {
			case "read": {
				try {
					const buffer = fs.readFileSync(this.transformPath(this.filePath));
					const data = ExcelOperations.readExcel(buffer);
					// 将读取到的Excel数据存储到变量中
					Attribute.OBJECT_SET(
						CurrentEvent.attributes,
						this.outputVariableString,
						data
					);
				} catch (error) {
					console.warn("读取Excel文件失败", error);
				}
				break;
			}
			case "to-array": {
				try {
					const sheet = this.getterData?.get() as any;
					if (!sheet) return;
					sheet.then((r: any) => {
						// 初始化二维数组
						const data: any = [];
						const worksheet = r.getWorksheet(this.sheetIndex);
						// 遍历工作表的每一行
						worksheet.eachRow(
							{ includeEmpty: true },
							(row: {
								eachCell: (
									arg0: { includeEmpty: boolean },
									arg1: (cell: any, colNumber: any) => void
								) => void;
							}) => {
								const rowData: any[] = [];
								// 遍历当前行的每个单元格
								row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
									// 获取单元格值（空单元格为 null）
									rowData.push(cell.value === undefined ? null : cell.value);
								});

								data.push(rowData);
							}
						);
						const commands = EventManager.guidMap[this.commandFile];
						if (commands) {
							const e = new EventHandler(commands);
							if (this.inhertEvent) e.inheritEventContext(CurrentEvent);
							Object.defineProperty(e, "excelTarget", {
								value: sheet,
								enumerable: true,
							});
							Attribute.SET(e.attributes, "@index", this.sheetIndex);
							Attribute.OBJECT_SET(e.attributes, "@result", data);
							EventHandler.call(e);
						}
						return r;
					});
				} catch (error) {
					console.warn("转换Excel文件失败", error);
				}
				break;
			}
			case "write": {
				const workbook = (CurrentEvent as any).excelTarget;
				if (!workbook) {
					console.warn("请在回调事件中保存工作表，否则无法写入Excel文件")
					return;
				}
				const p = this.filePath;
				this.defers.then(() => {
					try {
						workbook.then((workbook: any) => {
							// 保存到文件
							const finalPath = this.transformPath(p);
							const worksheet = workbook.getWorksheet(
								CurrentEvent.attributes["@index"]
							);
							const data: any[][] = [];
							// 遍历工作表的每一行
							worksheet.eachRow(
								{ includeEmpty: true },
								(row: {
									eachCell: (
										arg0: { includeEmpty: boolean },
										arg1: (cell: any, colNumber: any) => void
									) => void;
								}) => {
									const rowData: any[] = [];
									// 遍历当前行的每个单元格
									row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
										// 获取单元格值（空单元格为 null）
										rowData.push(cell.value === undefined ? null : cell.value);
									});

									data.push(rowData);
								}
							);
							workbook.xlsx.writeBuffer(finalPath).then((bf: any) => {
								fs.writeFileSync(finalPath, bf);
							});
							return workbook;
						});
					} catch (error) {
						console.error("写入Excel文件失败:", error);
					}
				});
				break;
			}
			case "get-row": {
				const data = this.getterData?.get() as any;
				if (!data) return;
				this.outputVariableRow?.set(
					this.getRow(data, this.Index, this.noEmpty)
				);
				break;
			}
			case "get-column": {
				const data = this.getterData?.get() as any;
				if (!data) return;
				this.outputVariableColumn?.set(
					this.getColumn(
						data,
						Number.isNaN(parseFloat(this.IndexColumn as string))
							? this.IndexColumn
							: parseFloat(this.IndexColumn as string),
						this.noEmpty
					)
				);
				break;
			}
			case "get-cell": {
				const data = this.getterData?.get() as any;
				if (!data) return;
				this.outputVariableCell?.set(
					this.getCell(
						data,
						Number.isNaN(parseFloat(this.IndexColumn as string))
							? this.IndexColumn
							: parseFloat(this.IndexColumn as string),
						this.Index
					)
				);
				break;
			}
			case "reserve-array": {
				const data = this.getterData?.get() as any[][];
				if (!data) return;
				const target = (CurrentEvent as any).excelTarget;
				this.defers.then(() => {
					target.then((r: any) => {
						const worksheet = r.getWorksheet(CurrentEvent.attributes["@index"]);
						// 清空现有工作表
						worksheet.spliceRows(0, worksheet.rowCount);
						// 将二维数组写入工作表
						data.forEach((rowData, rowIdx) => {
							const row = worksheet.getRow(rowIdx + 1);
							rowData.forEach((cellValue, colIdx) => {
								row.getCell(colIdx + 1).value = cellValue;
							});
							row.commit();
						});
						return r;
					});
				});
				break;
			}
		}
	}
}
