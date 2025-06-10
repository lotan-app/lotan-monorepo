import { prop as Property, Severity, modelOptions, pre } from '@typegoose/typegoose';

// import { preSaveMiddleware } from '@Middlewares/mongoPreSaveMiddleware';
// import { preUpdateMiddleware } from '@Middlewares/mongoPreUpdateMiddleware';

// @pre<any>('save', preSaveMiddleware)
// @pre<any>(new RegExp('^.*update.*', 'i'), preUpdateMiddleware)
@modelOptions({
  schemaOptions: {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: 'agent',
    timestamps: true,
    versionKey: 'version',
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class Agent {
  @Property()
  id: string;

  @Property()
  url: string;

  @Property()
  cpuUsage: number;

  @Property()
  totalMem: number;

  @Property()
  memUsage: number;

  @Property()
  latestPing: number;

  @Property()
  createdAt: Date;

  @Property()
  updatedAt: Date;
}
