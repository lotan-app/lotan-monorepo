export class WorkerPool {
    private workers: number;
    private queue: (() => Promise<any>)[] = [];
    private activeWorkers = 0;

    constructor(workers: number) {
        this.workers = workers;
    }
    public get maxWorkers(): number{
        return this.workers;
    }

     // push task to pool and return a promise
     public addTask<T>(task: () => Promise<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            this.queue.push(async () => {
                try {
                    const result = await task();
                    resolve(result); // Resolve promise when task finishes
                } catch (error) {
                    reject(error); // Reject promise if task fails
                }
            });
            this.runNextTask();
        });
    }

    // Run the next task if there is an empty worker
    private runNextTask() {
        if (this.activeWorkers < this.workers && this.queue.length > 0) {
            const task = this.queue.shift();
            if (task) {
                this.activeWorkers++;
                console.log(`Running worker (${this.activeWorkers}/${this.workers})`);
                task()
                    .then(() => this.activeWorkers--)
                    .catch(() => this.activeWorkers--)
                    .finally(() => this.runNextTask());
            }
        }
    }
}