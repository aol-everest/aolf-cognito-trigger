import { lookupUser } from './../services/auth';
import {
  PreAuthenticationTriggerHandler,
  PreAuthenticationTriggerEvent,
  Context,
} from 'aws-lambda';
import { logger } from './../services/common';
import { moesif } from './../services/moesif';

const handlerFunc: PreAuthenticationTriggerHandler = async (
  event: PreAuthenticationTriggerEvent,
  context: Context
) => {
  logger.debug(JSON.stringify(event, null, 2));
  logger.info('Pre Authentication Trigger:', event.triggerSource);
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

  // Send post authentication data to Cloudwatch logs
  console.log(event);

  try {
    const user = await lookupUser(event.request.userAttributes.email);

    if (user && user.user_status__pc === 'Disabled') {
      throw new Error(
        '[You have been disabled from using your account. Please contact customer service for assistance.]'
      );
    }

    // Additional checks can be added here if necessary

    // Return to Amazon Cognito
    return event;
  } catch (error) {
    // Return error to Amazon Cognito
    throw error;
  }
};

export const handler = handlerFunc;
