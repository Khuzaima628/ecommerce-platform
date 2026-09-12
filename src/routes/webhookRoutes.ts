import { Router } from 'express';
import  express  from 'express';
import { stripeWebhookController } from "@src/controllers/webhookController";

const webhookRouter = Router()

webhookRouter.post('/webhook/stripe',
    express.raw({type: 'application/json'}), stripeWebhookController
 )
export default webhookRouter
