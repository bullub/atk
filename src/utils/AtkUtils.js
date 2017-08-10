/**
 * 作者: bullub
 * 日期: 16/10/26 17:34
 * 用途:
 */
"use strict";
const fs = require("fs");
const path = require("path");
const File = require("vinyl");
const crypto = require('crypto');

const CSS_URL_REG = /url\((['"]?)([^'"\)]+)\1\)/img;
const EMPTY_STR_REG = /^\s*$/;


module.exports = {
    getMustConfigs,
    getIncludeAbsoluteFilePaths,
    fileIterator,
    createFile,
    getDepFilesFromCss,
    showParseError
};
/**
 *
 * 根据指令解析器和指令名，获取指令需要的必须参数
 * @param directiveResolver {DirectiveResolver} 指令解析器示例
 * @param cmdName {String} 指令名
 * @param cmdValue {String} 指令值
 * @returns {{opts: (*|{dir?: String, file?: String}|{dir?: String}), file: (*|vinyl), includePaths, filePath: *, basePath: *, extName: string, cmdValueList: (Array|*)}}
 */
function getMustConfigs(directiveResolver, cmdName, cmdValue) {
    let opts = directiveResolver.opts;
    let file = directiveResolver.currentFile;
    let includePaths = opts.includePaths[cmdName];
    let filePath = file.path;
    let fileDir = path.dirname(filePath);
    let basePath = path.join(opts.cwd, opts.srcBase);
    let extName = opts.directiveExtensions[cmdName];
    let cmdValueList = cmdValue.split(";");

    //清理掉空值配置
    for(let i = cmdValueList.length - 1; i >= 0; i --) {
        if(!cmdValueList[i] || EMPTY_STR_REG.test(cmdValueList[i])) {
            cmdValueList.splice(i, 1);
        }
    }

    return {
        opts,
        file,
        fileDir,
        includePaths,
        filePath,
        basePath,
        extName,
        cmdValueList
    };
}

/**
 * 查找包含的文件的绝对路径
 * @param includePaths {Array} 包含文件的子路径
 * @param cmdValueList {Array} 命令值列表
 * @param extName {String} 命令对应的文件扩展名
 * @param basePath {String} 查找根路径
 */
function getIncludeAbsoluteFilePaths(includePaths, cmdValueList, extName, basePath, context) {
    let filePath, includeAbsolutePaths = [];

    for(let i = 0, len = cmdValueList.length; i < len; i ++) {
        for(var j = 0, jLen = includePaths.length; j < jLen; j ++) {
            filePath = context.pathInjector.inject(path.join(basePath, includePaths[j], cmdValueList[i] + extName));
            if(fs.existsSync(filePath)) {
                includeAbsolutePaths.push(filePath);
                break ;
            }
        }
        if(j === jLen) {
            includeAbsolutePaths.push(filePath);
        }
    }

    return includeAbsolutePaths;
}

/**
 * 在控制台打印出指令解析错误提示
 * @param filePath {String} 正在解析的文件路径
 * @param index {Number} 指令所在位置
 * @param contents {String} 正在解析的文件内容
 * @param directiveName {String} 指令解析器名称
 * @param basePath {String} 根路径
 * @param matchedCmd {String} 指令全貌
 * @param cmdFilePath {String} 当前解析的文件路径
 * @param context {DirectiveResolver} 指令解析器上下文
 */
function showParseError(filePath, index, contents, directiveName, basePath, matchedCmd, cmdFilePath, context) {

    let currentErrorLine = `${filePath}:${contents.slice(0,index).split("\n").length}`;

    if(currentErrorLine !== context.currentErrorLine) {
        console.log(`\x1B[32m${currentErrorLine}  \x1B[34m${directiveName} \x1B[31mDirective Resolver Error\x1B[39m`)
    }

    context.currentErrorLine = currentErrorLine;

    if(cmdFilePath) {
        console.log(`\x1B[33mDirective \x1B[34m%s \x1B[33mparsing serious warning. File not found: \x1B[34m%s\x1B[39m`, matchedCmd, path.relative(basePath, cmdFilePath));
    } else {
        console.log(`\x1B[31mDirective \x1B[34m${matchedCmd} \x1B[31mparsing error. ${basePath}\x1B[39m`);
    }
}

/**
 * 文件迭代器，迭代器默认检查文件是否存在，如果不存在就在控制台打出错误提示，同时不再回调文件处理器
 * @param options {Object} 文件路径列表
 * @param fileHandler {Function} 文件处理器
 */
function fileIterator(options, fileHandler) {

    let {context, files, filePath, index, contents, directiveName, basePath, matchedCmd} = options;
    let realFile = true, fileContent =  "" + Date.now();

    for (let i = 0, len = files.length; i < len; i++, realFile = true) {
        //拿到路径，并且将路径变量处理掉
        let item = context.injectPath(files[i]);

        if(!fs.existsSync(item)) {
            realFile = false;
            showParseError(filePath, index, contents, directiveName, basePath, matchedCmd, item, context);
        }

        if(realFile) {
            fileContent = fs.readFileSync(item);
        }

        fileHandler(item, realFile, getMD5(fileContent));
    }
}

function getMD5(content, start = 16, end = 24) {
    let md5 = crypto.createHash('md5');
    md5.update(content);
    return md5.digest('hex').substring(start, end);
}

/**
 * 新建vinly文件
 * @param base {String} 文件的base
 * @param cwd {String} 指定当前的cwd
 * @param filePath {String} 文件路径
 * @param content {String} 文件内容
 * @returns {File} 新建的文件
 */
function createFile(base, cwd, filePath, content) {
    return new File({
        base: base,
        cwd: cwd,
        path: filePath,
        contents: new Buffer(content)
    });
}

/**
 * 从css文件中解析出依赖的文件及引用的文件，并将文件列表返回
 * @param cssFile {File} 样式文件路径
 * @param cssFilePath {String} css源文件路径
 * @param contents {String} 样式文件的内容
 * @return {Array<File>}
 */
function getDepFilesFromCss(cssFile, cssFilePath, contents) {

    let cssFileBase = path.dirname(cssFilePath),
        files = [];

    contents.replace(CSS_URL_REG, function (matched, $1, url, index, contents) {

        let realUrl = getRealUrl(url);
        //被引用的文件路径
        let _url = path.resolve(cssFileBase, getRealUrl(realUrl));

        //文件存在，将文件构建到目标目录
        if(fs.existsSync(_url)) {

            //构造，并将被引用的文件写入到文件列表中
            files.push(createFile(cssFile.base, cssFile.cwd, path.resolve(path.dirname(cssFile.path), realUrl), fs.readFileSync(_url)));
        }
    });

    return files;
}


function getRealUrl(url) {
    let urlLen = url.indexOf("?");

    if(-1 === urlLen) {
        urlLen = url.indexOf("#");
    }

    if(-1 !== urlLen) {
        url = url.substring(0, urlLen);
    }

    return url;
}