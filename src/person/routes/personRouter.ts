import { Router } from 'express';
import { FactoryFunction } from 'tsyringe';
import { PersonController } from '../controllers/resourceNameController';

const personRouterFactory: FactoryFunction<Router> = (dependencyContainer) => {
  const router = Router();
  const controller = dependencyContainer.resolve(PersonController);

  // router.get('/', controller.getResource);
  router.post('/', controller.createPerson);
  router.put('/', controller.updatePerson);

  return router;
};

export const PERSON_ROUTER_SYMBOL = Symbol('PersonRouterFactory');

export { personRouterFactory };
