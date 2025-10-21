declare module 'react-native-mathjax' {
  import { Component } from 'react';
  import { TextStyle, ViewStyle } from 'react-native';

  export interface MathJaxProps {
    html: string;
    style?: ViewStyle | TextStyle;
    mathJaxOptions?: any;
    renderError?: (error: unknown) => JSX.Element;
  }

  export default class MathJax extends Component<MathJaxProps> {}
}


