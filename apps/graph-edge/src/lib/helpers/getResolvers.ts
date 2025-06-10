/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import 'reflect-metadata';
import { VALID_RESOLVER_REGEX } from '../constant';
import { NonEmptyArray } from 'type-graphql';

export const getResolvers = async (): Promise<NonEmptyArray<Function>> => {
  const typeGraphql = await import('@generated/type-graphql');

  return Object.entries(typeGraphql)
    .filter(([name]) => VALID_RESOLVER_REGEX.test(name))
    .map(entity => entity[1]) as any;
};
