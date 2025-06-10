export class Performance {
  static start(): [number, number] {
    return process.hrtime();
  }

  static end(start: [number, number]): number {
    const end = process.hrtime(start);
    const milliseconds = end[0] * 1000 + end[1] / 1e6;
    return milliseconds;
  }
}
