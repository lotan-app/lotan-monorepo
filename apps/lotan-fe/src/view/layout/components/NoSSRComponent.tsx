import React, { ReactNode } from "react";

interface NoSSRComponentProps {
  children: ReactNode;
}

const NoSSRComponent: React.FC<NoSSRComponentProps> = ({ children }) => {
  return <>{children}</>;
};

export default NoSSRComponent;
