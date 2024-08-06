export const styleCombine = (...args: any[]): string => {
  return args
    .join(" ")
    .replace(/\s+/g, " ")
    .replace(/^\s+|\s+$/, "");
};

export const truncateMiddleText = (
  text: string,
  ellipsis = "...",
  start = 6,
  end = 6
): string => {
  if (text?.length > start + end) {
    // return text.substring(0, start) + ellipsis + text.substring(end * -1);
    return `${text.slice(0, start)}${ellipsis}${text.slice(end * -1)}`;
  }

  return text;
};

export const getCurrentPixelSize = () => {
  if (typeof window === "undefined") {
    return 14;
  }
  return parseFloat(getComputedStyle(document.documentElement).fontSize);
};

export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

export const disableScroll = () => {
  const body = document.body;
  body.style.overflow = "hidden";
};
export const enableScroll = () => {
  const body = document.body;
  body.style.overflow = "auto";
};
