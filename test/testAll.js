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
const assert = require("assert");

//执行单元测试之前，需要先到example中执行npm install和bower install

describe("Atk test", function () {
    it("resolve example", function () {
        console.log('-----------------------------------------------------');
        var dr = new DirectiveResolver({
            cwd,
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
            contents: new Buffer(`<!DOCTYPE html>
<html lang="en">
<head>
    <!--atk tpl="head;body"-->
    <!--atk css="head;body"-->
    <title>Title</title>
</head>
<body>

<!--atk rule="core"-->
<!--atk njs="underscore/underscore;a/b;c/d"-->
<!--atk ncss="bootstrap/dist/css/bootstrap;a/b;c/d"-->
<!--atk bjs="underscore/underscore;a/b;c/d"-->
<!--atk bjs="underscore/underscore;a/b;c/d"-->
<!--atk bcss="xxx/xx;a/b;c/d"-->
<!--atk js="abc;ccd"-->
<!--atk aa="123" -->
<!--atk aa="" -->
<!--atk ="" -->
</body>
</html>`)
        }));


        console.log(result, dr.getFiles().length);

        assert.equal(result, `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="../head.css?_=7d30f76f"><link rel="stylesheet" href="../body.css?_=7d30f76f">
    <title>Title</title>
</head>
<body>

<script src="../aaa/aaa.js.js?_=7d30f76f"></script>
<script src="../assets/npm/underscore/underscore.js?_=7d30f76f"></script><script src="../assets/npm/a/b.js?_=7d30f76f"></script><script src="../assets/npm/c/d.js?_=7d30f76f"></script>
<link rel="stylesheet" href="../assets/npm/bootstrap/dist/css/bootstrap.css?_=7d30f76f"><link rel="stylesheet" href="../assets/npm/a/b.css?_=7d30f76f"><link rel="stylesheet" href="../assets/npm/c/d.css?_=7d30f76f">
<script src="../assets/bower/underscore/underscore.js?_=7d30f76f"></script><script src="../assets/bower/a/b.js?_=7d30f76f"></script><script src="../assets/bower/c/d.js?_=7d30f76f"></script>
<script src="../assets/bower/underscore/underscore.js?_=7d30f76f"></script><script src="../assets/bower/a/b.js?_=7d30f76f"></script><script src="../assets/bower/c/d.js?_=7d30f76f"></script>
<link rel="stylesheet" href="../assets/bower/xxx/xx.css?_=f54c22e7"><link rel="stylesheet" href="../assets/bower/a/b.css?_=f54c22e7"><link rel="stylesheet" href="../assets/bower/c/d.css?_=f54c22e7">
<script src="../abc.js?_=7d30f76f"></script><script src="../ccd.js?_=7d30f76f"></script>
<!--atk aa="123" -->
<!--atk aa="" -->
<!--atk ="" -->
</body>
</html>`);
//
        assert.equal(dr.getFiles().length, 1);

    });
});