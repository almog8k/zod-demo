import { randomUUID } from 'crypto';
import { Logger } from '@map-colonies/js-logger';
import { inject, injectable } from 'tsyringe';
import { SERVICES } from '../../common/constants';
import { CreatePerson, Person } from '../schemas/person.schema';

@injectable()
export class PersonNameManager {
  public constructor(@inject(SERVICES.LOGGER) private readonly logger: Logger) {}

  public createPerson(newPerson: CreatePerson): Person {
    const personId = randomUUID();
    const createAt = new Date();
    const updatedAt = new Date();

    const person: Person = {
      id: personId,
      createdAt: createAt,
      updatedAt,
      ...newPerson,
    };

    this.logger.info({ msg: 'creating new Person', personId });

    return person;
  }
}
