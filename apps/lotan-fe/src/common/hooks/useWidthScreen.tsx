import { useEffect, useState } from "react";

const useWidthScreen = () => {
  function getSize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    return { width, height };
  }
  const [windowSize, setWindowSize] = useState({ width: null, height: null });

  function handleResize() {
    setWindowSize(getSize());
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      handleResize();

      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);
  return windowSize;
};
export { useWidthScreen };
