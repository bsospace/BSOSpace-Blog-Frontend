declare module "react-quill" {
  import { Component } from "react";

  interface ReactQuillProps {
    value: string;
    onChange: (content: string) => void;
    modules?: object;
    formats?: string[];
    bounds?: string | HTMLElement;
    placeholder?: string;
    theme?: string;
    readOnly?: boolean;
    style?: React.CSSProperties;
    preserveWhitespace?: boolean;
    scrollingContainer?: string | HTMLElement;
    tabIndex?: number;
  }

  class ReactQuill extends Component<ReactQuillProps> {}

  export default ReactQuill;
}
