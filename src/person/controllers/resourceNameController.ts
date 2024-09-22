import { Logger } from '@map-colonies/js-logger';
import { ZodError } from 'zod';
import { BoundCounter, Meter } from '@opentelemetry/api-metrics';
import { HttpError } from 'express-openapi-validator/dist/framework/types';
import { RequestHandler } from 'express';
import httpStatus from 'http-status-codes';
import { injectable, inject } from 'tsyringe';
import { SERVICES } from '../../common/constants';
import { PersonNameManager } from '../models/resourceNameManager';
import { CreatePerson, createPersonSchema, Person } from '../schemas/person.schema';

type CreatePersonHandler = RequestHandler<undefined, Person, unknown>;
// type GetResourceHandler = RequestHandler<undefined, IResourceNameModel>;

@injectable()
export class PersonController {
  private readonly createdResourceCounter: BoundCounter;

  public constructor(
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    @inject(PersonNameManager) private readonly manager: PersonNameManager,
    @inject(SERVICES.METER) private readonly meter: Meter
  ) {
    this.createdResourceCounter = meter.createCounter('created_resource');
  }

  // public getResource: GetResourceHandler = (req, res) => {
  //   return res.status(httpStatus.OK).json(this.manager.getResource());
  // };

  public createPerson: CreatePersonHandler = (req, res, next) => {
    try {
      // const validPerson: CreatePerson = createPersonSchema.parse(req.body);

      const validationResult = createPersonSchema.safeParse(req.body);

      if (!validationResult.success) {
        throw new ZodError(validationResult.error.errors);
      }

      const createdPerson = this.manager.createPerson(validPerson);

      return res.status(httpStatus.CREATED).json(createdPerson);
    } catch (error) {
      let err = error;
      const errorMsg = (error as Error).message;
      this.logger.error({ msg: `Failed to create resource- ${errorMsg}`, error });
      if (error instanceof ZodError) {
        err = new HttpError({ name: 'Bad Request', status: httpStatus.BAD_REQUEST, message: this.formatMessageError(error), path: req.path });
      }
      next(err);
    }
  };

  public updatePerson: CreatePersonHandler = (req, res, next) => {
    try {
      const validPerson: CreatePerson = createPersonSchema.parse(req.body);
      const createdPerson = this.manager.createPerson(validPerson);

      return res.status(httpStatus.CREATED).json(createdPerson);
    } catch (error) {
      let err = error;
      const errorMsg = (error as Error).message;
      this.logger.error({ msg: `Failed to create resource- ${errorMsg}`, error });
      if (error instanceof ZodError) {
        err = new HttpError({ name: 'Bad Request', status: httpStatus.BAD_REQUEST, message: this.formatMessageError(error), path: req.path });
      }
      next(err);
    }
  };

  private formatMessageError(error: ZodError): string {
    const message = error.flatten((issue) => ({ message: issue.message, errorCode: issue.code }));

    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    return JSON.stringify(message.fieldErrors);
  }
}
