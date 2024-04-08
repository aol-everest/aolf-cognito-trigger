import { signup } from './../services/signup';
import {
  PostConfirmationTriggerHandler,
  PostConfirmationTriggerEvent,
} from 'aws-lambda';
import { logger } from './../services/common';

export const handler: PostConfirmationTriggerHandler = async (
  event: PostConfirmationTriggerEvent,
  context
) => {
  logger.debug(JSON.stringify(event, null, 2));
  logger.info('Post Confirmation Trigger:', event.triggerSource);
  context.callbackWaitsForEmptyEventLoop = false;

  await signup(
    event.userName,
    event.request.userAttributes,
    event.callerContext
  );

  /*if(true) {
      throw new Error('Known error!');
    }*/

  return event;
};
