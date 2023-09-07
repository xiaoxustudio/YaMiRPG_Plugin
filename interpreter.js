"use strict";
/*
 * @Author: xuranXYS
 * @LastEditTime: 2023-09-06 11:15:51
 * @GitHub: www.github.com/xiaoxustudio
 * @WebSite: www.xiaoxustudio.top
 * @Description: By xuranXYS
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Environment = exports.setupGlobalScope = exports.evaluate = exports.MK_BREAK = exports.MK_FUNC = exports.MK_STRING = exports.MK_BOOL = exports.MK_NUMBER = exports.MK_NULL = exports.Parser = exports.tokenize = exports.TokenType = void 0;
/*
————————————————————————————
Lexer词法分析
主要实现：
分词，类型判断，组合Token
————————————————————————————
*/
var TokenType;
(function (TokenType) {
    TokenType[TokenType["Number"] = 0] = "Number";
    TokenType[TokenType["Identifier"] = 1] = "Identifier";
    TokenType[TokenType["Equals"] = 2] = "Equals";
    TokenType[TokenType["OP"] = 3] = "OP";
    TokenType[TokenType["CP"] = 4] = "CP";
    TokenType[TokenType["BinaryOperator"] = 5] = "BinaryOperator";
    TokenType[TokenType["def"] = 6] = "def";
    TokenType[TokenType["deff"] = 7] = "deff";
    TokenType[TokenType["const"] = 8] = "const";
    TokenType[TokenType["Fn"] = 9] = "Fn";
    TokenType[TokenType["IF"] = 10] = "IF";
    TokenType[TokenType["ELSE"] = 11] = "ELSE";
    TokenType[TokenType["And"] = 12] = "And";
    TokenType[TokenType["Or"] = 13] = "Or";
    TokenType[TokenType["While"] = 14] = "While";
    TokenType[TokenType["For"] = 15] = "For";
    TokenType[TokenType["break"] = 16] = "break";
    TokenType[TokenType["Qout"] = 17] = "Qout";
    TokenType[TokenType["String"] = 18] = "String";
    TokenType[TokenType["S_Qout"] = 19] = "S_Qout";
    TokenType[TokenType["Dot"] = 20] = "Dot";
    TokenType[TokenType["Simecolon"] = 21] = "Simecolon";
    TokenType[TokenType["Comma"] = 22] = "Comma";
    TokenType[TokenType["Colon"] = 23] = "Colon";
    TokenType[TokenType["OpenBrace"] = 24] = "OpenBrace";
    TokenType[TokenType["CloseBrace"] = 25] = "CloseBrace";
    TokenType[TokenType["OpenBracket"] = 26] = "OpenBracket";
    TokenType[TokenType["CloseBracket"] = 27] = "CloseBracket";
    TokenType[TokenType["Less_Than"] = 28] = "Less_Than";
    TokenType[TokenType["More_Than"] = 29] = "More_Than";
    TokenType[TokenType["Exclam_Mark"] = 30] = "Exclam_Mark";
    TokenType[TokenType["EOF"] = 31] = "EOF";
})(TokenType || (exports.TokenType = TokenType = {}));
const KEYWORDS = {
    def: TokenType.def,
    deff: TokenType.deff,
    const: TokenType.const,
    fn: TokenType.Fn,
    if: TokenType.IF,
    else: TokenType.ELSE,
    and: TokenType.And,
    or: TokenType.Or,
    while: TokenType.While,
    for: TokenType.For,
    break: TokenType.break,
};
function token(value = "", type) {
    return { value, type };
}
function isAlpha(str) {
    return str.toUpperCase() != str.toLowerCase();
}
function isInt(str) {
    const o = str.charCodeAt(0);
    const bounds = ["0".charCodeAt(0), "9".charCodeAt(0)];
    return (o >= bounds[0] && o <= bounds[1]);
}
let is_string = false;
let string_ident = "";
function isString(str) {
    return is_string ? true : false;
}
function isSkip(str) {
    return str == " " || str == "\t" || str == "\n" || str == "\r";
}
function tokenize(src) {
    const tokens = new Array();
    let ori_str = src.split("");
    while (ori_str.length > 0) {
        if (ori_str[0] == "(") {
            tokens.push(token(ori_str.shift(), TokenType.OP));
        }
        else if (ori_str[0] == ")") {
            tokens.push(token(ori_str.shift(), TokenType.CP));
        }
        else if (ori_str[0] == "{") {
            tokens.push(token(ori_str.shift(), TokenType.OpenBrace));
        }
        else if (ori_str[0] == "}") {
            tokens.push(token(ori_str.shift(), TokenType.CloseBrace));
        }
        else if (ori_str[0] == "[") {
            tokens.push(token(ori_str.shift(), TokenType.OpenBracket));
        }
        else if (ori_str[0] == "]") {
            tokens.push(token(ori_str.shift(), TokenType.CloseBracket));
        }
        else if (ori_str[0] == "+" || ori_str[0] == "-" || ori_str[0] == "*" || ori_str[0] == "/" || ori_str[0] == "%") {
            tokens.push(token(ori_str.shift(), TokenType.BinaryOperator));
        }
        else if (ori_str[0] == "=") {
            tokens.push(token(ori_str.shift(), TokenType.Equals));
        }
        else if (ori_str[0] == ";") {
            tokens.push(token(ori_str.shift(), TokenType.Simecolon));
        }
        else if (ori_str[0] == ":") {
            tokens.push(token(ori_str.shift(), TokenType.Colon));
        }
        else if (ori_str[0] == ",") {
            tokens.push(token(ori_str.shift(), TokenType.Comma));
        }
        else if (ori_str[0] == ".") {
            tokens.push(token(ori_str.shift(), TokenType.Dot));
        }
        else if (ori_str[0] == ">") {
            tokens.push(token(ori_str.shift(), TokenType.More_Than));
        }
        else if (ori_str[0] == "<") {
            tokens.push(token(ori_str.shift(), TokenType.Less_Than));
        }
        else if (ori_str[0] == "!") {
            tokens.push(token(ori_str.shift(), TokenType.Exclam_Mark));
        }
        else if (ori_str[0] == "\"") {
            // 是否进入字符串模式
            if (!is_string && !isSkip(ori_str[0])) {
                is_string = true;
                string_ident = "\"";
            }
            else if (is_string && !isSkip(ori_str[0]) && string_ident == "\"") {
                is_string = false;
                string_ident = "";
            }
            tokens.push(token(ori_str.shift(), TokenType.Qout));
        }
        else if (ori_str[0] == "'") {
            // 是否进入字符串模式
            if (!is_string && !isSkip(ori_str[0])) {
                is_string = true;
                string_ident = "'";
            }
            else if (is_string && !isSkip(ori_str[0]) && string_ident == "'") {
                is_string = false;
                string_ident = "";
            }
            tokens.push(token(ori_str.shift(), TokenType.S_Qout));
        }
        else {
            // other
            if (isString(ori_str[0])) {
                let str = "";
                while (ori_str.length > 0 && isString(ori_str[0]) && (ori_str[0] != "\"" && ori_str[0] != "'")) {
                    str += ori_str.shift();
                }
                tokens.push(token(str, TokenType.String));
            }
            else if (isInt(ori_str[0])) {
                let num = "";
                while (ori_str.length > 0 && isInt(ori_str[0])) {
                    num += ori_str.shift();
                }
                tokens.push(token(num, TokenType.Number));
            }
            else if (isAlpha(ori_str[0])) {
                let Ident = "";
                while (ori_str.length > 0 && isAlpha(ori_str[0])) {
                    Ident += ori_str.shift();
                }
                // check reserve
                const reserved = KEYWORDS[Ident];
                if (typeof reserved == "number") {
                    tokens.push(token(Ident, reserved));
                }
                else {
                    tokens.push(token(Ident, TokenType.Identifier));
                }
            }
            else if (isSkip(ori_str[0])) {
                ori_str.shift();
            }
            else {
                console.log(ori_str);
                console.error("无法识别源代码：'", ori_str[0], "'");
                break;
            }
        }
    }
    tokens.push({ type: TokenType.EOF, value: "EOF" });
    return tokens;
}
exports.tokenize = tokenize;
/*
————————————————————————————
Parser解析器
主要实现：
解析Tokens，生成AST树
————————————————————————————
*/
class Parser {
    constructor() {
        this.tokens = [];
    }
    Not_Eof() {
        return this.tokens[0].type != TokenType.EOF;
    }
    at(int = 0) {
        return this.tokens[int];
    }
    eat() {
        const prev = this.tokens.shift();
        return prev;
    }
    expect(type, err) {
        const prev = this.tokens.shift();
        if (!prev || prev.type != type) {
            console.error("Parser Error：\n", err, prev, " - Expect：", type);
            this.tokens = [{ type: TokenType.EOF, value: "EOF" }]; // 直接结束
        }
        return prev;
    }
    produceAST(srcCode) {
        this.tokens = tokenize(srcCode);
        const program = {
            kind: "Program",
            body: []
        };
        while (this.Not_Eof()) {
            program.body.push(this.parse_stmt());
        }
        this.eat();
        return program;
    }
    parse_stmt() {
        switch (this.at().type) {
            case TokenType.def:
            case TokenType.const:
                return this.parse_var_declaration();
            case TokenType.Fn:
                return this.parse_fn_declaration();
            case TokenType.IF:
                return this.parse_if_declaration();
            case TokenType.While:
                return this.parse_while_declaration();
            case TokenType.For:
                return this.parse_for_declaration();
            default:
                return this.parse_expr();
        }
    }
    parse_fn_declaration() {
        this.eat();
        const name = this.expect(TokenType.Identifier, "定义函数体名称错误").value;
        const args = this.parse_args();
        const params = [];
        for (const arg of args) {
            if (arg.kind !== "Identifier") {
                throw `定义函数体期望是字符串类型`;
            }
            params.push(arg.symbol);
        }
        this.expect(TokenType.OpenBrace, "缺少定义函数体标识 {");
        const body = [];
        while (this.at().type !== TokenType.EOF && this.at().type !== TokenType.CloseBrace) {
            body.push(this.parse_stmt());
        }
        this.expect(TokenType.CloseBrace, "缺少定义函数体标识 }");
        const fn = { body, name, parameter: params, kind: "FunctionDeclaration" };
        return fn;
    }
    parse_var_declaration() {
        const is_constant = this.eat().type == TokenType.const;
        const identifier = this.expect(TokenType.Identifier, "定义变量标识符号附近解析失败" + this.at()).value;
        // 解析常量
        if (this.at().type == TokenType.Simecolon) {
            this.eat();
            if (is_constant) {
                throw `常量必须赋值表达式`;
            }
            return { kind: "VairableStmt", identifier, constant: is_constant };
        }
        this.expect(TokenType.Equals, "标识等于符号附近解析失败 " + this.at());
        // 解析变量
        const value = this.parse_expr();
        const declaration = { kind: "VairableStmt", value, constant: is_constant, identifier };
        // this.expect(TokenType.Simecolon, "标识结束符号附近解析失败 " + this.at())
        return declaration;
    }
    parse_if_declaration() {
        this.eat();
        this.expect(TokenType.OP, "条件表达式未发现左括号");
        const logical = this.parse_expr();
        this.expect(TokenType.CP, "条件表达式未发现右括号");
        const body = [];
        this.expect(TokenType.OpenBrace, "条件表达式未发现左花括号");
        while (this.Not_Eof() && this.at().type !== TokenType.CloseBrace) {
            body.push(this.parse_stmt());
        }
        this.expect(TokenType.CloseBrace, "条件表达式未发现右花括号");
        const else_stmt = [];
        let otherif;
        if (this.at().type == TokenType.ELSE) {
            this.eat();
            if (this.at().type == TokenType.IF) {
                otherif = this.parse_if_declaration();
                return { kind: "IFStmt", logical, body, otherif, else: else_stmt };
            }
            else {
                this.expect(TokenType.OpenBrace, "条件表达式未发现左花括号");
                while (this.Not_Eof() && this.at().type !== TokenType.CloseBrace) {
                    else_stmt.push(this.parse_stmt());
                }
                this.expect(TokenType.CloseBrace, "条件表达式未发现右花括号");
            }
            return { kind: "IFStmt", logical, body, else: else_stmt };
        }
        return { kind: "IFStmt", logical, body };
    }
    parse_while_declaration() {
        this.eat();
        this.expect(TokenType.OP, "条件表达式未发现左括号");
        const logical = this.parse_expr();
        this.expect(TokenType.CP, "条件表达式未发现右括号");
        const body = [];
        this.expect(TokenType.OpenBrace, "条件表达式未发现左花括号");
        while (this.Not_Eof() && this.at().type !== TokenType.CloseBrace) {
            body.push(this.parse_stmt());
        }
        this.expect(TokenType.CloseBrace, "条件表达式未发现右花括号");
        return { kind: "WhileStmt", logical, body };
    }
    parse_for_declaration() {
        this.eat();
        this.expect(TokenType.OP, "条件表达式未发现左括号");
        const logical = [];
        for (let i = 0; i <= 2; i++) {
            let stmt_parse = this.parse_stmt();
            logical.push(stmt_parse);
            if (Object.keys(stmt_parse).length > 0 && i <= 2) {
                if (this.at().type == TokenType.Simecolon) {
                    this.expect(TokenType.Simecolon, "缺少条件分号");
                }
            }
            if (this.at().type == TokenType.CP) {
                logical.push({});
                break;
            }
        }
        this.expect(TokenType.CP, "条件表达式未发现右括号");
        const body = [];
        this.expect(TokenType.OpenBrace, "条件表达式未发现左花括号");
        while (this.Not_Eof() && this.at().type !== TokenType.CloseBrace) {
            body.push(this.parse_stmt());
        }
        this.expect(TokenType.CloseBrace, "条件表达式未发现右花括号");
        return { kind: "ForStmt", logical, body };
    }
    parse_expr() {
        return this.parse_assignment_expr();
    }
    parse_assignment_expr() {
        const left = this.pase_logical_expr();
        if (this.at().type == TokenType.Equals) {
            this.eat();
            const value = this.parse_assignment_expr(); // a = b = c 所以要用这种链式赋值
            return { value, assigne: left, kind: "AssignmentExpr" };
        }
        return left;
    }
    pase_logical_expr() {
        const left = this.pase_compare_expr();
        let operator = "";
        let right;
        if (this.at().type == TokenType.And) {
            operator = this.eat().value;
            right = this.pase_compare_expr();
            return { kind: "LogicalStmt", left, right, operator };
        }
        else if (this.at().type == TokenType.Or) {
            operator = this.eat().value;
            right = this.pase_compare_expr();
            return { kind: "LogicalStmt", left, right, operator };
        }
        return left;
    }
    pase_compare_expr() {
        const left = this.parse_object_expr();
        let operator = "";
        let right = {};
        // =
        if (this.at().type == TokenType.Equals) {
            if (this.at(1).type == TokenType.Equals) {
                operator += "==";
                this.eat();
            }
        }
        else if (this.at().type == TokenType.More_Than) {
            operator += this.eat().value;
            // >=
            if (this.at().type == TokenType.Equals) {
                operator += this.eat().value;
            }
        }
        else if (this.at().type == TokenType.Less_Than) {
            operator += this.eat().value;
            // <=
            if (this.at().type == TokenType.Equals) {
                operator += this.eat().value;
            }
        }
        else if (this.at().type == TokenType.Exclam_Mark) {
            this.eat().value;
            // !=
            if (this.at().type == TokenType.Equals) {
                operator += "!=";
                this.eat();
            }
        }
        if (operator != "" && this.Not_Eof()) {
            right = this.parse_object_expr();
            return { kind: "CompareExpr", left, right, operator };
        }
        return left;
    }
    parse_object_expr() {
        if (this.at().type !== TokenType.OpenBrace) {
            return this.parse_array_expr();
        }
        this.eat();
        const properties = new Array();
        while (this.Not_Eof() && this.at().type != TokenType.CloseBrace) {
            // {key}
            const key = this.expect(TokenType.Identifier, "缺少表达式键").value;
            if (this.at().type == TokenType.Comma) { // {key ,}
                this.eat();
                properties.push({ key, kind: "Property" });
                continue;
            }
            else if (this.at().type == TokenType.CloseBrace) { // {key}
                properties.push({ key, kind: "Property" });
                continue;
            }
            //{key :val}
            this.expect(TokenType.Colon, "表达式缺少冒号");
            const value = this.parse_expr();
            properties.push({ key, value, kind: "Property" });
            if (this.at().type != TokenType.CloseBrace) {
                this.expect(TokenType.Comma, "缺少逗号或右括号");
            }
        }
        this.expect(TokenType.CloseBrace, "对象 缺少关闭符号");
        return { kind: "ObjectLiteral", properties };
    }
    parse_array_expr() {
        if (this.at().type !== TokenType.OpenBracket) {
            return this.parse_additive_expr();
        }
        this.eat();
        const properties = new Array();
        let index = 0;
        while (this.Not_Eof() && this.at().type != TokenType.CloseBracket) {
            const value = this.parse_expr();
            if (this.at().type == TokenType.Comma) {
                this.eat();
                properties.push({ kind: "ArrayProperty", value, index });
            }
            else {
                properties.push({ kind: "ArrayProperty", value, index });
            }
            index++;
        }
        this.expect(TokenType.CloseBracket, "数组 缺少关闭符号");
        return { kind: "ArrayLiteral", properties };
    }
    /*
    语法优先级如下
     AssignMentExpr
     Logical
     ComparisonExpr
     Object
     Array
     AdditiveExpr
     MultiplicitaveExpr
     CallExpr
     MemberExpr
     PrimaryExpr
     */
    parse_additive_expr() {
        let left = this.parse_multiplicitave_expr();
        while (this.at().value == "+" || this.at().value == "-") {
            const operator = this.eat().value;
            const right = this.parse_multiplicitave_expr();
            // 字符串+字符串拼接
            if (operator == "+" && left.kind == "StringLiteral" && right.kind == "StringLiteral") {
                left = { kind: "StringLiteral", value: left.value + right.value };
                break;
            }
            // 字符串+数字拼接
            if (operator == "+" && left.kind == "StringLiteral" && right.kind == "NumericLiteral" || right.kind == "StringLiteral" && left.kind == "NumericLiteral") {
                let l_val = left.kind == "NumericLiteral" ? String(left.value) : left.value;
                let r_val = right.kind == "NumericLiteral" ? String(right.value) : right.value;
                left = { kind: "StringLiteral", value: l_val + r_val };
                break;
            }
            left = {
                kind: "BinaryExpr",
                left,
                right,
                operator: operator
            };
        }
        return left;
    }
    parse_multiplicitave_expr() {
        let left = this.parse_call_member_expr();
        while (this.at().value == "*" || this.at().value == "/" || this.at().value == "%") {
            const operator = this.eat().value;
            const right = this.parse_call_member_expr();
            left = {
                kind: "BinaryExpr",
                left,
                right,
                operator: operator
            };
        }
        return left;
    }
    parse_call_member_expr() {
        const member = this.parse_member_expr();
        if (this.at().type == TokenType.OP) {
            return this.parse_call_expr(member);
        }
        return member;
    }
    parse_call_expr(caller) {
        let call_expr = { kind: "CallExpr", caller, args: this.parse_args() };
        if (this.at().type == TokenType.OP) {
            call_expr = this.parse_call_expr(caller);
        }
        return call_expr;
    }
    parse_args() {
        this.expect(TokenType.OP, "未找到左括号");
        const args = this.at().type == TokenType.CP ? [] : this.parse_args_list();
        this.expect(TokenType.CP, "未找到右括号");
        return args;
    }
    parse_args_list() {
        const args = [this.parse_assignment_expr()];
        while (this.at().type == TokenType.Comma && this.eat()) {
            args.push(this.parse_assignment_expr());
        }
        return args;
    }
    parse_member_expr() {
        let object = this.parse_primary_expr();
        while (this.at().type == TokenType.Dot || this.at().type == TokenType.OpenBracket) {
            const operator = this.eat(); // 可能是逗号或者是左括号
            let property;
            let computed;
            if (operator.type == TokenType.Dot) {
                computed = false;
                property = this.parse_primary_expr(); // 获取一个标识
                if (property.kind != "Identifier") {
                    throw `不能使用逗号标识符：附近没有一个表达式`;
                }
            }
            else {
                computed = true;
                property = this.parse_expr();
                this.expect(TokenType.CP, "未找到右括号");
            }
            object = { kind: "MemberExpr", object, property, computed };
        }
        return object;
    }
    parse_primary_expr() {
        const tk = this.at();
        switch (tk.type) {
            case TokenType.Identifier:
                return { kind: "Identifier", symbol: this.eat().value };
            case TokenType.Number:
                return { kind: "NumericLiteral", value: Number.parseFloat(this.eat().value) };
            case TokenType.String:
                return { kind: "StringLiteral", value: String(this.eat().value) };
            case TokenType.OP:
                this.eat();
                var value = this.parse_expr();
                this.expect(TokenType.CP, "未发现结束括号");
                return value;
            case TokenType.Qout:
                this.eat();
                var value = this.parse_expr();
                this.expect(TokenType.Qout, "未发现结束双引号");
                return value;
            case TokenType.S_Qout:
                this.eat();
                var value = this.parse_expr();
                this.expect(TokenType.S_Qout, "未发现结束单引号");
                return value;
            case TokenType.break:
                this.eat();
                return { kind: "BreakLiteral" };
            default:
                console.error("解析期间发现未知Token：", this.at());
                this.tokens = [{ type: TokenType.EOF, value: "EOF" }]; // 直接结束
                return {};
        }
    }
}
exports.Parser = Parser;
function MK_NULL() {
    return { type: "null", value: "null" };
}
exports.MK_NULL = MK_NULL;
function MK_NUMBER(n = 0) {
    return { type: "number", value: n };
}
exports.MK_NUMBER = MK_NUMBER;
function MK_BOOL(bl = true) {
    return { type: "bool", value: bl };
}
exports.MK_BOOL = MK_BOOL;
function MK_STRING(str) {
    return { type: "string", value: str };
}
exports.MK_STRING = MK_STRING;
function MK_FUNC(call) {
    return { type: "func", call };
}
exports.MK_FUNC = MK_FUNC;
function MK_BREAK() {
    return { type: "break", value: "break" };
}
exports.MK_BREAK = MK_BREAK;
/*
————————————————————————————
interpreter 解释器
主要实现：
解释运行AST树
————————————————————————————
*/
function evaluate_program(program, env) {
    let lastEvaled = MK_NULL();
    for (const statement of program.body) {
        lastEvaled = evaluate(statement, env);
    }
    return lastEvaled;
}
function eval_numeric_binary_expr(l_val, r_val, operator) {
    let result = 0;
    if (operator == "+")
        result = l_val.value + r_val.value;
    else if (operator == "-")
        result = l_val.value - r_val.value;
    else if (operator == "*")
        result = l_val.value * r_val.value;
    else if (operator == "/") {
        if (l_val.value == 0 || r_val.value == 0) {
            console.error("意外有除数为0", l_val, operator, r_val);
        }
        else {
            result = l_val.value * r_val.value;
        }
        result = l_val.value / r_val.value;
    }
    else
        result = l_val.value % r_val.value;
    return { value: result, type: "number" };
}
function evaluate_binary_expr(binop, env) {
    const l_val = evaluate(binop.left, env);
    const r_val = evaluate(binop.right, env);
    if (l_val.type == "number" && r_val.type == "number") {
        return eval_numeric_binary_expr(l_val, r_val, binop.operator);
    }
    else if (l_val.type == "number" && r_val.type == "string" || l_val.type == "string" && r_val.type == "number") {
        return { value: l_val.value + r_val.value, type: "string" };
    }
    // 如果有一个为null
    return MK_NULL();
}
function eval_identifier(ident, env) {
    const val = env.lookup_var(ident.symbol);
    return val;
}
function eval_var_declaration(declaration, env) {
    const value = declaration.value ? evaluate(declaration.value, env) : MK_NULL();
    return env.declare_var(declaration.identifier, value, declaration.constant);
}
function eval_assignment(node, env) {
    if (node.assigne.kind != "Identifier") {
        throw `错误的赋值表达式 '${node.assigne}' 赋值为'${node.value}' `;
    }
    const varname = node.assigne.symbol;
    return env.assgin_var(varname, evaluate(node.value, env));
}
function eval_object_expr(obj, env) {
    const object = { type: "object", properties: new Map() };
    for (const { key, value } of obj.properties) {
        const runtimeVal = (value == undefined) ? env.lookup_var(key) : evaluate(value, env);
        object.properties.set(key, runtimeVal);
    }
    return object;
}
function eval_array_expr(obj, env) {
    const array = { type: "array", properties: new Array() };
    for (let i = 0; i < obj.properties.length; i++) {
        const { value } = obj.properties[i];
        const runtimeVal = evaluate(value, env);
        array.properties.push(runtimeVal);
    }
    return array;
}
function eval_call_expr(expr, env) {
    const args = expr.args.map((arg) => evaluate(arg, env));
    const fn = evaluate(expr.caller, env);
    // 是否是内置函数
    if (fn.type == "func") {
        const result = fn.call(args, env);
        return result;
    }
    // 是否是自定义函数
    if (fn.type == "function") {
        const func = fn;
        // 创建函数内部环境:继承自上级环境
        const scope = new Environment(func.declarationEnv);
        for (let i = 0; i < func.parameters.length; i++) {
            const varname = func.parameters[i];
            scope.declare_var(varname, args[i], false);
        }
        let result = MK_NULL();
        for (const stmt of func.body) {
            result = evaluate(stmt, scope);
        }
        return result;
    }
    throw `${fn} 似乎不是一个函数`;
}
function eval_function_declaration(declaration, env) {
    const fn = { type: "function", name: declaration.name, parameters: declaration.parameter, declarationEnv: env, body: declaration.body };
    return env.declare_var(declaration.name, fn, true);
}
function eval_compare_expr(block, env) {
    const left = evaluate(block.left, env);
    const right = evaluate(block.right, env);
    const operator = String(block.operator).trim();
    if (operator == "==") {
        if (left.type == right.type && left.value == right.value) {
            return MK_BOOL(true);
        }
        else {
            return MK_BOOL(false);
        }
    }
    else if (operator == ">") {
        // 保证左右都是数字
        if ((left.type == "number" && right.type == "number")) {
            if (left.value > right.value) {
                return MK_BOOL(true);
            }
            else {
                return MK_BOOL(false);
            }
        }
    }
    else if (operator == ">=") {
        // 保证左右都是数字
        if ((left.type == "number" && right.type == "number")) {
            if (left.value >= right.value) {
                return MK_BOOL(true);
            }
            else {
                return MK_BOOL(false);
            }
        }
    }
    else if (operator == "<") {
        // 保证左右都是数字
        if ((left.type == "number" && right.type == "number")) {
            if (left.value < right.value) {
                return MK_BOOL(true);
            }
            else {
                return MK_BOOL(false);
            }
        }
    }
    else if (operator == "<=") {
        // 保证左右都是数字
        if ((left.type == "number" && right.type == "number")) {
            if (left.value <= right.value) {
                return MK_BOOL(true);
            }
            else {
                return MK_BOOL(false);
            }
        }
    }
    else if (operator == "!=") {
        if (left.type == right.type || left.value == right.value) {
            return MK_BOOL(true);
        }
        else {
            return MK_BOOL(false);
        }
    }
    throw `未知比较运算符号：'${operator}'`;
}
function eval_logical_expr(block, env) {
    const left = evaluate(block.left, env);
    const right = evaluate(block.right, env);
    const op = block.operator;
    if (op == "and") {
        if (left.type == "bool" && right.type == "bool" && right.value && left.value) {
            return MK_BOOL(true);
        }
        else {
            return MK_BOOL(false);
        }
    }
    else if (op == "and") {
        if (left.type == "bool" && right.type == "bool" && (right.value || left.value)) {
            return MK_BOOL(true);
        }
        else {
            return MK_BOOL(false);
        }
    }
    return MK_NULL();
}
function eval_IF_Expr(block, env) {
    const logical = evaluate(block.logical, env);
    if (logical.type == "bool" && logical.value) {
        for (let i in block.body) {
            return evaluate(block.body[i], env);
        }
    }
    else if (block.else && block.else.length > 0) {
        for (let i in block.else) {
            return evaluate(block.else[i], env);
        }
    }
    else if (block.otherif) {
        return evaluate(block.otherif, env);
    }
    else {
        return MK_NULL();
    }
    return MK_NULL();
}
function eval_while_Expr(block, env) {
    let result = MK_NULL();
    while (evaluate(block.logical, env).type == "bool" && evaluate(block.logical, env).value) {
        for (let i in block.body) {
            result = evaluate(block.body[i], env);
            if (result.type == "break") {
                break;
            }
        }
    }
    return result;
}
function eval_for_Expr(block, env) {
    var _a, _b, _c, _d, _e;
    let result = MK_NULL();
    let result1 = MK_NULL();
    let all = MK_NULL();
    if (((_a = block.logical[0]) === null || _a === void 0 ? void 0 : _a.kind) == "VairableStmt") {
        if (((_b = block.logical[1]) === null || _b === void 0 ? void 0 : _b.kind) == "CompareExpr") {
            if (((_c = block.logical[2]) === null || _c === void 0 ? void 0 : _c.kind) == "AssignmentExpr") {
                result = evaluate(block.logical[0], env);
                for (;;) {
                    if (evaluate(block.logical[1], env).type == "bool" && evaluate(block.logical[1], env).value) {
                        for (let i in block.body) {
                            all = evaluate(block.body[i], env);
                            if (all.type == "break") {
                                break;
                            }
                        }
                        // 最后加
                        result1 = evaluate(block.logical[2], env);
                    }
                    else {
                        break;
                    }
                }
            }
            else {
                throw `全for 循环初始化失败: ${block.logical[0]},${block.logical[1]},${block.logical[2]}`;
            }
        }
        else {
            throw `全for 循环初始化失败: ${block.logical[0]},${block.logical[1]},${block.logical[2]}`;
        }
    }
    else if (((_d = block.logical[0]) === null || _d === void 0 ? void 0 : _d.kind) == "CompareExpr") {
        if (((_e = block.logical[1]) === null || _e === void 0 ? void 0 : _e.kind) == "AssignmentExpr") {
            result = evaluate(block.logical[0], env);
            for (;;) {
                if (evaluate(block.logical[0], env).type == "bool" && evaluate(block.logical[0], env).value) {
                    for (let i in block.body) {
                        all = evaluate(block.body[i], env);
                        if (all.type == "break") {
                            break;
                        }
                    }
                    // 最后加
                    result1 = evaluate(block.logical[1], env);
                }
                else {
                    break;
                }
            }
        }
        else {
            throw `全for 循环初始化失败: ${block.logical[0]},${block.logical[1]},${block.logical[2]}`;
        }
    }
    else {
        throw `for 循环初始化失败 ${block.logical[0]},${block.logical[1]},${block.logical[2]}`;
    }
    return all;
}
function eval_break_Expr(block, env) {
    return MK_BREAK();
}
function evaluate(astNode, env) {
    switch (astNode.kind) {
        case "NumericLiteral":
            return { type: "number", value: (astNode.value) };
        case "StringLiteral":
            return { type: "string", value: (astNode.value) };
        case "Identifier":
            return eval_identifier(astNode, env);
        case "ObjectLiteral":
            return eval_object_expr(astNode, env);
        case "ArrayLiteral":
            return eval_array_expr(astNode, env);
        case "CallExpr":
            return eval_call_expr(astNode, env);
        case "LogicalStmt":
            return eval_logical_expr(astNode, env);
        case "CompareExpr":
            return eval_compare_expr(astNode, env);
        case "BinaryExpr":
            return evaluate_binary_expr(astNode, env);
        case "Program":
            return evaluate_program(astNode, env);
        case "VairableStmt":
            return eval_var_declaration(astNode, env);
        case "IFStmt":
            return eval_IF_Expr(astNode, env);
        case "WhileStmt":
            return eval_while_Expr(astNode, env);
        case "ForStmt":
            return eval_for_Expr(astNode, env);
        case "BreakLiteral":
            return eval_break_Expr(astNode, env);
        case "FunctionDeclaration":
            return eval_function_declaration(astNode, env);
        case "AssignmentExpr":
            return eval_assignment(astNode, env);
        default:
            console.error("未知AST节点：", astNode);
            return MK_NULL();
    }
}
exports.evaluate = evaluate;
/*
————————————————————————————
Environment 环境
主要实现：
运行环境存储
————————————————————————————
*/
function setupGlobalScope() {
    const scope = new Environment();
    // 定义全局变量
    scope.declare_var("true", MK_BOOL(true), true);
    scope.declare_var("false", MK_BOOL(false), true);
    scope.declare_var("null", MK_NULL(), true);
    // 定义全局函数
    scope.declare_var("print", MK_FUNC((args, scope) => { let arg = [...args]; arg.map(value => { console.log(value.value); }); return MK_NULL(); }), true);
    scope.declare_var("time", MK_FUNC((args, scope) => { return MK_NUMBER(Date.now()); }), true);
    return scope;
}
exports.setupGlobalScope = setupGlobalScope;
class Environment {
    constructor(parentEVN) {
        const global = parentEVN ? true : false;
        this.parent = parentEVN;
        this.variables = new Map();
        this.constants = new Set();
        this.LoopEvent = new Map();
    }
    declare_loop(event) {
        throw `事件存放错误`;
    }
    declare_var(varname, value, constant = false) {
        if (this.variables.has(varname)) {
            throw `不可定义变量，变量${varname}已被定义`;
        }
        this.variables.set(varname, value);
        if (constant) {
            this.constants.add(varname);
        }
        return value;
    }
    assgin_var(varname, value) {
        const evn = this.resolve(varname);
        if (evn.constants.has(varname)) {
            throw `常量 ${varname} 不可修改`;
        }
        evn.variables.set(varname, value);
        return value;
    }
    lookup_var(varname) {
        const evn = this.resolve(varname);
        return evn.variables.get(varname);
    }
    resolve(varname) {
        if (this.variables.has(varname)) {
            return this;
        }
        if (this.parent == undefined) {
            throw `不能处理 '${varname}' ，因为它不存在`;
        }
        return this.parent.resolve(varname);
    }
}
exports.Environment = Environment;
