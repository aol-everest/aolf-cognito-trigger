const { lookupUser } = require('./../services/auth');

exports.handler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  console.log(event);
  if (event.request.userAttributes.hasOwnProperty('email')) {
    event.response.autoVerifyEmail = true;
    event.response.autoConfirmUser = true;
  }

  if (!event.request.userAttributes.hasOwnProperty('family_name')) {
    event.request.userAttributes.family_name = 'UNKNOWN';
  }

  if (
    event.triggerSource !== 'PreSignUp_ExternalProvider' &&
    event.triggerSource !== 'PreSignUp_AdminCreateUser' &&
    event.clientId !== 'CLIENT_ID_NOT_APPLICABLE'
  ) {
    // Lookup the user in your existing user directory service
    const user = await lookupUser(event.request.userAttributes.email);
    console.log(user);
    if (user) {
      if (user.user_status__pc === 'Active') {
        // Return error to Amazon Cognito
        callback('[An account with the given email already exists.]', event);
      } else if (user.user_status__pc === 'Disabled') {
        // Return error to Amazon Cognito
        callback(
          '[You have been disabled from using your account. Please contact customer service for assistance.]',
          event
        );
      }
    }
  }

  /*if (event.triggerSource === 'PreSignUp_ExternalProvider') {
    const userRs = await getUserByEmail(
      event.userPoolId,
      event.request.userAttributes.email
    );
    console.log('userRs', userRs);
    if (userRs && userRs.Users.length > 0) {
      const [providerName = '', providerUserId] = event.userName.split('_'); // event userName example: "Facebook_12324325436"

      let allProviders = await listIdentityProviders(event.userPoolId);
      console.log('allProviders', allProviders);
      allProviders = allProviders.Providers.map((p) => p.ProviderName);
      const findProvider = allProviders.find(
        (p) => p.toLowerCase() === providerName
      );
      console.log('findProvider', findProvider);
      if (findProvider) {
        await linkProviderToUser(
          userRs.Users[0].Username,
          event.userPoolId,
          findProvider,
          providerUserId
        );
      }
    } else {
      console.log('user not found, skip.');
    }
  }*/

  event.response.autoConfirmUser = true;
  event.response.autoVerifyEmail = true;
  // event.response.autoVerifyPhone = true;
  callback(null, event);
};
