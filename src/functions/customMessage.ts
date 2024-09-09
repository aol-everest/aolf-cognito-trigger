import {
  CustomMessageTriggerHandler,
  CustomMessageTriggerEvent,
} from 'aws-lambda';
import pug from 'pug';
import * as path from 'path';
import { logger } from './../services/common';

const templateDir = path.join(__dirname, '..', 'Template');

const handlerFunc: CustomMessageTriggerHandler = async (
  event: CustomMessageTriggerEvent,
  context
) => {
  logger.debug(JSON.stringify(event, null, 2));
  logger.info('Custom Message Trigger Handler:', event.triggerSource);

  context.callbackWaitsForEmptyEventLoop = false;

  let html = '';

  if (event.triggerSource === 'CustomMessage_ForgotPassword') {
    html = await pug.renderFile(`${templateDir}/forgotPassword.pug`, {
      codeParameter: event.request.codeParameter,
    });

    event.response.emailSubject =
      'Art of Living Journey: Your verification code for reset password';
  } else if (event.triggerSource === 'CustomMessage_AdminCreateUser') {
    if (event.request.userAttributes['custom:source'] === 'COMBO_CHECKOUT') {
      event.response.emailSubject =
        '5 Core Competencies Program - Account ‘Login’ Information';
      html = await pug.renderFile(`${templateDir}/adminCreateUserCombo.pug`, {
        codeParameter: event.request.codeParameter,
        email: event.request.usernameParameter,
        firstName: event.request.userAttributes?.given_name || '',
      });
    } else {
      event.response.emailSubject = 'Welcome to the Art of Living!';
      html = await pug.renderFile(`${templateDir}/adminCreateUser.pug`, {
        codeParameter: event.request.codeParameter,
        email: event.request.usernameParameter,
        firstName: event.request.userAttributes?.given_name || '',
      });
    }

    event.response.smsMessage = `Your new profile is ready, ${
      event.request.userAttributes?.given_name || ''
    }.`;
  }

  if (html) {
    event.response.emailMessage = html;
  }
  logger.debug(JSON.stringify(event, null, 2));
  return event;
};

export const handler = handlerFunc;
