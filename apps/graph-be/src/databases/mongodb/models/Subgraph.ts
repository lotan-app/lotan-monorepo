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
export class Subgraph {
  @Property()
  id: string;

  @Property()
  name: string;

  @Property()
  apiKey: string;

  @Property()
  createdAt: Date;

  @Property()
  updatedAt: Date;
}
