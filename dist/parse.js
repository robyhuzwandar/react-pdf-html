"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertNode = exports.convertElementStyle = exports.convertStylesheet = exports.convertRule = void 0;
const node_html_parser_1 = require("node-html-parser");
const css_tree_1 = __importDefault(require("css-tree"));
const supportedStyles_1 = __importDefault(require("./supportedStyles"));
const camelize = require('camelize');
const convertRule = (rule, source = 'style') => {
    const declarations = rule.children
        .filter((declaration) => declaration.type === 'Declaration')
        .toArray();
    return declarations
        .map((entry) => (Object.assign(Object.assign({}, entry), { property: camelize(entry.property) })))
        .reduce((style, { property, value }) => {
        let valueString = css_tree_1.default.generate(value);
        if (property && value) {
            if (property === 'fontFamily') {
                valueString = valueString.replace(/["']+/g, '');
                if (valueString.includes(',')) {
                    const reduced = valueString.split(',', 2)[0];
                    console.warn(`react-pdf doesn't support fontFamily lists like "${valueString}". Reducing to "${reduced}".`);
                    valueString = reduced;
                }
            }
            else if (!supportedStyles_1.default.includes(property)) {
                if ((property === 'background' &&
                    /^#?[a-zA-Z0-9]+$/.test(valueString)) ||
                    /^rgba?\([0-9, ]+\)$/i.test(valueString) ||
                    /^hsla?\([0-9.%, ]+\)$/i.test(valueString)) {
                    property = 'backgroundColor';
                }
                else {
                    console.warn(`${source}: Found unsupported style "${property}"`, {
                        property,
                        value,
                    });
                }
            }
            style[property] = valueString;
        }
        return style;
    }, {});
};
exports.convertRule = convertRule;
const convertStylesheet = (stylesheet) => {
    const response = {};
    try {
        const parsed = css_tree_1.default.parse(stylesheet);
        const rules = parsed.children.filter((rule) => { var _a; return rule.type === 'Rule' && ((_a = rule.prelude) === null || _a === void 0 ? void 0 : _a.type) === 'SelectorList'; });
        rules.forEach((rule) => {
            const style = (0, exports.convertRule)(rule.block);
            if (rule.prelude.type !== 'SelectorList') {
                return;
            }
            rule.prelude.children.forEach((selector) => {
                const selectorString = css_tree_1.default.generate(selector);
                response[selectorString] = style;
            });
        });
    }
    catch (e) {
        console.error(`Error parsing stylesheet: "${stylesheet}"`, e);
    }
    return response;
};
exports.convertStylesheet = convertStylesheet;
const convertElementStyle = (styleAttr, tag) => {
    try {
        const parsed = css_tree_1.default.parse(`${tag} { ${styleAttr} }`);
        const rules = parsed.children.filter((rule) => { var _a; return rule.type === 'Rule' && ((_a = rule.prelude) === null || _a === void 0 ? void 0 : _a.type) === 'SelectorList'; });
        const firstRule = rules.first();
        return firstRule ? (0, exports.convertRule)(firstRule.block, tag) : undefined;
    }
    catch (e) {
        console.error(`Error parsing style attribute "${styleAttr}" for tag: ${tag}`, e);
    }
};
exports.convertElementStyle = convertElementStyle;
const convertNode = (node) => {
    if (node.nodeType === node_html_parser_1.NodeType.TEXT_NODE) {
        return node.rawText;
    }
    if (node.nodeType === node_html_parser_1.NodeType.COMMENT_NODE) {
        return '';
    }
    if (node.nodeType !== node_html_parser_1.NodeType.ELEMENT_NODE) {
        throw new Error('Not sure what this is');
    }
    const html = node;
    const content = html.childNodes.map(exports.convertNode);
    const kindCounters = {};
    content.forEach((child) => {
        if (typeof child !== 'string') {
            child.indexOfType =
                child.tag in kindCounters
                    ? (kindCounters[child.tag] = kindCounters[child.tag] + 1)
                    : (kindCounters[child.tag] = 0);
        }
    });
    let style;
    if (html.attributes.style && html.attributes.style.trim()) {
        style = (0, exports.convertElementStyle)(html.attributes.style, html.tagName);
    }
    return Object.assign(html, {
        tag: (html.tagName || '').toLowerCase(),
        style: style ? [style] : [],
        content,
        indexOfType: 0,
    });
};
exports.convertNode = convertNode;
const parseHtml = (text) => {
    const html = (0, node_html_parser_1.parse)(text, { comment: false });
    const stylesheets = html
        .querySelectorAll('style')
        .map((styleNode) => styleNode.childNodes.map((textNode) => textNode.rawText.trim()).join('\n'))
        .filter((styleText) => !!styleText)
        .map(exports.convertStylesheet);
    return {
        stylesheets,
        rootElement: (0, exports.convertNode)(html),
    };
};
exports.default = parseHtml;
//# sourceMappingURL=parse.js.map