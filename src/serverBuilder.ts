import express, { Router } from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
// import { OpenapiViewerRouter, OpenapiRouterConfig } from '@map-colonies/openapi-express-viewer';
import { getErrorHandlerMiddleware } from '@map-colonies/error-express-handler';
import { middleware as OpenApiMiddleware } from 'express-openapi-validator';
import { inject, injectable } from 'tsyringe';
import { Logger } from '@map-colonies/js-logger';
import httpLogger from '@map-colonies/express-access-log-middleware';
import { collectMetricsExpressMiddleware, getTraceContexHeaderMiddleware } from '@map-colonies/telemetry';
import { SERVICES } from './common/constants';
import { IConfig } from './common/interfaces';
import { PERSON_ROUTER_SYMBOL } from './person/routes/personRouter';
import { ANOTHER_RESOURCE_ROUTER_SYMBOL } from './anotherResource/routes/anotherResourceRouter';
import { buildOpenApi } from './openapiBuilder';

@injectable()
export class ServerBuilder {
  private readonly serverInstance: express.Application;

  public constructor(
    @inject(SERVICES.CONFIG) private readonly config: IConfig,
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    @inject(PERSON_ROUTER_SYMBOL) private readonly personRouter: Router,
    @inject(ANOTHER_RESOURCE_ROUTER_SYMBOL) private readonly anotherResourceRouter: Router
  ) {
    this.serverInstance = express();
  }

  public build(): express.Application {
    this.registerPreRoutesMiddleware();
    this.buildRoutes();
    this.registerPostRoutesMiddleware();

    return this.serverInstance;
  }

  private buildDocsRoutes(): void {
    // const openapiRouter = new OpenapiViewerRouter({
    //   ...this.config.get<OpenapiRouterConfig>('openapiConfig'),
    //   filePathOrSpec: this.config.get<string>('openapiConfig.filePath'),
    // });

    // openapiRouter.setup();

    const swaggerDoc = buildOpenApi(this.config);
    this.serverInstance.use(this.config.get<string>('openapiConfig.basePath'), swaggerUi.serve, swaggerUi.setup(swaggerDoc));

    // this.serverInstance.use(this.config.get<string>('openapiConfig.basePath'), openapiRouter.getRouter());
  }

  private buildRoutes(): void {
    this.serverInstance.use('/person', this.personRouter);
    this.serverInstance.use('/anotherResource', this.anotherResourceRouter);
    this.buildDocsRoutes();
  }

  private registerPreRoutesMiddleware(): void {
    this.serverInstance.use(collectMetricsExpressMiddleware({}));
    this.serverInstance.use(httpLogger({ logger: this.logger, ignorePaths: ['/metrics'] }));

    if (this.config.get<boolean>('server.response.compression.enabled')) {
      this.serverInstance.use(compression(this.config.get<compression.CompressionFilter>('server.response.compression.options')));
    }

    this.serverInstance.use(bodyParser.json(this.config.get<bodyParser.Options>('server.request.payload')));
    this.serverInstance.use(getTraceContexHeaderMiddleware());

    // const ignorePathRegex = new RegExp(`^${this.config.get<string>('openapiConfig.basePath')}/.*`, 'i');
    // const apiSpecPath = this.config.get<string>('openapiConfig.filePath');
    // this.serverInstance.use(OpenApiMiddleware({ apiSpec: apiSpecPath, validateRequests: true, ignorePaths: ignorePathRegex }));
  }

  private registerPostRoutesMiddleware(): void {
    this.serverInstance.use(getErrorHandlerMiddleware());
  }
}
