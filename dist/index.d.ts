import { RGB, HEX, TailwindRgbColorValue } from './colors';
import { emoji } from './emojis';
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
} & StyleOptions;
type SeparatorOptions = {
    separator?: string;
    backgroundColor?: TailwindRgbColorValue;
    color?: TailwindRgbColorValue;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
} & StyleOptions;
type LogOptions = {
    color?: TailwindRgbColorValue;
    backgroundColor?: TailwindRgbColorValue;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    formatObject?: boolean;
    dateFlowOptions?: DateFlowOptions | true;
    separatorOptions?: SeparatorOptions;
    name?: string | StyleOptions & {
        name: string;
        useWrapSymbol?: boolean;
        wrapSymbol?: WrapSymbol;
    };
};
type StyleOptions = {
    color?: TailwindRgbColorValue;
    backgroundColor?: TailwindRgbColorValue;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
};
export declare class Informator {
    constructor();
    log(...args: any[]): void;
    mergeOptions(defaultOptions: LogOptions, userArgs: any[]): {
        messages: any[];
        options: LogOptions;
    };
    danger(...args: any[]): void;
    warn(...args: any[]): void;
    info(...args: any[]): void;
    success(...args: any[]): void;
    verbose(...args: any[]): void;
}
