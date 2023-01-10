import { HTMLElement, Node as HTMLNode } from 'node-html-parser';
import { Tag } from './tags';
import { Block } from 'css-tree';
import { HtmlStyle, HtmlStyles } from './styles';
export type HtmlContent = (HtmlElement | string)[];
export type HtmlElement = HTMLElement & {
    tag: Tag | 'string';
    parentNode: HtmlElement;
    style: HtmlStyle[];
    content: HtmlContent;
    indexOfType: number;
    querySelectorAll: (selector: string) => HtmlElement[];
    querySelector: (selector: string) => HtmlElement;
};
export declare const convertRule: (rule: Block, source?: string) => HtmlStyle;
export declare const convertStylesheet: (stylesheet: string) => HtmlStyles;
export declare const convertElementStyle: (styleAttr: string, tag: string) => HtmlStyle | undefined;
export declare const convertNode: (node: HTMLNode) => HtmlElement | string;
declare const parseHtml: (text: string) => {
    stylesheets: HtmlStyles[];
    rootElement: HtmlElement;
};
export default parseHtml;
