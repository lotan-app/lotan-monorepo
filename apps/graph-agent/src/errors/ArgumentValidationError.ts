import { ValidationError } from 'class-validator';

export class ArgumentValidationError extends Error {
  validationErrors: ValidationError[];

  constructor(validationErrors: ValidationError[]) {
    super('ARGUMENT_VALIDATION_ERROR');
    this.validationErrors = validationErrors;
  }
}
