import { PreSignUpTriggerHandler, PreSignUpTriggerEvent } from 'aws-lambda';
import { lookupUser } from './../services/auth';
import { logger } from './../services/common';
import { wrapWithMoesif } from './../services/moesif';

const handlerFunc: PreSignUpTriggerHandler = async (
  event: PreSignUpTriggerEvent,
  context
) => {
  logger.debug(JSON.stringify(event, null, 2));
  logger.info('Pre SignUp Trigger Handler:', event.triggerSource);
  logger.info('Trigger function =', event.triggerSource);
  logger.info('User pool = ', event.userPoolId);
  logger.info('App client ID = ', event.callerContext.clientId);
  logger.info('User ID = ', event.userName);

  // Ensure Lambda doesn't wait for the event loop to be empty
  context.callbackWaitsForEmptyEventLoop = false;

  const { request } = event;
  const { userAttributes } = request;

  // Set default family name if not provided
  if (!userAttributes?.family_name) {
    userAttributes.family_name = 'UNKNOWN';
  }

  // Automatically verify and confirm user if email is provided
  if (userAttributes?.email) {
    event.response.autoVerifyEmail = true;
    event.response.autoConfirmUser = true;
  }

  // Skip additional checks for specific trigger sources or client IDs
  if (
    event.triggerSource === 'PreSignUp_ExternalProvider' ||
    event.triggerSource === 'PreSignUp_AdminCreateUser' ||
    event.callerContext.clientId === 'CLIENT_ID_NOT_APPLICABLE'
  ) {
    return event; // Early exit
  }

  // Lookup the user in the existing user directory service
  const user = await lookupUser(userAttributes?.email);

  if (user) {
    // Handle user status
    switch (user.user_status__pc) {
      case 'Active':
        throw new Error('[An account with the given email already exists.]');
      case 'Disabled':
        throw new Error(
          '[Your account has been disabled. Please contact customer service for assistance.]'
        );
      default:
        break;
    }
  }

  // Set response properties
  event.response.autoConfirmUser = true;
  event.response.autoVerifyEmail = true;
  // event.response.autoVerifyPhone = true;

  // Return response
  return event;
};

export const handler = wrapWithMoesif(handlerFunc);
