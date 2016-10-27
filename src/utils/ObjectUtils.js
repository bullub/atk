/**
 * 作者: bullub
 * 日期: 16/10/25 15:25
 * 用途: 对象工具类
 */
"use strict";
module.exports = {
    deepCopy,
    obj2props
};


/**
 * 深拷贝，将一个原对象拷贝给一个目标对象
 * @param target {Object|Array} 目标对象，数组或对象
 * @param source {Object|Array} 源对象
 * @returns {Object|Array} 返回的对象与传入的目标对象是同一个对象
 * @private
 */
function _deepCopy(target, source) {
    let item, itemType;
    for(let key in source) {
        //如果是一个带有原型链的对象，则判断属性是否属于自身 (不拷贝原型链上的属性)
        if(source.hasOwnProperty && !source.hasOwnProperty(key)) {
            continue ;
        }

        item = source[key];
        itemType = typeof item;

        // 不拷贝函数
        // if(itemType === 'function') {
        //     continue;
        // }

        //只要是object类型，就进行深拷贝
        if(itemType === 'object' && item !== null) {
            if(!target[key]) {
                if(Array.isArray(item)) {
                    target[key] = [];
                } else {
                    target[key] = {};
                }
            }

            _deepCopy(target[key], source[key]);
            continue ;
        }

        target[key] = item;
    }

    return target;
}

/**
 * 深拷贝一组对象，将这些对象整合拷贝到一个新对象中，并通过返回值返回
 * @param objs {...Object} 多个参与深拷贝的对象
 * @returns {Object}  新建的拷贝后的对象
 */
function deepCopy(...objs) {
    var target = {};

    objs.forEach((item, index) => {
        _deepCopy(target, item);
    });

    return target;
}

function obj2props(obj) {
    var props = {};
    for(let key in obj) {
        if(obj.hasOwnProperty(key)) {
            props[key] = {
                value: obj[key],
                enumerable: true
            };
        }
    }
    return props;
}