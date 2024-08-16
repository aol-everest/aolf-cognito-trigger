import { updateTimeStamp } from './../services/updateTimeStamp';
import {
  PostAuthenticationTriggerHandler,
  PostAuthenticationTriggerEvent,
} from 'aws-lambda';
import { logger } from './../services/common';
import { moesif } from './../services/moesif';

export const handlerFunc: PostAuthenticationTriggerHandler = async (
  event: PostAuthenticationTriggerEvent,
  context
) => {
  context.callbackWaitsForEmptyEventLoop = false;

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

  await updateTimeStamp(event.userName, event.request.userAttributes);

  // Return to Amazon Cognito
  return event;
};

export const handler = handlerFunc;
