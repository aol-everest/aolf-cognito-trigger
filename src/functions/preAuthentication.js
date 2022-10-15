const { lookupUser } = require('./../services/auth');
exports.handler = async (event, context, callback) => {
  // Send post authentication data to Cloudwatch logs
  console.log(event);

  const user = await lookupUser(event.request.userAttributes.email);

  if (user) {
    if (user.user_status__pc === 'Disabled') {
      // Return error to Amazon Cognito
      return callback(
        new Error(
          'You have been disabled from using your account. Please contact customer service for assistance.'
        ),
        event
      );
    }
    if (user.user_status__pc !== 'Active') {
      // Return error to Amazon Cognito
      return callback(
        new Error(
          'Account does not exist. Please contact customer service for assistance.'
        ),
        event
      );
    }
  }

  // Return to Amazon Cognito
  return callback(null, event);
};
