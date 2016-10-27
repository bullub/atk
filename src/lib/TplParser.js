/**
 * 作者: bullub
 * 日期: 16/10/25 11:28
 * 用途: 模板指令解释器
 */
const AtkUtils = require("../utils/AtkUtils");
const path = require("path");
const fs = require("fs");

module.exports = TplParser;

/**
 * 模板指令替换
 * @param matchedCmd {String} 匹配到的指令全貌
 * @param cmdName {String} 指令名称
 * @param cmdValue {String} 指令名称
 * @param contents {String} 全部内容
 * @param index {Number} 指令所在内容中的位置
 * @returns {string} 解析之后的模板内容
 */
function TplParser(matchedCmd, cmdName, cmdValue, contents, index) {
    //noinspection JSCheckFunctionSignatures
    let {opts, file, includePaths, filePath, basePath, extName, cmdValueList} = AtkUtils.getMustConfigs(this, cmdName, cmdValue);

    //从指令中解析出包含的文件绝对路径
    let includeTplFiles = AtkUtils.getIncludeAbsoluteFilePaths(includePaths, cmdValueList, extName, basePath);

    //读取出来的所有模板的内容
    let replaceContents = '';

    AtkUtils.fileIterator({
        context: this,
        files: includeTplFiles,
        filePath,
        index,
        contents,
        directiveName: opts.directiveName,
        basePath,
        matchedCmd
    }, function (path, hasFile) {
        if(hasFile) {
            replaceContents += fs.readFileSync(path);
        }
    });

    return replaceContents;
}




