import { prop as Property, Severity, modelOptions, pre } from '@typegoose/typegoose';

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
