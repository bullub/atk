/**
 * 作者: bullub
 * 日期: 16/10/25 11:16
 * 用途: 指令分解器，从文本内容中分解出指令，然后将不同指令交由不同的解析器处理
 */
"use strict";
const defaultOptions =  require("../configs");
const ObjectUtils = require("../utils/ObjectUtils");
const AtkUtils = require("../utils/AtkUtils");
const PathVariableInjector = require("./PathVariableInjector");

const DIRECTIVE_BEFORE = `<!--\\s*`;
const DIRECTIVE_END = `\\s+([^'"]*)\\s*=\\s*"?([^'"]*)"?\\s*-->`;

const directiveReg = Symbol("directiveReg");

class DirectiveResolver {
    /**
     * 构造函数
     * @param options 请参考configs/index.js
     */
    constructor(options) {
        //深拷贝默认配置,并使用当前配置覆盖对应配置项
        let opts = this.opts = Object.create(null, ObjectUtils.obj2props(ObjectUtils.deepCopy(defaultOptions, options || {})));

        //在解析bower和npm指令时，可能会涉及到新增文件(将npm或者bower中被引用到的文件拷贝到目标位置，该列表中保存了被拷贝和新增的文件的vinly对象)
        this._addedFiles = [];

        //用于快速判断当前上下文是否已添加存在某文件
        this._addedFileSet = {};

        //定义当前错误行
        this.currentErrorLine = null;

        this.pathInjector = new PathVariableInjector(opts.envSetting);

        //私有属性，外部无法访问
        this[directiveReg] = new RegExp(DIRECTIVE_BEFORE + opts.directiveName + DIRECTIVE_END, "img");
    }

    injectPath(path) {
        return this.pathInjector.inject(path);
    }

    addFiles(files) {
        for(let i = 0, len = files.length; i < len; i ++) {
            this.addFile(files[i]);
        }
    }

    addFile(file) {
        if(this.hasFile(file)) {
            return ;
        }
        this._addedFiles.push(file);
        this._addedFileSet[file.path] = true;
    }

    hasFile(file) {
        return !!this._addedFileSet[file.path];
    }

    getFiles() {
        return this._addedFiles;
    }
    /**
     * 解析文件
     * @param file {File} vinly File
     */
    resolve(file) {
        //记录当前正在分析的文件
        this.currentFile = file;
        //返回当前根据指令解析器上下文进行解析后，返回的解析后的文件
        return file.contents.toString().replace(this[directiveReg], cmdParser.bind(this));
    }
}

/**
 * 解析指令
 * @param matchedCmd {String} 匹配的指令
 * @param cmdName {String} 指令名称
 * @param cmdValue {String} 指令值
 * @param index {Number} 字符位置
 * @param contents {String} 文件内容
 */
function cmdParser(matchedCmd, cmdName, cmdValue, index, contents) {

    let currentFile = this.currentFile;
    let opts = this.opts;

    if(!cmdName || !cmdValue) {
        AtkUtils.showParseError(currentFile.path, index, contents, opts.directiveName, "The directive can not be parsed because the directive is not in the correct format.", matchedCmd, null, this);
        return matchedCmd;
    }

    let parser = this.opts.parsers[cmdName];

    if(typeof parser !== 'function') {
        AtkUtils.showParseError(currentFile.path, index, contents, opts.directiveName, `Directive parse error, no parser implementation for \x1B[34m${cmdName}\x1B[39m directive!`, matchedCmd, null, this);
        return matchedCmd;
    }

    return parser.call(this, matchedCmd, cmdName, cmdValue, contents, index);
}

module.exports = DirectiveResolver;