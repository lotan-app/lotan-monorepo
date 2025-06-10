export function formatWithArgs(pattern: string, args: any[]) {
  return pattern.replace(/{(\d+)}/g, (match, index) => {
    return typeof args[index] != 'undefined' ? args[index] : match;
  });
}
