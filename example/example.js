/**
 * 作者: bullub
 * 日期: 16/10/26 16:14
 * 用途:
 */
const DirectiveResolver = require("../src").DirectiveResolver;
const File = require("vinyl");

const fs = require("fs");
const path = require("path");
const cwd = process.cwd();



var dr = new DirectiveResolver({
    includePaths: {
        tpl: ["templates"],
        js: ["scripts"]
    },
    envSetting: {
        env: "123"
    },
    rules: {
        core: [
            {
                name: "js",
                value: [
                    "aaa/aaa.js"
                ]
            },
            {
                name: "jsd",
                value: [
                    "aaa/aaa.js"
                ]
            }
        ]
    }
});

var result = dr.resolve(new File({
    base: path.join(cwd, "src"),
    cwd: cwd,
    path: path.join(cwd, "src/pages/index.html"),
    contents: fs.readFileSync(path.join(cwd, "src/pages/index.html"))
}));

// var result = dr.resolve(new File({
//     base: path.join(cwd, "src"),
//     cwd: cwd,
//     path: path.join(cwd, "src/pages/testRule.html"),
//     contents: fs.readFileSync(path.join(cwd, "src/pages/testRule.html"))
// }));

console.log(result);

console.log(dr.getFiles());
// console.log(dr.addedFiles[0].path);