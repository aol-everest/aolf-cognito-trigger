import { signup } from './../services/signup';
import {
  PostConfirmationTriggerHandler,
  PostConfirmationTriggerEvent,
} from 'aws-lambda';
import { logger } from './../services/common';
import { moesif } from './../services/moesif';

export const handlerFunc: PostConfirmationTriggerHandler = async (
  event: PostConfirmationTriggerEvent,
  context
) => {
  logger.debug(JSON.stringify(event, null, 2));
  logger.info('Post Confirmation Trigger:', event.triggerSource);
  moesif.track({
    request: {
      time: new Date(),
      uri: 'https://your.cognito.event/trigger', // A placeholder URI, just for identification
      verb: 'POST', // HTTP verb is arbitrary here, as this isn't a real HTTP request
      headers: {
        'Content-Type': 'application/json',
      },
      body: event, // Log the entire Cognito event payload
    },
    response: {
      time: new Date(),
      status: 200, // Adjust status code based on your logic
      headers: {
        'Content-Type': 'application/json',
      },
      body: { message: 'Cognito event processed successfully' },
    },
    userId: event.userName || 'anonymous', // Identify the user if available
  });
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

export const handler = handlerFunc;
