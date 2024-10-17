import {
  CustomMessageTriggerHandler,
  CustomMessageTriggerEvent,
} from 'aws-lambda';
import pug from 'pug';
import * as path from 'path';
import { logger } from './../services/common';
import { getDomain } from './../services/domain';

const templateDir = path.join(__dirname, '..', 'Template');

const handlerFunc: CustomMessageTriggerHandler = async (
  event: CustomMessageTriggerEvent,
  context
) => {
  logger.debug(JSON.stringify(event, null, 2));
  logger.info('Custom Message Trigger Handler:', event.triggerSource);

  context.callbackWaitsForEmptyEventLoop = false;
  const stage = (process.env.STAGE as 'dev' | 'qa' | 'prod') || 'prod';
  const domain = getDomain(event.callerContext.clientId, stage);

  let html = '';

  if (event.triggerSource === 'CustomMessage_ForgotPassword') {
    html = await pug.renderFile(`${templateDir}/forgotPassword.pug`, {
      codeParameter: event.request.codeParameter,
      domain,
    });

    event.response.emailSubject =
      'Art of Living Journey: Your verification code for reset password';
  } else if (event.triggerSource === 'CustomMessage_AdminCreateUser') {
    if (event.request.userAttributes['custom:source'] === 'COMBO_CHECKOUT') {
      event.response.emailSubject =
        'Core Competencies Program - Account ‘Login’ Information';
      html = await pug.renderFile(`${templateDir}/adminCreateUserCombo.pug`, {
        codeParameter: event.request.codeParameter,
        email: event.request.usernameParameter,
        firstName: event.request.userAttributes?.given_name || '',
        domain,
      });
    } else {
      event.response.emailSubject = 'Welcome to the Art of Living!';
      html = await pug.renderFile(`${templateDir}/adminCreateUser.pug`, {
        codeParameter: event.request.codeParameter,
        email: event.request.usernameParameter,
        firstName: event.request.userAttributes?.given_name || '',
        domain,
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
