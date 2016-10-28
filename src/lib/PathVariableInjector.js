/**
 * 作者: bullub
 * 日期: 16/10/25 11:54
 * 用途: 路径变量注入器
 */
"use strict";
class PathVariableInjector {
    constructor(settings) {
        let regs = this.regs = {};
        this.settings = settings;
        for(let key in settings) {
            regs[key] = new RegExp(`\{${key}\}`, "g");
        }
    }
    inject(path) {
        if(typeof path !== 'string') {
            return path;
        }
        for(let key in this.regs) {
            path = path.replace(this.regs[key], this.settings[key]);
        }

        return path;
    }
}

module.exports = PathVariableInjector;