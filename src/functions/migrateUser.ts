import { authenticateUser, lookupUser } from './../services/auth';
import { composePhoneNumber } from './../services/util';
import {
  UserMigrationTriggerHandler,
  UserMigrationTriggerEvent,
} from 'aws-lambda';
import { logger } from './../services/common';

export const handler: UserMigrationTriggerHandler = async (
  event: UserMigrationTriggerEvent,
  context
) => {
  // Send post authentication data to Cloudwatch logs
  context.callbackWaitsForEmptyEventLoop = false;
  logger.debug(JSON.stringify(event, null, 2));
  logger.info('User Migration Trigger:', event.triggerSource);

  const sfuser = await lookupUser(event.userName);
  console.info(sfuser);

  if (sfuser) {
    if (event.triggerSource === 'UserMigration_Authentication') {
      // authenticate the user with your existing user directory service
      await authenticateUser(event.userName, event.request.password);
      event.response.userAttributes = {
        email: sfuser.email,
        email_verified: 'true',
        given_name: sfuser.first_name,
        family_name: sfuser.last_name,
        phone_number: composePhoneNumber(sfuser.phone_number),
        name: sfuser.name,
      };
      event.response.finalUserStatus = 'CONFIRMED';
      event.response.messageAction = 'SUPPRESS';
      return event;
    } else if (event.triggerSource === 'UserMigration_ForgotPassword') {
      event.response.userAttributes = {
        email: sfuser.email,
        // required to enable password-reset code to be sent to user
        email_verified: 'true',
        given_name: sfuser.first_name,
        family_name: sfuser.last_name,
        phone_number: composePhoneNumber(sfuser.phone_number),
        name: sfuser.name,
      };
      event.response.messageAction = 'SUPPRESS';
      return event;
    } else {
      // Return error to Amazon Cognito
      throw new Error('Bad triggerSource');
    }
  } else {
    throw new Error('User not found');
  }
};
