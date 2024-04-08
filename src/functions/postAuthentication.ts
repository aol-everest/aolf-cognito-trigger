import { updateTimeStamp } from './../services/updateTimeStamp';
import {
  PostAuthenticationTriggerHandler,
  PostAuthenticationTriggerEvent,
} from 'aws-lambda';
import { logger } from './../services/common';

export const handler: PostAuthenticationTriggerHandler = async (
  event: PostAuthenticationTriggerEvent,
  context
) => {
  context.callbackWaitsForEmptyEventLoop = false;

  logger.debug(JSON.stringify(event, null, 2));
  logger.info('Post Confirmation Trigger:', event.triggerSource);

  await updateTimeStamp(event.userName, event.request.userAttributes);

  // Return to Amazon Cognito
  return event;
};
