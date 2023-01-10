"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const render_1 = __importDefault(require("./render"));
const Html = (props) => {
    return react_1.default.createElement(react_1.default.Fragment, null, (0, render_1.default)(props.children, props));
};
exports.default = Html;
//# sourceMappingURL=Html.js.map