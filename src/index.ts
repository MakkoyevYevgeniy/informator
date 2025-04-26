import { DateFlow, DateFormatType } from 'dateflow';
import { RGB, HEX, TailwindRgbColorValue } from './colors';
import { emoji } from './emojis';   
import { inspect } from 'util';

// --- Exported Types ---
export type { TailwindRgbColorValue, StyleOptions, DateFlowOptions, SeparatorOptions, LogOptions };
export { RGB, HEX };
export { emoji };

type WrapSymbol = '[]' | '()' | '{}' | '<>' | '';

type DateFlowOptions = {
    format?: string;
    date?: Date;
    color?: TailwindRgbColorValue;
    backgroundColor?: TailwindRgbColorValue;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
} & StyleOptions; // Make sure StyleOptions is defined before or imported

type SeparatorOptions = {
    separator?: string;
    backgroundColor?: TailwindRgbColorValue;
    color?: TailwindRgbColorValue;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
} & StyleOptions; // Make sure StyleOptions is defined before or imported

type LogOptions = {
    color?: TailwindRgbColorValue;
    backgroundColor?: TailwindRgbColorValue;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    formatObject?: boolean;
    dateFlowOptions?: DateFlowOptions | true
    separatorOptions?: SeparatorOptions;
    name?: string | StyleOptions & {
        name: string,
        useWrapSymbol?: boolean,
        wrapSymbol?: WrapSymbol,
    };
};

type StyleOptions = {
    color?: TailwindRgbColorValue;
    backgroundColor?: TailwindRgbColorValue;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
}

function applyStyles(text: string, styles: StyleOptions = {}): string {
    const codes: string[] = [];
    if (styles.bold) codes.push('1');
    if (styles.italic) codes.push('3');
    if (styles.underline) codes.push('4');
    if (styles.strikethrough) codes.push('9');
    if (styles.color) codes.push(`38;2;${styles.color.r};${styles.color.g};${styles.color.b}`);
    if (styles.backgroundColor) codes.push(`48;2;${styles.backgroundColor.r};${styles.backgroundColor.g};${styles.backgroundColor.b}`);

    if (codes.length === 0) {
        return text;
    }

    return `\u001b[${codes.join(';')}m${text}\u001b[0m`;
}

function isLogOptions(obj: any): obj is LogOptions {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
        return false;
    }
    const objKeys = Object.keys(obj);
    if (objKeys.length === 0) {
        return true;
    }

    const strongOptionKeys: (keyof LogOptions)[] = ['dateFlowOptions', 'separatorOptions'];
    const weakOptionKeysSet = new Set<string>(['color', 'backgroundColor', 'name', 'bold', 'italic', 'underline', 'strikethrough', 'formatObject']);

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

function formatForLog(arg: any, formatObject: boolean = false): string {
     if (typeof arg === 'string') {
        return arg;
    } else if (typeof arg === 'object' && arg !== null) {
        try {
             if (typeof process === 'object' && process.versions && process.versions.node) {
                 return inspect(arg, { depth: null, colors: formatObject });
             } else {
                 return JSON.stringify(arg);
             }
        } catch (e) {
             return String(arg);
        }
    } else {
        return String(arg);
    }
}

function wrapWithSymbol(nameStr: string, wrapSymbol: WrapSymbol): string {
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

export class Informator {
    constructor() {}

    log(...args: any[]): void {
        let options: LogOptions = {};
        let messages: any[];
        let onlyOptionsProvided = false;

        if (args.length > 0) {
            const lastArg = args[args.length - 1];
            if (isLogOptions(lastArg)) {
                options = lastArg;
                messages = args.slice(0, -1);
                if (messages.length === 0) {
                    onlyOptionsProvided = true;
                }
            } else {
                messages = args;
            }
        } else {
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

        const mainStyles: StyleOptions = {
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
            let nameStr: string;
            let wrapSymbol: WrapSymbol = '[]';
            let nameSpecificStyles: StyleOptions = {};
            let useNameSpecificStyles = false;

            if (typeof name === 'string') {
                nameStr = name;
            } else {
                nameStr = name.name;
                wrapSymbol = name.wrapSymbol ?? '[]';

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
            const dateSpecificStyles: StyleOptions = {
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

            const now = new DateFlow({
                date: dateOptions.date || new Date(),
                dateFormat: (dateOptions.format as DateFormatType) || 'YYYY-MM-DD HH:mm:ss',
            });
            const dateStrRaw = now.format();
            const dateStrStyled = applyStyles(dateStrRaw, dateStylesToApply);

            const separatorOpts = separatorOptions || {};
            const separatorSpecificStyles: StyleOptions = {
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

    mergeOptions(defaultOptions: LogOptions, userArgs: any[]): { messages: any[], options: LogOptions } {
        let userOptions: LogOptions = {};
        let messages: any[];

        if (userArgs.length > 0) {
            const lastArg = userArgs[userArgs.length - 1];
            if (isLogOptions(lastArg)) {
                userOptions = lastArg;
                messages = userArgs.slice(0, -1);
            } else {
                messages = userArgs;
            }
        } else {
            messages = [];
        }

        const finalOptions = { ...defaultOptions, ...userOptions };

        if (typeof defaultOptions.name === 'object' && typeof userOptions.name === 'object') {
            finalOptions.name = { ...defaultOptions.name, ...userOptions.name };
        }
        if (typeof defaultOptions.dateFlowOptions === 'object' && typeof userOptions.dateFlowOptions === 'object') {
            finalOptions.dateFlowOptions = { ...defaultOptions.dateFlowOptions, ...userOptions.dateFlowOptions };
        }
        if (typeof defaultOptions.separatorOptions === 'object' && typeof userOptions.separatorOptions === 'object') {
            finalOptions.separatorOptions = { ...defaultOptions.separatorOptions, ...userOptions.separatorOptions };
        }

        return { messages, options: finalOptions };
    }

    danger(...args: any[]): void {
        const defaultOptions: LogOptions = {
            color: RGB.red[500],
            name: {
                name: "DANGER",
                color: RGB.red[700],
                bold: true
            }
        };
        const { messages, options } = this.mergeOptions(defaultOptions, args);
        this.log(...messages, options);
    }

    warn(...args: any[]): void {
        const defaultOptions: LogOptions = {
            color: RGB.yellow[500],
            name: {
                name: "WARN",
                color: RGB.yellow[700],
                bold: true
            }
        };
        const { messages, options } = this.mergeOptions(defaultOptions, args);
        this.log(...messages, options);
    }

    info(...args: any[]): void {
        const defaultOptions: LogOptions = {
            color: RGB.blue[500],
            name: {
                name: "INFO",
                color: RGB.blue[700],
                bold: true
            }
        };
        const { messages, options } = this.mergeOptions(defaultOptions, args);
        this.log(...messages, options);
    }

    success(...args: any[]): void {
        const defaultOptions: LogOptions = {
            color: RGB.green[500],
            name: {
                name: "SUCCESS",
                color: RGB.green[700],
                bold: true
            }
        };
        const { messages, options } = this.mergeOptions(defaultOptions, args);
        this.log(...messages, options);
    }

    verbose(...args: any[]): void {
        const defaultOptions: LogOptions = {
            color: RGB.gray[500],
            name: {
                name: "VERBOSE",
                color: RGB.gray[600],
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