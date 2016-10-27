/**
 * 作者: bullub
 * 日期: 16/10/25 14:10
 * 用途: 默认的配置信息
 */
"use strict";
module.exports = {
    //node的启动路径，执行查找npm或者bower作为依赖管理时，进行打包的查找根路径，一般这一层和npm和bower在同一层，如果有改动，需要外部配置
    cwd: process.cwd(),
    //写在页面中的指令名称，做成可配，以便各种不同项目做工具的时候，快速把工具变成项目本身所有(就是给一个方便的装逼方式)
    directiveName: "atk",
    //源码目录根目录
    srcBase: "src",
    //在打包bower管理的依赖库时，将被引用的文件拷贝到的目标目录,默认dist/npm
    npmDist: "dist/npm",
    //在打包bower管理的依赖库时，将被引用的文件拷贝到的目标目录,默认dist/bower
    bowerDist: "assets/bower",
    //配置查找不同指令文件的相对源的路径,默认无配置就是到当前制定的srcBase中去寻找
    includePaths: {
        js: ["."],
        css: ["."],
        tpl: ["."]
    },
    //环境变量，这里的变量值可以用于覆盖路径中的{variable}值，根据环境生成路径
    envSetting: {

    },
    //规则列表
    rules: {

    },
    //通过第三方依赖管理库管理的指令对应的库名称
    thirdDepDirectiveNameMap: {
        njs: "npm",
        ncss: "npm",
        bjs: "bower",
        bcss: "bower"
    },
    //第三方依赖管理库名对应的根目录
    thirdDepBase: {
        npm: "node_modules",
        bower: "bower_components"
    },
    //第三方依赖管理库名对应的资源打包的目标目录(会生成vinly)根据该路径生成
    thirdDepDist: {
        //在打包npm管理的依赖库时，将被引用的文件拷贝到的目标目录,默认dist/npm
        npm: "assets/npm",
        //在打包bower管理的依赖库时，将被引用的文件拷贝到的目标目录,默认dist/bower
        bower: "assets/bower"
    },
    //每个指令对应的文件的扩展名，扩展名可以写空串，这样的话指令值默认需要加上扩展名
    directiveExtensions: {
        js: ".js",
        css: ".css",
        tpl: ".html",
        njs: ".js",
        ncss: ".css",
        bjs: ".js",
        bcss: ".css"
    },
    parsers: {
        //基础的指令解析器
        js: require("../lib/JSParser"),
        css: require("../lib/CSSParser"),
        tpl: require("../lib/TplParser"),

        //第三方指令解析器(n开头代表npm，b开头的代表bower)
        njs: require("../lib/ThirdDepBasedParser").jsParser,
        ncss: require("../lib/ThirdDepBasedParser").cssParser,
        bjs: require("../lib/ThirdDepBasedParser").jsParser,
        bcss: require("../lib/ThirdDepBasedParser").cssParser,

        //规则指令解析器
        rule: require("../lib/RuleParser")
    }
};

