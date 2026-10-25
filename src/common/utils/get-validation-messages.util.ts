import { type ValidationError } from 'class-validator';

export function getValidationMessages(errors: ValidationError[]): string[] {
  return errors.flatMap(error => Object.values(error.constraints ?? {}));
}
