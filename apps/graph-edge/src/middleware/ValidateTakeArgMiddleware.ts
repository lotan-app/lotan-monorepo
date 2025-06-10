import { MiddlewareFn } from 'type-graphql';
const defaultTake = 50;
export const ValidateTakeArgMiddleware: MiddlewareFn = ({ args }, next) => {
  let take = args.take;

  if (!take || take > defaultTake) {
    take = defaultTake;
  }

  args.take = take;

  return next();
};
