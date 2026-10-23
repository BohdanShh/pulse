import { httpMethod } from '../../../database/schema/index.js';

export type HttpMethod = (typeof httpMethod.enumValues)[number];
