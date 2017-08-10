/**
 * 作者: bullub
 * 日期: 16/10/25 11:35
 * 用途: Javascript引用指令解释器
 */
const AtkUtils = require("../utils/AtkUtils");
const path = require("path");

module.exports = jsParser;

function jsParser(matchedCmd, cmdName, cmdValue, contents, index) {
    //noinspection JSCheckFunctionSignatures
    let {opts, file, includePaths, fileDir, filePath, basePath, extName, cmdValueList} = AtkUtils.getMustConfigs(this, cmdName, cmdValue);

    //从指令中解析出包含的文件绝对路径
    let includeScriptFiles = AtkUtils.getIncludeAbsoluteFilePaths(includePaths, cmdValueList, extName, basePath, this);

    let replaceContents = '';

    AtkUtils.fileIterator({
        context: this,
        files: includeScriptFiles,
        filePath,
        index,
        contents,
        directiveName: opts.directiveName,
        basePath,
        matchedCmd
    }, function (scriptPath, realFile, hash) {
        replaceContents += `<script src="${path.relative(fileDir, scriptPath).replace(/\\/g, "/")}?_=${hash}"></script>`;
    });

    return replaceContents;
}