/* eslint-disable @typescript-eslint/no-unsafe-function-type */
export interface ITask {
  taskData: unknown;
  taskFunction: Function;
  callback: Function;
}

export class WorkerPool {
  private poolSize: number;
  private activeWorkers: number;
  private tasks: Array<ITask>;

  constructor(poolSize: number) {
    this.poolSize = poolSize;
    this.activeWorkers = 0;
    this.tasks = [];
  }

  runTask(taskData: unknown, taskFunction: Function, callback: Function): void {
    this.tasks.push({ taskData, taskFunction, callback });

    this.processNextTask();
  }

  async processNextTask() {
    if (this.tasks.length === 0) return;
    if (this.activeWorkers >= this.poolSize) return;

    const { taskData, taskFunction, callback } = this.tasks.shift() as ITask;
    this.activeWorkers++;

    try {
      const result = await taskFunction(taskData);
      callback(result);
    } catch (error) {
      console.error('Task Error:', error);
      callback(null, error);
    } finally {
      this.activeWorkers--;
      this.processNextTask();
    }
  }
}
