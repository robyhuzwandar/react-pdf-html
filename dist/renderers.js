"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderCell = exports.renderInline = exports.renderBlock = exports.renderPassThrough = exports.renderNoop = void 0;
const react_1 = __importDefault(require("react"));
const renderer_1 = require("@react-pdf/renderer");
const ordered_type_1 = require("./ordered.type");
const renderNoop = ({ children }) => react_1.default.createElement(react_1.default.Fragment, null);
exports.renderNoop = renderNoop;
const renderPassThrough = ({ children, }) => children;
exports.renderPassThrough = renderPassThrough;
const renderBlock = ({ style, children }) => (react_1.default.createElement(renderer_1.View, { style: style }, children));
exports.renderBlock = renderBlock;
const renderInline = ({ style, children }) => (react_1.default.createElement(renderer_1.Text, { style: style }, children));
exports.renderInline = renderInline;
const renderCell = ({ style, element, children }) => {
    const table = element.closest('table');
    if (!table) {
        throw new Error('td element rendered outside of a table');
    }
    const tableStyles = table.style.reduce((combined, tableStyle) => Object.assign(combined, tableStyle), {});
    const baseStyles = {
        border: tableStyles.border,
        borderColor: tableStyles.borderColor,
        borderWidth: tableStyles.borderWidth,
        borderStyle: tableStyles.borderStyle,
    };
    if (tableStyles.borderSpacing &&
        tableStyles.borderCollapse !== 'collapse') {
        baseStyles.width = tableStyles.borderWidth;
        baseStyles.margin = tableStyles.borderSpacing;
    }
    else {
        baseStyles.borderRightWidth = 0;
        baseStyles.borderBottomWidth = 0;
        if (element.indexOfType !== 0) {
            baseStyles.borderLeftWidth = tableStyles.borderWidth;
            baseStyles.borderTopWidth = tableStyles.borderWidth;
        }
    }
    const overrides = {};
    if (element.attributes && element.attributes.colspan) {
        const colspan = parseInt(element.attributes.colspan, 10);
        if (!isNaN(colspan)) {
            overrides.flexBasis = colspan;
        }
    }
    return react_1.default.createElement(renderer_1.View, { style: [baseStyles, ...style, overrides] }, children);
};
exports.renderCell = renderCell;
const renderers = {
    style: exports.renderNoop,
    script: exports.renderNoop,
    html: exports.renderPassThrough,
    li: ({ element, stylesheets, style, children }) => {
        var _a;
        const bulletStyles = stylesheets.map((stylesheet) => stylesheet.li_bullet);
        const contentStyles = stylesheets.map((stylesheet) => stylesheet.li_content);
        const list = element.closest('ol, ul');
        const ordered = (list === null || list === void 0 ? void 0 : list.tag) === 'ol' || element.parentNode.tag === 'ol';
        const listStyle = ((_a = list === null || list === void 0 ? void 0 : list.style) === null || _a === void 0 ? void 0 : _a.reduce((combined, listStyle) => Object.assign(combined, listStyle), {})) || {};
        const itemStyle = element.style.reduce((combined, itemStyle) => Object.assign(combined, itemStyle), {});
        const listStyleType = itemStyle.listStyleType ||
            itemStyle.listStyle ||
            listStyle.listStyleType ||
            listStyle.listStyle ||
            '';
        let bullet;
        if (listStyleType.includes('none')) {
            bullet = false;
        }
        else if (listStyleType.includes('url(')) {
            bullet = (react_1.default.createElement(renderer_1.Image, { src: listStyleType.match(/\((.*?)\)/)[1].replace(/(['"])/g, '') }));
        }
        else if (ordered) {
            if (ordered_type_1.lowerAlpha.includes(listStyleType)) {
                bullet = (react_1.default.createElement(renderer_1.Text, null,
                    ordered_type_1.orderedAlpha[element.indexOfType].toLowerCase(),
                    "."));
            }
            else if (ordered_type_1.upperAlpha.includes(listStyleType)) {
                bullet = (react_1.default.createElement(renderer_1.Text, null,
                    ordered_type_1.orderedAlpha[element.indexOfType].toUpperCase(),
                    "."));
            }
            else {
                bullet = react_1.default.createElement(renderer_1.Text, null,
                    element.indexOfType + 1,
                    ".");
            }
        }
        else {
            // if (listStyleType.includes('square')) {
            //   bullet = <Text>■</Text>;
            // } else {
            bullet = react_1.default.createElement(renderer_1.Text, null, "\u2022");
            // }
        }
        return (react_1.default.createElement(renderer_1.View, { style: style },
            bullet && react_1.default.createElement(renderer_1.View, { style: bulletStyles }, bullet),
            react_1.default.createElement(renderer_1.View, { style: contentStyles }, children)));
    },
    a: ({ style, element, children }) => (react_1.default.createElement(renderer_1.Link, { style: style, src: element.attributes.href }, children)),
    img: ({ style, element }) => (react_1.default.createElement(renderer_1.Image, { style: style, src: element.attributes.src })),
    table: ({ element, style, children }) => {
        const tableStyles = element.style.reduce((combined, tableStyle) => Object.assign(combined, tableStyle), {});
        const overrides = {};
        if (!tableStyles.borderSpacing ||
            tableStyles.borderCollapse === 'collapse') {
            overrides.borderLeftWidth = 0;
            overrides.borderTopWidth = 0;
        }
        return react_1.default.createElement(renderer_1.View, { style: [...style, overrides] }, children);
    },
    tr: ({ style, children }) => (react_1.default.createElement(renderer_1.View, { wrap: false, style: style }, children)),
    br: ({ style }) => (react_1.default.createElement(renderer_1.Text, { wrap: false, style: style }, '\n')),
    td: exports.renderCell,
    th: exports.renderCell,
};
exports.default = renderers;
//# sourceMappingURL=renderers.js.map