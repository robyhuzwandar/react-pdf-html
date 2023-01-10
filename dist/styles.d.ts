import { Style } from '@react-pdf/types';
import { Tag } from './tags';
export type HtmlStyle = (Style & {
    listStyle?: string;
    listStyleType?: string;
    borderSpacing?: number | string;
    borderCollapse?: string;
}) | any;
export type HtmlStyles = Record<Tag | string, HtmlStyle>;
export declare const createHtmlStylesheet: <T extends HtmlStyles>(fontSize: number, reset?: boolean) => HtmlStyles;
