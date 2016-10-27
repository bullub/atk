/**
 * 作者: bullub
 * 日期: 16/10/27 22:07
 * 用途: 单元测试
 */
"use strict";
const path = require("path");
const fs = require("fs");
const File = require("vinyl");
const DirectiveResolver = require("../src").DirectiveResolver;
const cwd = path.join(process.cwd(), "example");

describe("Atk test", function () {
    it("resolve example to check", function () {
        console.log('-----------------------------------------------------');
        var dr = new DirectiveResolver({
            includePaths: {
                tpl: ["templates"],
                js: ["scripts"]
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

        console.log(result);

    });
});