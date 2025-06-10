import { prop as Property, Severity, modelOptions } from '@typegoose/typegoose';
import { EdgeDeployState } from 'src/libs/enums/EdgeDeployState';

export class EdgeState {
  @Property()
  status: string;

  @Property()
  running: boolean;

  @Property()
  paused: boolean;

  @Property()
  restarting: boolean;

  @Property()
  dead: boolean;
}

@modelOptions({
  schemaOptions: {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: 'edge',
    timestamps: true,
    versionKey: 'version',
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class Edge {
  @Property()
  id: string;

  @Property()
  agentId: string;

  @Property()
  deployState: EdgeDeployState;

  @Property()
  containerId: string;

  @Property()
  containerName: string;

  @Property()
  apiPath: string;

  @Property()
  port: number;

  @Property()
  limitMem: string;

  @Property()
  limitCpu: string;

  @Property()
  subgraphId: string;

  @Property()
  subgraphUrl: string;

  @Property()
  deployVersion: number;

  @Property({ type: EdgeState })
  state: Partial<EdgeState>;

  @Property()
  logs: string;

  @Property()
  errorLogs: string;

  @Property()
  createdAt: Date;

  @Property()
  updatedAt: Date;
}
