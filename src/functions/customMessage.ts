import {
  CustomMessageTriggerHandler,
  CustomMessageTriggerEvent,
} from 'aws-lambda';
import pug from 'pug';
import * as path from 'path';
import { logger } from './../services/common';
import { moesif } from './../services/moesif';

const templateDir = path.join(__dirname, '..', 'Template');

const handlerFunc: CustomMessageTriggerHandler = async (
  event: CustomMessageTriggerEvent,
  context
) => {
  logger.debug(JSON.stringify(event, null, 2));
  logger.info('Custom Message Trigger Handler:', event.triggerSource);
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

  let html = '';

  if (event.triggerSource === 'CustomMessage_ForgotPassword') {
    html = await pug.renderFile(`${templateDir}/forgotPassword.pug`, {
      codeParameter: event.request.codeParameter,
    });

    event.response.emailSubject =
      'Art of Living Journey: Your verification code for reset password';
  } else if (event.triggerSource === 'CustomMessage_AdminCreateUser') {
    html = await pug.renderFile(`${templateDir}/adminCreateUser.pug`, {
      codeParameter: event.request.codeParameter,
      email: event.request.usernameParameter,
      firstName: event.request.userAttributes?.given_name || '',
    });

    event.response.smsMessage = `Your new profile is ready, ${
      event.request.userAttributes?.given_name || ''
    }.`;
    event.response.emailSubject = 'Welcome to the Art of Living!';
  }

  if (html) {
    event.response.emailMessage = html;
  }
  logger.debug(JSON.stringify(event, null, 2));
  return event;
};

export const handler = handlerFunc;
