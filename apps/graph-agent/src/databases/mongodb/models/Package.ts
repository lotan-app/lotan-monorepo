import { prop as Property, Severity, modelOptions, pre } from '@typegoose/typegoose';

@modelOptions({
  schemaOptions: {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: 'packages',
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    versionKey: 'version',
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class Package {
  @Property()
  package_id: string;

  @Property()
  serialized_object: number[];
}
