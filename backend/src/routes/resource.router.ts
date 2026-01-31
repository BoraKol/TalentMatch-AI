import { Router } from 'express';
import { BaseController } from '../controllers/base.controller';

export const createResourceRouter = (controller: BaseController<any>): Router => {
    const router = Router();

    router.post('/', controller.create);
    router.get('/', controller.getAll);
    router.get('/:id', controller.getById);
    router.put('/:id', controller.update);
    router.delete('/:id', controller.delete);

    return router;
};
