const { authenticateUser, lookupUser } = require('./../services/auth');
const { composePhoneNumber } = require('./../services/util');
exports.handler = async (event, context, callback) => {
  // Send post authentication data to Cloudwatch logs
  console.log('Trigger function =', event.triggerSource);
  console.log(event);

  const sfuser = await lookupUser(event.userName);
  console.info(sfuser);

  if (sfuser) {
    if (event.triggerSource === 'UserMigration_Authentication') {
      try {
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
        context.succeed(event);
      } catch (ex) {
        callback(ex);
      }
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
      context.succeed(event);
    } else {
      // Return error to Amazon Cognito
      callback('Bad triggerSource ' + event.triggerSource);
    }
  }
  context.done(null, event);
};
