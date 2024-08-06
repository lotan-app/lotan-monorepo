export interface INavList {
  title: string;
  path?: string;
  link?: string;
  icon?: React.JSX.Element;
  anim?: string;
  nested?: INavList[];
  coming?: boolean;
  smallText?: string;
}
