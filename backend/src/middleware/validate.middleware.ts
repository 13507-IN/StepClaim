import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodSchema, ZodError } from 'zod';
import { errorResponse } from '../utils/response.js';

/**
 * Source of the data to validate in the request.
 */
type ValidationTarget = 'body' | 'params' | 'query';

/**
 * Factory function that creates a Fastify preHandler hook for validating
 * request data against a Zod schema.
 *
 * @param schema - Zod schema to validate against
 * @param target - Which part of the request to validate ('body', 'params', or 'query')
 * @returns Fastify preHandler function
 *
 * @example
 * ```ts
 * fastify.post('/register', {
 *   preHandler: validate(registerSchema, 'body'),
 * }, handler);
 * ```
 */
export function validate(
  schema: ZodSchema,
  target: ValidationTarget = 'body',
) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const data = request[target];
      const parsed = schema.parse(data);

      // Replace with parsed (coerced/transformed) data
      if (target === 'body') {
        (request as { body: unknown }).body = parsed;
      } else if (target === 'query') {
        (request as { query: unknown }).query = parsed;
      } else if (target === 'params') {
        (request as { params: unknown }).params = parsed;
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        const message = details.map((d) => `${d.field}: ${d.message}`).join(', ');
        reply.status(400).send(errorResponse('VALIDATION_ERROR', message));
        return;
      }
      reply.status(400).send(errorResponse('INVALID_REQUEST', 'Invalid request data'));
    }
  };
}
