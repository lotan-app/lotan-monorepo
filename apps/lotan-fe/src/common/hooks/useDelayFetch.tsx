import { useRef, useEffect } from "react";

const useDelayFetch = (
  serviceCall: any,
  timeout: number
): typeof serviceCall => {
  const delayRef = useRef<any>();
  useEffect(() => {
    return () => {
      if (delayRef.current) {
        clearTimeout(delayRef.current);
      }
    };
  }, []);
  return (...arg: any[]) =>
    new Promise((resolve) => {
      if (delayRef.current) {
        clearTimeout(delayRef.current);
        delayRef.current = undefined;
      }
      delayRef.current = setTimeout(async () => {
        resolve(await serviceCall(...arg));
      }, timeout);
    });
};
export default useDelayFetch;
