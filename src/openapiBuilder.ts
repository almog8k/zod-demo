/* eslint-disable @typescript-eslint/naming-convention */
import { OpenApiBuilder, OpenAPIObject } from 'openapi3-ts/oas31';
import { createDocument } from 'zod-openapi';
import { IConfig } from './common/interfaces';
import { createPersonSchema, personSchema, updatePersonSchema } from './person/schemas/person.schema';

export const buildOpenApi = (config: IConfig): OpenAPIObject => {
  const severPort = config.get<number>('server.port');
  const localServerUrl = `http://localhost:${severPort}`;

  const document = createDocument({
    openapi: '3.0.1',
    info: {
      title: 'Zod Demo',
      version: '1.0.0',
      description: 'Zod demo with openapi',
    },
    tags: [{ name: 'person', description: 'Person related endpoints' }],
    paths: {
      '/person': {
        post: {
          summary: 'Create person',
          tags: ['person'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: createPersonSchema,
              },
            },
          },
          responses: {
            201: {
              description: 'Person created successfully',
              content: {
                'application/json': {
                  schema: personSchema,
                },
              },
            },
            400: {
              description: 'Bad request',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        put: {
          summary: 'Update person',
          tags: ['person'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: updatePersonSchema,
              },
            },
          },
          responses: {
            201: {
              description: 'Person updated successfully',
              content: {
                'application/json': {
                  schema: personSchema,
                },
              },
            },
            400: {
              description: 'Bad request',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    servers: [
      {
        url: localServerUrl,
        description: 'Local server',
      },
    ],
  });

  const openApiBuilder = OpenApiBuilder.create(document);

  return openApiBuilder.getSpec();
};
