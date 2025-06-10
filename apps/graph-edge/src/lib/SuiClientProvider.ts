import { Service } from 'typedi';
import {
  JsonRpcError,
  SuiClient,
  SuiHTTPStatusError,
  SuiTransport,
  SuiTransportRequestOptions,
  SuiTransportSubscribeOptions,
} from '@mysten/sui/client';
import { ILogger } from './types/ILogger';

const PROVIDER_NAMES = {
  DEFAULT: 'DEFAULT',
};

@Service()
export class SuiClientProvider {
  private providers: Map<string, SuiClient> = new Map();

  constructor(protected readonly logger: ILogger, private readonly suiRpcNodes: string[]) {
    this.init();
  }

  private init() {
    this.registerProvider(PROVIDER_NAMES.DEFAULT, this.suiRpcNodes);
  }

  private registerProvider(providerName: string, nodes: string[]): SuiClient {
    if (!this.providers.get(providerName)) {
      const httpTransport = new CustomHTTPTransport(this.logger, providerName, {
        nodes: nodes,
        maxRetry: 20,
        timeoutMs: 5000,
      });

      this.providers.set(
        providerName,
        new SuiClient({
          transport: httpTransport,
        }),
      );
    }

    return this.providers.get(providerName);
  }

  async getProvider(providerName: string = PROVIDER_NAMES.DEFAULT): Promise<SuiClient> {
    const provider = this.providers.get(providerName);

    if (!provider) {
      throw new Error(`Provider ${providerName} not register`);
    }

    return provider;
  }
}

class CustomHTTPTransport implements SuiTransport {
  private nodes: { node: string; enable: boolean }[] = [];
  private maxRetry = 20;
  private currentNodeIndex = 0;
  private timeoutMs = 30000;

  constructor(
    private logger: ILogger,
    name: string,
    options: { nodes: string[]; maxRetry: number; timeoutMs: number },
  ) {
    const { nodes, maxRetry, timeoutMs } = options;

    if (nodes.length === 0) {
      throw Error(`CustomHTTPTransport ${name}: Nodes required`);
    }

    if (maxRetry < 0) {
      throw Error(`CustomHTTPTransport ${name}: MaxRetry must be greater than or equal to 0`);
    }

    this.nodes = nodes.map(node => ({ node, enable: true }));
    this.maxRetry = maxRetry;
    this.timeoutMs = timeoutMs;
  }

  private setDisableNode(nodeIndex: number): void {
    if (!this.nodes[nodeIndex].enable) {
      return;
    }

    this.nodes[nodeIndex].enable = false;
    setTimeout(() => {
      this.nodes[nodeIndex].enable = true;
    }, 1000);
  }

  async fetch(url: string, reqInit: RequestInit) {
    const response = await fetch(url, { ...reqInit, signal: AbortSignal.timeout(this.timeoutMs), keepalive: true });

    return response;
  }

  private getNodeIndex(): number {
    this.currentNodeIndex++;

    if (this.currentNodeIndex > this.nodes.length - 1) {
      this.currentNodeIndex = 0;
    }

    return this.currentNodeIndex;
  }

  getCurrentNodeInfo() {
    return this.nodes[this.currentNodeIndex].node;
  }

  private allNodeIsDisable(): boolean {
    for (const node of this.nodes) {
      if (node.enable) {
        return false;
      }
    }

    return true;
  }

  async request<T>(input: SuiTransportRequestOptions, retryCounter = this.maxRetry): Promise<T> {
    if (this.allNodeIsDisable()) {
      await this.sleep(100);
    }

    const nodeIndex = this.getNodeIndex();
    const node = this.nodes[nodeIndex];

    if (!node.enable) {
      return this.request(input, retryCounter);
    }

    const [error, res] = await this.executePromise(
      this.fetch(node.node, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: input.method,
          params: input.params,
        }),
      }),
    );

    if (error) {
      // this.logger.debug(`Request ${input.method} to ${node.node} failed ${error}`,);

      if (retryCounter === 0) {
        throw new Error(`Query onchain max retry`);
      }

      return this.handleRetryRequest(nodeIndex, input, retryCounter);
    }

    if (!res.ok) {
      if (retryCounter === 0) {
        throw new SuiHTTPStatusError(
          `Unexpected status code: ${res.status} [node: ${node.node}]`,
          res.status,
          res.statusText,
        );
      }

      return this.handleRetryRequest(nodeIndex, input, retryCounter);
    }

    const data: any = await res.json();

    if ('error' in data && data.error != null) {
      throw new JsonRpcError(`${data.error.message} [node: ${node.node}]`, data.error.code);
    }

    return data.result;
  }

  private handleRetryRequest<T>(
    nodeIndex: number,
    input: SuiTransportRequestOptions,
    retryCounter = this.maxRetry,
  ): Promise<T> {
    this.setDisableNode(nodeIndex);
    retryCounter--;
    return this.request(input, retryCounter);
  }

  async subscribe<T = unknown>(input: SuiTransportSubscribeOptions<T>): Promise<() => Promise<boolean>> {
    return () => Promise.resolve(true);
  }

  private executePromise<T>(promise: Promise<T>): Promise<[Error | null, T | null]> {
    return promise.then(data => [null, data]).catch(error => [error, null]) as any;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
