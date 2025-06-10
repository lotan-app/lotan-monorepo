import { BasicError } from './BasicError';
import { ErrorCode } from './ErrorCode';
import { formatWithArgs } from '../libs/helpers/stringHelpers';

export class BusinessLogicError extends BasicError {
  constructor(code: ErrorCode, ...args: any[]) {
    super(code.valueOf());
    this.name = 'BusinessLogicError';
    let message = code.toString();
    if (args.length > 0) {
      message = formatWithArgs(message, args);
    }
    this.message = message;
  }
}
