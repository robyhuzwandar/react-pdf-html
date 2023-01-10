import React from 'react';
import { HtmlRenderers } from './render';
import { HtmlStyle, HtmlStyles } from './styles';
export type HtmlProps = {
    collapse?: boolean;
    renderers?: HtmlRenderers;
    style?: HtmlStyle | (HtmlStyle | undefined)[];
    stylesheet?: HtmlStyles | HtmlStyles[];
    resetStyles?: boolean;
    children: string;
};
declare const Html: React.FC<HtmlProps>;
export default Html;
