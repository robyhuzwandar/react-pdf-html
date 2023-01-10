import React from 'react';
import { HtmlRenderer, HtmlRenderers } from './render';
export declare const renderNoop: HtmlRenderer;
export declare const renderPassThrough: React.FC<React.PropsWithChildren<any>>;
export declare const renderBlock: HtmlRenderer;
export declare const renderInline: HtmlRenderer;
export declare const renderCell: HtmlRenderer;
declare const renderers: HtmlRenderers;
export default renderers;
