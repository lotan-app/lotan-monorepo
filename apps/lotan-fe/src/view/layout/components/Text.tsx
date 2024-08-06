import React, { FC } from "react";
import { styleCombine } from "@Common/helper";
import styles from "@View/layout/assets/text.module.scss";

interface TextProps {
  className?: string;
  size?: number;
  fontWeight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  manyLines?: boolean;
  style?: any;
  title?: string;
  color?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const Text: FC<TextProps> = ({
  children,
  className,
  size,
  fontWeight,
  manyLines = true,
  style,
  onClick,
  title,
  color,
  ...otherProps
}) => {
  const mainClassname = [];
  const mainStyle = { ...style };
  if (className) {
    mainClassname.push(className);
  }
  if (size) {
    mainClassname.push(styles[`font-${size}`]);
  }
  if (fontWeight) {
    mainStyle.fontWeight = fontWeight;
  }

  if (!manyLines) {
    mainStyle.whiteSpace = "nowrap";
    mainStyle.textOverflow = "ellipsis";
    mainStyle.overflow = "hidden";
  }
  if (color) {
    mainStyle.color = `var(--${color})`;
  }
  return (
    <div
      onClick={onClick}
      className={styleCombine(mainClassname.join(" "))}
      style={mainStyle}
      title={title}
      {...otherProps}
    >
      {children}
    </div>
  );
};

export default Text;
