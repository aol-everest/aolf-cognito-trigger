import { lookupUser } from './../services/auth';
import {
  PreAuthenticationTriggerHandler,
  PreAuthenticationTriggerEvent,
  Context,
} from 'aws-lambda';
import { logger } from './../services/common';

const handlerFunc: PreAuthenticationTriggerHandler = async (
  event: PreAuthenticationTriggerEvent,
  context: Context
) => {
  logger.debug(JSON.stringify(event, null, 2));
  logger.info('Pre Authentication Trigger:', event.triggerSource);

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
