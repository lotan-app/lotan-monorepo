import { AnyParamConstructor, BeAnObject, ModelType, ReturnModelType } from '@typegoose/typegoose/lib/types';
import { mongoose } from '@typegoose/typegoose';

export const getModelByType = <T extends AnyParamConstructor<any>, QueryHelpers = BeAnObject>(
  clazz: T,
  db: mongoose.Connection,
  model: mongoose.Model<InstanceType<T>>,
): ReturnModelType<T, QueryHelpers> => {
  return db.model(model.modelName, model.schema) as any;
};
