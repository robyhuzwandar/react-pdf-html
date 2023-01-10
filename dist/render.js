"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyStylesheets = exports.renderElements = exports.renderBucketElement = exports.collapseWhitespace = exports.renderElement = exports.bucketElements = exports.hasBlockContent = exports.isBlockStyle = void 0;
const react_1 = __importDefault(require("react"));
const renderers_1 = __importStar(require("./renderers"));
const renderer_1 = require("@react-pdf/renderer");
const parse_1 = __importDefault(require("./parse"));
const styles_1 = require("./styles");
const tags_1 = require("./tags");
const convertEntities = (input) => {
    const entities = [
        ['amp', '&'],
        ['apos', "'"],
        ['#x27', "'"],
        ['#x2F', '/'],
        ['#39', "'"],
        ['#47', '/'],
        ['lt', '<'],
        ['gt', '>'],
        ['nbsp', ' '],
        ['quot', '"'],
    ];
    let text = input;
    for (let entity of entities) {
        text = text.replace(new RegExp('&' + entity[0] + ';', 'g'), entity[1]);
    }
    return text;
};
const isBlockStyle = (style) => ['block', 'flex'].includes(style.display);
exports.isBlockStyle = isBlockStyle;
const hasBlockContent = (element) => {
    var _a;
    if (typeof element === 'string') {
        return false;
    }
    if (element.tag === 'a' || tags_1.isText[element.tag]) {
        if ((_a = element.style) === null || _a === void 0 ? void 0 : _a.some(exports.isBlockStyle)) {
            return true;
        }
        // anchor tags match their content
        if (element.content) {
            return element.content.some(exports.hasBlockContent);
        }
        return false;
    }
    return true;
};
exports.hasBlockContent = hasBlockContent;
const ltrim = (text) => text.replace(/^\s+/, '');
const rtrim = (text) => text.replace(/\s+$/, '');
/**
 * Groups all block and non-block elements into buckets so that all non-block elements can be rendered in a parent Text element
 * @param elements Elements to place in buckets of block and non-block content
 * @param collapse
 * @param parentTag
 */
