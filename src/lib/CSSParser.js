/**
 * 作者: bullub
 * 日期: 16/10/25 11:53
 * 用途: CSS引用解释器
 */
const AtkUtils = require("../utils/AtkUtils");
const path = require("path");

module.exports = cssParser;

function cssParser(matchedCmd, cmdName, cmdValue, contents, index) {
    //noinspection JSCheckFunctionSignatures
    let {opts, file, includePaths, fileDir, filePath, basePath, extName, cmdValueList} = AtkUtils.getMustConfigs(this, cmdName, cmdValue);

    //从指令中解析出包含的文件绝对路径
    let includeCssFiles = AtkUtils.getIncludeAbsoluteFilePaths(includePaths, cmdValueList, extName, basePath);

    let replaceContents = '';

    AtkUtils.fileIterator({
        context: this,
        files: includeCssFiles,
        filePath,
        index,
        contents,
        directiveName: opts.directiveName,
        basePath,
        matchedCmd
    }, function (scriptPath) {
        replaceContents += `<link rel="stylesheet" href="${path.relative(fileDir, scriptPath).replace(/\\/g, "/")}">`;
    });

    return replaceContents;
}