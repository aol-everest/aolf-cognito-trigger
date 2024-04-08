import * as fido2 from './../services/fido2.js';
import * as smsOtpStepUp from './../services/sms-otp-stepup.js';
import * as magicLink from './../services/magic-link.js';
import { logger, UserFacingError } from './../services/common.js';

export const handler = async (event) => {
  logger.debug(JSON.stringify(event, null, 2));
  try {
    event.response.answerCorrect = false;

    // Enforce FIDO2?
    if (event.request.clientMetadata?.signInMethod !== 'FIDO2') {
      await fido2.assertFido2SignInOptional(event);
    }

    // Verify challenge answer
    if (event.request.clientMetadata?.signInMethod === 'MAGIC_LINK') {
      await magicLink.addChallengeVerificationResultToEvent(event);
    } else if (event.request.clientMetadata?.signInMethod === 'FIDO2') {
      await fido2.addChallengeVerificationResultToEvent(event);
    } else if (
      event.request.clientMetadata?.signInMethod === 'SMS_OTP_STEPUP'
    ) {
      await smsOtpStepUp.addChallengeVerificationResultToEvent(event);
    }

    // Return event
    logger.debug(JSON.stringify(event, null, 2));
    logger.info(
      'Verification result, answerCorrect:',
      event.response.answerCorrect
    );
    return event;
  } catch (err) {
    logger.error(err);
    if (err instanceof UserFacingError) throw err;
    throw new Error('Internal Server Error');
  }
};
