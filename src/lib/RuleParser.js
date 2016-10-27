/**
 * 作者: bullub
 * 日期: 16/10/27 20:18
 * 用途: 规则解析器，规则定义继承Tidt
 */
"use strict";
const AtkUtils = require("../utils/AtkUtils");
const ObjectUtils = require("../utils/ObjectUtils");

module.exports = ruleParser;

function ruleParser(matchedCmd, cmdName, cmdValue, contents, index) {
    //noinspection JSCheckFunctionSignatures
    let {opts, file, includePaths, fileDir, filePath, basePath, extName, cmdValueList} = AtkUtils.getMustConfigs(this, cmdName, cmdValue);

    let self = this,
        rules = opts.rules,
        replaceContents = '',
        parser;


    //将所有规则解析成非规则的其它指令列表
    let cmdList = resolveRule([{
        name: cmdName,
        value: cmdValueList
    }], rules, cmdName, function (message) {
        AtkUtils.showParseError(filePath, index, contents, opts.directiveName, message, matchedCmd, null, self);
    });


    for (let i = 0, len = cmdList.length; i < len; i++) {
        //拿到其它指令处理器
        parser = opts.parsers[cmdList[i].name];

        if(typeof parser !== 'function') {
            AtkUtils.showParseError(filePath, index, contents, opts.directiveName, `Directive parse error, no parser implementation for \x1B[34m${cmdList[i].name}\x1B[31m directive!`, matchedCmd, null, this);
            continue ;
        }

        //调用其它指令处理器，并获得其它指令处理器响应的内容
        replaceContents += parser.call(this, matchedCmd, cmdList[i].name, cmdList[i].value.join(';'), contents, index);
    }

    return replaceContents;
}


function resolveRule(rule, rules, cmdName, showError) {
    let cmdList = [],
        //指令
        cmd;
    //解析规则
    for (let i = 0, len = rule.length; i < len; i++) {
        //从规则中取出指令
        cmd = rule[i];

        if (cmd.name === cmdName) {
            for (let j = 0, jLen = cmd.value.length; j < jLen; j++) {

                let _rule = rules[cmd.value[j]];

                if (!_rule) {
                    //没找到规则
                    showError(`Directive parse error, rule \x1B[34m${cmd.value[j]}\x1B[31m not found, please check your rules!`)
                } else if (!(_rule instanceof Array)) {
                    //规则必须是一个数组，规则格式不对
                    showError(`Directive parse error, rule \x1B[34m${cmd.value[j]}\x1B[31m's value must be an array, please check your rules!`)
                } else {
                    cmdList = cmdList.concat(resolveRule(rules[cmd.value[j]], rules, cmdName));
                }
            }

        } else {
            cmdList.push(cmd);
        }

    }

    return cmdList;
}