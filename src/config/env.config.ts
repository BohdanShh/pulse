import { ConfigService } from '@nestjs/config';

import { plainToInstance } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Matches, Max, Min, validateSync } from 'class-validator';

const DEFAULT_PORT = 3000;
const MAX_PORT = 65535;

export class EnvironmentVariables {
  @IsInt()
  @Min(1)
  @Max(MAX_PORT)
  PORT: number = DEFAULT_PORT;

  @IsString()
  @IsNotEmpty()
  @Matches(/^postgres(ql)?:\/\//, {
    message: 'DATABASE_URL must start with postgres:// or postgresql://',
  })
  DATABASE_URL: string;
}

export type AppConfigService = ConfigService<EnvironmentVariables, true>;

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const env = plainToInstance(EnvironmentVariables, config, { enableImplicitConversion: true });
  const errors = validateSync(env);

  if (errors.length > 0) {
    const messages = errors.flatMap(error => Object.values(error.constraints ?? {}));
    throw new Error(`Invalid environment variables:\n- ${messages.join('\n- ')}`);
  }

  return env;
}
