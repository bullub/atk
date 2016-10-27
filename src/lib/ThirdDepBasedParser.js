/**
 * 作者: bullub
 * 日期: 16/10/27 19:04
 * 用途: 基于第三方依赖库的指令解析工具
 */
"use strict";
const AtkUtils = require("../utils/AtkUtils");

const path = require("path");
const fs = require("fs");

module.exports = {
    cssParser,
    jsParser
};

function cssParser(matchedCmd, cmdName, cmdValue, contents, index) {
    //noinspection JSCheckFunctionSignatures
    let {opts, file, includePaths, fileDir, filePath, basePath, extName, cmdValueList} = AtkUtils.getMustConfigs(this, cmdName, cmdValue);

    let COMPONENT_NAME = opts.thirdDepDirectiveNameMap[cmdName];

    let COMPONENT_BASE = opts.thirdDepBase[COMPONENT_NAME];
    let COMPONENT_DIST = opts.thirdDepDist[COMPONENT_NAME];

    let self = this;

    //从指令中解析出包含的文件绝对路径
    let includeBowerCssFiles = getFilesIntoThird(opts.cwd, cmdValueList, extName, COMPONENT_BASE);

    let replaceContents = '';

    AtkUtils.fileIterator({
        context: self,
        files: includeBowerCssFiles,
        filePath,
        index,
        contents,
        directiveName: opts.directiveName,
        basePath,
        matchedCmd
    }, function (cssPath, fileExists) {
        //根据配置，生成出构建之后，文件相对当前源码路径的目标路径
        let distFilePath = getDistFilePath(cssPath, basePath, opts.cwd, COMPONENT_DIST, COMPONENT_BASE);

        //如果引用的文件存在，将文件构建成vinly文件，并添加到当前构建上下文的addedFiles中
        if(fileExists) {
            let fileContent = fs.readFileSync(cssPath);

            let cssFile = AtkUtils.createFile(basePath, opts.cwd, distFilePath, fileContent);

            let addedFiles = AtkUtils.getDepFilesFromCss(cssFile, cssPath, fileContent.toString());


            //将生成出来的vinly增加到当前上下文
            self.addFile(cssFile);
            self.addFiles(addedFiles);


        }

        replaceContents += `<link rel="stylesheet" href="${path.relative(fileDir, distFilePath)}">`;

    });

    return replaceContents;

}

/**
 * 通过bower管理的所有脚本的引用指令解释器
 * @param matchedCmd {String} 指令全名
 * @param cmdName {String} 指令名
 * @param cmdValue {String} 指令值
 * @param contents {String} 文件内容
 * @param index {Number} 指令在文件中的位置
 * @returns {string} 文件
 */
function jsParser(matchedCmd, cmdName, cmdValue, contents, index) {
    //noinspection JSCheckFunctionSignatures
    let {opts, file, includePaths, fileDir, filePath, basePath, extName, cmdValueList} = AtkUtils.getMustConfigs(this, cmdName, cmdValue);

    let self = this;

    let COMPONENT_NAME = opts.thirdDepDirectiveNameMap[cmdName];

    let COMPONENT_BASE = opts.thirdDepBase[COMPONENT_NAME];
    let COMPONENT_DIST = opts.thirdDepDist[COMPONENT_NAME];

    //从指令中解析出包含的文件绝对路径
    let includeBowerJsFiles = getFilesIntoThird(opts.cwd, cmdValueList, extName, COMPONENT_BASE);

    let replaceContents = '';

    AtkUtils.fileIterator({
        context: self,
        files: includeBowerJsFiles,
        filePath,
        index,
        contents,
        directiveName: opts.directiveName,
        basePath,
        matchedCmd
    }, function (scriptPath, fileExists) {
        //根据配置，生成出构建之后，文件相对当前源码路径的目标路径
        let distFilePath = getDistFilePath(scriptPath, basePath, opts.cwd, COMPONENT_DIST, COMPONENT_BASE);

        //如果引用的文件存在，将文件构建成vinly文件，并添加到当前构建上下文的addedFiles中
        if(fileExists) {
            //将生成出来的vinly增加到当前上下文
            self.addFile(AtkUtils.createFile(basePath, opts.cwd, distFilePath, fs.readFileSync(scriptPath)));
        }

        replaceContents += `<script src="${path.relative(fileDir, distFilePath)}"></script>`;

    });

    return replaceContents;
}

function getFilesIntoThird(cwd, cmdValueList, extName, COMPONENT_BASE) {

    let includeAbsolutePaths = [];

    for(let i = 0, len = cmdValueList.length; i < len; i ++) {
        includeAbsolutePaths.push(path.join(cwd, COMPONENT_BASE, cmdValueList[i] + extName));
    }
    return includeAbsolutePaths;
}

function getDistFilePath(filePath, srcBasePath, cwd, distDirName, COMPONENT_BASE) {
    let relativeBowerPath = path.relative(path.join(cwd, COMPONENT_BASE), filePath);
    // let distFilePath = path.join(srcBasePath, distDirName, relativeBowerPath);

    return path.join(srcBasePath, distDirName, relativeBowerPath);
}