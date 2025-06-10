import { Constructable, Container } from 'typedi';
import { WinstonLogger } from '../libs/WinstonLogger';

export function Logger(contextPath: string): ParameterDecorator {
  return (object, propertyKey, index) => {
    const logger = new WinstonLogger(contextPath);
    const propertyName = propertyKey ? propertyKey.toString() : '';
    Container.registerHandler({ object: object as Constructable<any>, propertyName, index, value: () => logger });
  };
}
