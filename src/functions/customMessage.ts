import 'source-map-support/register';
import { CustomMessageTriggerHandler } from 'aws-lambda';
import pug from 'pug';
import { logger } from './../services/common';

export const handler: CustomMessageTriggerHandler = async (event, context) => {
  logger.debug(JSON.stringify(event, null, 2));
  logger.info('Custom Message Trigger Handler:', event.triggerSource);
  context.callbackWaitsForEmptyEventLoop = false;

  let html = '';

  if (event.triggerSource === 'CustomMessage_ForgotPassword') {
    html = await pug.renderFile(`${__dirname}/../Template/forgotPassword.pug`, {
      codeParameter: event.request.codeParameter,
    });

    event.response.emailSubject =
      'Art of Living Journey: Your verification code for reset password';
  } else if (event.triggerSource === 'CustomMessage_AdminCreateUser') {
    html = await pug.renderFile(
      `${__dirname}/../Template/adminCreateUser.pug`,
      {
        codeParameter: event.request.codeParameter,
        email: event.request.usernameParameter,
        firstName: event.request.userAttributes?.given_name || '',
      }
    );

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