const bucketElements = (elements, collapse, parentTag) => {
    let bucket;
    let hasBlock;
    const buckets = [];
    elements.forEach((element, index) => {
        // clear empty strings between block elements
        if (typeof element === 'string') {
            if (collapse) {
                if (parentTag === 'pre') {
                    if (element[0] === '\n') {
                        element = element.substr(1);
                    }
                    if (element[element.length - 1] === '\n') {
                        element = element.substr(0, element.length - 1);
                    }
                }
                else {
                    if (hasBlock || hasBlock === undefined) {
                        element = ltrim(element);
                    }
                    const next = elements[index + 1];
                    if (next && (0, exports.hasBlockContent)(next)) {
                        element = rtrim(element);
                    }
                }
            }
            if (element === '') {
                return;
            }
        }
        const block = (0, exports.hasBlockContent)(element);
        if (block !== hasBlock) {
            hasBlock = block;
            bucket = {
                hasBlock,
                content: [],
            };
            buckets.push(bucket);
        }
        bucket.content.push(element);
    });
    return buckets;
};
exports.bucketElements = bucketElements;
const renderElement = (element, stylesheets, renderers, children, index) => {
    if (typeof element === 'string') {
        element = convertEntities(element);
        if (/(\s )|( \s)/.test(element)) {
            // hack to avoid collapsing sequential spaces
            return element
                .split(/(\s{2,})/g)
                .reduce((strings, string, index) => string === ''
                ? strings
                : strings.concat(index % 2 ? string.split('') : string), []);
        }
        return element;
    }
    let Element = renderers[element.tag];
    if (!Element) {
        if (!(element.tag in tags_1.isText)) {
            // Unknown element, do nothing
            console.warn(`Excluding "${element.tag}" because it has no renderer`);
            Element = renderers_1.renderNoop;
        }
        else {
            Element = (0, exports.hasBlockContent)(element) ? renderers_1.renderBlock : renderers_1.renderInline;
        }
    }
    return (react_1.default.createElement(Element, { key: index, style: element.style, children: children, element: element, stylesheets: stylesheets }));
};
exports.renderElement = renderElement;
const collapseWhitespace = (string) => string.replace(/(\s+)/g, ' ');
exports.collapseWhitespace = collapseWhitespace;
const renderBucketElement = (element, options, index) => {
    if (typeof element === 'string') {
        return (0, exports.renderElement)(options.collapse ? (0, exports.collapseWhitespace)(element) : element, options.stylesheets, options.renderers, undefined, index);
    }
    return (0, exports.renderElement)(element, options.stylesheets, options.renderers, (0, exports.renderElements)(element.content, element.tag === 'pre' ? Object.assign(Object.assign({}, options), { collapse: false }) : options, element), index);
};
exports.renderBucketElement = renderBucketElement;
const isAnchor = (content) => {
    return Array.isArray(content)
        ? content.length === 1 &&
            typeof content[0] !== 'string' &&
            content[0].tag === 'a'
        : content.tag === 'a';
};
const renderElements = (elements, options, parent) => {
    const buckets = (0, exports.bucketElements)(elements, options.collapse, parent === null || parent === void 0 ? void 0 : parent.tag);
    const parentIsText = parent && !isAnchor(parent) && !(0, exports.hasBlockContent)(parent);
    const renderedBuckets = buckets.map((bucket, bucketIndex) => {
        const wrapWithText = !bucket.hasBlock && !parentIsText && !isAnchor(bucket.content);
        // Avoid extra array
        if (bucket.content.length === 1 && !wrapWithText) {
            return (0, exports.renderBucketElement)(bucket.content[0], options, bucketIndex);
        }
        let rendered = bucket.content.map((element, index) => {
            return (0, exports.renderBucketElement)(element, options, index);
        });
        // unwrap extra array
        if (rendered.length === 1) {
            rendered = rendered[0];
        }
        if (wrapWithText) {
            return react_1.default.createElement(renderer_1.Text, { key: bucketIndex }, rendered);
        }
        else {
            return buckets.length === 1 ? (rendered) : (react_1.default.createElement(react_1.default.Fragment, { key: bucketIndex }, rendered));
        }
    });
    // unwrap extra array
    return buckets.length === 1
        ? renderedBuckets[0]
        : renderedBuckets;
};
exports.renderElements = renderElements;
const applyStylesheets = (stylesheets, rootElement) => {
    stylesheets.forEach((stylesheet) => {
        for (const selector of Object.keys(stylesheet)) {
            const elements = rootElement.querySelectorAll(selector);
            elements.forEach((element) => {
                element.style.push(stylesheet[selector]);
            });
        }
    });
};
exports.applyStylesheets = applyStylesheets;
const renderHtml = (text, options = {}) => {
    const defaultFontSize = 18;
    const fontSizeStyle = { fontSize: defaultFontSize };
    const styles = options.style
        ? Array.isArray(options.style)
            ? options.style
            : [options.style]
        : [];
    styles.forEach((style) => {
        if (!style) {
            return;
        }
        if (typeof style.fontSize === 'number') {
            fontSizeStyle.fontSize = style.fontSize;
        }
        if (typeof style.fontSize === 'string' && style.fontSize.endsWith('px')) {
            fontSizeStyle.fontSize = parseInt(style.fontSize, 10);
        }
    });
    const baseStyles = (0, styles_1.createHtmlStylesheet)(fontSizeStyle.fontSize, options.resetStyles);
    const parsed = (0, parse_1.default)(text);
    const stylesheets = options.stylesheet
        ? Array.isArray(options.stylesheet)
            ? options.stylesheet
            : [options.stylesheet]
        : [];
    const opts = Object.assign(Object.assign({ collapse: true, resetStyles: false }, options), { renderers: Object.assign(Object.assign({}, renderers_1.default), options.renderers), stylesheets: [baseStyles, ...stylesheets, ...parsed.stylesheets] });
    (0, exports.applyStylesheets)(opts.stylesheets, parsed.rootElement);
    return (react_1.default.createElement(renderer_1.View, { style: Object.assign(Object.assign({}, styles), fontSizeStyle) }, (0, exports.renderElements)(parsed.rootElement.content, opts)));
};
exports.default = renderHtml;
//# sourceMappingURL=render.js.map