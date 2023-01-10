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
Object.defineProperty(exports, "__esModule", { value: true });
const parse_1 = __importStar(require("./parse"));
describe('parse', () => {
    describe('convertStylesheet', () => {
        it('Should convert CSS into HtmlStyles', () => {
            const content = `.my-heading4, #foobar, div > li {
        background: darkgreen;
        color: white;
      }
      div {
        span {
          fontWeight: bold;
        }
      }
      pre {
        background-color: #eee;
        padding: 10px;
      }`;
            const result = (0, parse_1.convertStylesheet)(content);
            const expected = {
                '.my-heading4': {
                    backgroundColor: 'darkgreen',
                    color: 'white',
                },
                '#foobar': {
                    backgroundColor: 'darkgreen',
                    color: 'white',
                },
                div: {
                // TODO: support nested styles
                },
                'div>li': {
                    backgroundColor: 'darkgreen',
                    color: 'white',
                },
                pre: {
                    backgroundColor: '#eee',
                    padding: '10px',
                },
            };
            expect(result).toEqual(expected);
        });
        it('Should handle empty', () => {
            const content = ``;
            const result = (0, parse_1.convertStylesheet)(content);
            const expected = {};
            expect(result).toEqual(expected);
        });
    });
    describe('convertElementStyle', () => {
        it('Should convert element CSS into HtmlStyle', () => {
            const content = `background: darkgreen;color: white;bogus: nope`;
            const result = (0, parse_1.convertElementStyle)(content, 'div');
            const expected = {
                backgroundColor: 'darkgreen',
                bogus: 'nope',
                color: 'white',
            };
            expect(result).toEqual(expected);
        });
        it('Should handle empty', () => {
            const content = ``;
            const result = (0, parse_1.convertElementStyle)(content, 'div');
            const expected = {};
            expect(result).toEqual(expected);
        });
    });
    describe('parseHtml', () => {
        it('Should convert HTML into a JSON tree', () => {
            const content = `
Welcome to your <b>doom!</b>:
<p>
    <ul>
        <li>First item</li>
        <li>Second item: <a href="http://google.com">google.com</a></li>
    </ul>
</p>
      `;
            const result = (0, parse_1.default)(content);
            const root = result.rootElement;
            expect(root.content[0]).toEqual('\nWelcome to your ');
            expect(root.content[1].tag).toEqual('b');
            expect(root.content[1].content).toEqual(['doom!']);
            expect(root.content[2]).toEqual(':\n');
            const paragraph = root.content[3];
            expect(paragraph.tag).toEqual('p');
            expect(paragraph.content[0]).toEqual('\n    ');
            const list = paragraph.content[1];
            expect(list.tag).toEqual('ul');
            const listItem1 = list.content[1];
            expect(listItem1.tag).toBe('li');
            expect(listItem1.content).toEqual(['First item']);
            expect(listItem1.indexOfType).toEqual(0);
            const listItem2 = list.content[3];
            expect(listItem2.tag).toBe('li');
            expect(listItem2.content[0]).toEqual('Second item: ');
            expect(listItem2.indexOfType).toEqual(1);
            const link = listItem2.content[1];
            expect(link.tag).toBe('a');
            expect(link.attributes.href).toBe('http://google.com');
            expect(link.content).toEqual(['google.com']);
        });
    });
});
//# sourceMappingURL=parse.test.js.map