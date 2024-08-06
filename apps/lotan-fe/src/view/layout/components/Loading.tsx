import React, { FC } from "react";
import styles from "@View/layout/assets/loading.module.scss";
import { getCurrentPixelSize } from "@App/common/helper";

interface IBarLoadingProps {
  size: number;
}

const BarLoading: FC<IBarLoadingProps> = ({ size = 16 }) => {
  const currentPixelSize = getCurrentPixelSize();
  const emSize = size / currentPixelSize;
  return (
    <div
      className={styles.bar_loading_style}
      style={{ width: `${emSize}em`, height: `${emSize}em` }}
    >
      {[...Array(12).keys()].map((_, i) => (
        <div
          style={{ transformOrigin: `${emSize / 2}em ${emSize / 2}em` }}
          key={i}
        >
          <span
            style={{
              top: `${emSize * 0.0375}em`,
              left: `${emSize * 0.4625}em`,
              height: `${emSize * 0.1684}em`,
              width: `${emSize * 0.1}em`,
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default BarLoading;
