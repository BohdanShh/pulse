import { BadRequestException } from '@nestjs/common';

export class NothingToUpdateException extends BadRequestException {
  constructor() {
    super('Nothing to update');
  }
}
