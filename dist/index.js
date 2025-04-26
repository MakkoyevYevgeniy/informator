"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Informator = exports.emoji = exports.HEX = exports.RGB = void 0;
const dateflow_1 = require("dateflow");
const colors_1 = require("./colors");
Object.defineProperty(exports, "RGB", { enumerable: true, get: function () { return colors_1.RGB; } });
Object.defineProperty(exports, "HEX", { enumerable: true, get: function () { return colors_1.HEX; } });
const emojis_1 = require("./emojis");
Object.defineProperty(exports, "emoji", { enumerable: true, get: function () { return emojis_1.emoji; } });
const util_1 = require("util");
function applyStyles(text, styles = {}) {
    const codes = [];
    if (styles.bold)
        codes.push('1');
    if (styles.italic)
        codes.push('3');
    if (styles.underline)
        codes.push('4');
    if (styles.strikethrough)
        codes.push('9');
    if (styles.color)
        codes.push(`38;2;${styles.color.r};${styles.color.g};${styles.color.b}`);
    if (styles.backgroundColor)
        codes.push(`48;2;${styles.backgroundColor.r};${styles.backgroundColor.g};${styles.backgroundColor.b}`);
    if (codes.length === 0) {
        return text;
    }
    return `\u001b[${codes.join(';')}m${text}\u001b[0m`;
}
function isLogOptions(obj) {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
        return false;
    }
    const objKeys = Object.keys(obj);
    if (objKeys.length === 0) {
        return true;
    }
    const strongOptionKeys = ['dateFlowOptions', 'separatorOptions'];
    const weakOptionKeysSet = new Set(['color', 'backgroundColor', 'name', 'bold', 'italic', 'underline', 'strikethrough', 'formatObject']);
    const hasStrongKey = strongOptionKeys.some(key => key in obj);
    const allKeysAreValidOptions = objKeys.every(key => weakOptionKeysSet.has(key) || strongOptionKeys.some(k => k === key));
    if (!allKeysAreValidOptions) {
        return false;
    }
    if (hasStrongKey) {
        return true;
    }
    const hasOnlyWeakKeys = objKeys.every(key => weakOptionKeysSet.has(key));
    if (hasOnlyWeakKeys) {
        if (objKeys.length >= 1) {
            return true;
        }
        if ('name' in obj && typeof obj.name === 'object' && obj.name !== null && 'name' in obj.name) {
            return true;
        }
    }
    return false;
}
function formatForLog(arg, formatObject = false) {
    if (typeof arg === 'string') {
        return arg;
    }
    else if (typeof arg === 'object' && arg !== null) {
        try {
            if (typeof process === 'object' && process.versions && process.versions.node) {
                return (0, util_1.inspect)(arg, { depth: null, colors: formatObject });
            }
            else {
                return JSON.stringify(arg);
            }
        }
        catch (e) {
            return String(arg);
        }
    }
    else {
        return String(arg);
    }
}
function wrapWithSymbol(nameStr, wrapSymbol) {
    switch (wrapSymbol) {
        case '[]':
            return `[${nameStr}]`;
        case '()':
            return `(${nameStr})`;
        case '{}':
            return `{${nameStr}}`;
        case '<>':
            return `<${nameStr}>`;
        default:
            return nameStr;
    }
}
class Informator {
    constructor() { }
    log(...args) {
        var _a;
        let options = {};
        let messages;
        let onlyOptionsProvided = false;
        if (args.length > 0) {
            const lastArg = args[args.length - 1];
            if (isLogOptions(lastArg)) {
                options = lastArg;
                messages = args.slice(0, -1);
                if (messages.length === 0) {
                    onlyOptionsProvided = true;
                }
            }
            else {
                messages = args;
            }
        }
        else {
            messages = [];
        }
        if (messages.length === 0 && !onlyOptionsProvided) {
            console.log();
            return;
        }
        if (onlyOptionsProvided) {
            messages.push('');
        }
        const { formatObject } = options;
        const mainStyles = {
            color: options.color,
            backgroundColor: options.backgroundColor,
            bold: options.bold,
            italic: options.italic,
            underline: options.underline,
            strikethrough: options.strikethrough
        };
        const styledMessages = messages.map(msg => {
            const formattedPart = formatForLog(msg, formatObject);
            const isObjectOrArray = typeof msg === 'object' && msg !== null;
            if (!isObjectOrArray || !formatObject) {
                if (!onlyOptionsProvided) {
                    return applyStyles(formattedPart, mainStyles);
                }
            }
            return formattedPart;
        });
        let finalMessage = styledMessages.join(' ');
        let prefix = '';
        const { name } = options;
        if (name) {
            let nameStr;
            let wrapSymbol = '[]';
            let nameSpecificStyles = {};
            let useNameSpecificStyles = false;
            if (typeof name === 'string') {
                nameStr = name;
            }
            else {
                nameStr = name.name;
                wrapSymbol = (_a = name.wrapSymbol) !== null && _a !== void 0 ? _a : '[]';
                nameSpecificStyles = {
                    color: name.color,
                    backgroundColor: name.backgroundColor,
                    bold: name.bold,
                    italic: name.italic,
                    underline: name.underline,
                    strikethrough: name.strikethrough,
                };
                useNameSpecificStyles = Object.values(nameSpecificStyles).some(style => style !== undefined);
            }
            const nameStylesToApply = useNameSpecificStyles
                ? nameSpecificStyles
                : (onlyOptionsProvided ? mainStyles : {});
            const nameStrStyled = applyStyles(wrapWithSymbol(nameStr, wrapSymbol), nameStylesToApply);
            prefix += nameStrStyled + ' ';
        }
        const { dateFlowOptions, separatorOptions } = options;
        if (dateFlowOptions) {
            const dateOptions = dateFlowOptions === true ? {} : dateFlowOptions;
            const dateSpecificStyles = {
                color: dateOptions.color,
                backgroundColor: dateOptions.backgroundColor,
                bold: dateOptions.bold,
                italic: dateOptions.italic,
                underline: dateOptions.underline,
                strikethrough: dateOptions.strikethrough
            };
            const useDateSpecificStyles = Object.values(dateSpecificStyles).some(style => style !== undefined);
            const dateStylesToApply = useDateSpecificStyles
                ? dateSpecificStyles
                : (onlyOptionsProvided ? mainStyles : {});
            const now = new dateflow_1.DateFlow({
                date: dateOptions.date || new Date(),
                dateFormat: dateOptions.format || 'YYYY-MM-DD HH:mm:ss',
            });
            const dateStrRaw = now.format();
            const dateStrStyled = applyStyles(dateStrRaw, dateStylesToApply);
            const separatorOpts = separatorOptions || {};
            const separatorSpecificStyles = {
                backgroundColor: separatorOpts.backgroundColor,
                color: separatorOpts.color,
                bold: separatorOpts.bold,
                italic: separatorOpts.italic,
                underline: separatorOpts.underline,
                strikethrough: separatorOpts.strikethrough
            };
            const useSeparatorSpecificStyles = Object.values(separatorSpecificStyles).some(style => style !== undefined);
            const separatorStylesToApply = useSeparatorSpecificStyles
                ? separatorSpecificStyles
                : (onlyOptionsProvided ? mainStyles : {});
            const separatorStrRaw = separatorOpts.separator ? ` ${separatorOpts.separator.trim()} ` : ` `;
            const separatorStrStyled = applyStyles(separatorStrRaw, separatorStylesToApply);
            prefix += dateStrStyled + separatorStrStyled;
        }
        if (onlyOptionsProvided) {
            finalMessage = '';
        }
        console.log(prefix + finalMessage);
    }
    mergeOptions(defaultOptions, userArgs) {
        let userOptions = {};
        let messages;
        if (userArgs.length > 0) {
            const lastArg = userArgs[userArgs.length - 1];
            if (isLogOptions(lastArg)) {
                userOptions = lastArg;
                messages = userArgs.slice(0, -1);
            }
            else {
                messages = userArgs;
            }
        }
        else {
            messages = [];
        }
        const finalOptions = Object.assign(Object.assign({}, defaultOptions), userOptions);
        if (typeof defaultOptions.name === 'object' && typeof userOptions.name === 'object') {
            finalOptions.name = Object.assign(Object.assign({}, defaultOptions.name), userOptions.name);
        }
        if (typeof defaultOptions.dateFlowOptions === 'object' && typeof userOptions.dateFlowOptions === 'object') {
            finalOptions.dateFlowOptions = Object.assign(Object.assign({}, defaultOptions.dateFlowOptions), userOptions.dateFlowOptions);
        }
        if (typeof defaultOptions.separatorOptions === 'object' && typeof userOptions.separatorOptions === 'object') {
            finalOptions.separatorOptions = Object.assign(Object.assign({}, defaultOptions.separatorOptions), userOptions.separatorOptions);
        }
        return { messages, options: finalOptions };
    }
    danger(...args) {
        const defaultOptions = {
            color: colors_1.RGB.red[500],
            name: {
                name: "DANGER",
                color: colors_1.RGB.red[700],
                bold: true
            }
        };
        const { messages, options } = this.mergeOptions(defaultOptions, args);
        this.log(...messages, options);
    }
    warn(...args) {
        const defaultOptions = {
            color: colors_1.RGB.yellow[500],
            name: {
                name: "WARN",
                color: colors_1.RGB.yellow[700],
                bold: true
            }
        };
        const { messages, options } = this.mergeOptions(defaultOptions, args);
        this.log(...messages, options);
    }
    info(...args) {
        const defaultOptions = {
            color: colors_1.RGB.blue[500],
            name: {
                name: "INFO",
                color: colors_1.RGB.blue[700],
                bold: true
            }
        };
        const { messages, options } = this.mergeOptions(defaultOptions, args);
        this.log(...messages, options);
    }
    success(...args) {
        const defaultOptions = {
            color: colors_1.RGB.green[500],
            name: {
                name: "SUCCESS",
                color: colors_1.RGB.green[700],
                bold: true
            }
        };
        const { messages, options } = this.mergeOptions(defaultOptions, args);
        this.log(...messages, options);
    }
    verbose(...args) {
        const defaultOptions = {
            color: colors_1.RGB.gray[500],
            name: {
                name: "VERBOSE",
                color: colors_1.RGB.gray[600],
            },
            formatObject: true
        };
        const { messages, options } = this.mergeOptions(defaultOptions, args);
        if (options.formatObject !== false) {
            options.formatObject = true;
        }
        this.log(...messages, options);
    }
}
exports.Informator = Informator;
