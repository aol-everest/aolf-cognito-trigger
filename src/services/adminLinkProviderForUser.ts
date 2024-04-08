import { CognitoIdentityServiceProvider } from 'aws-sdk';

const cognitoIdp = new CognitoIdentityServiceProvider();

export const getUserByEmail = async (userPoolId: string, email: string) => {
  const params: CognitoIdentityServiceProvider.Types.ListUsersRequest = {
    UserPoolId: userPoolId,
    Filter: `email = "${email}"`,
  };
  return cognitoIdp.listUsers(params).promise();
};

export const linkProviderToUser = async (
  username: string,
  userPoolId: string,
  providerName: string,
  providerUserId: string
) => {
  const params: CognitoIdentityServiceProvider.Types.AdminLinkProviderForUserRequest =
    {
      DestinationUser: {
        ProviderAttributeValue: username,
        ProviderName: 'Cognito',
      },
      SourceUser: {
        ProviderAttributeName: 'Cognito_Subject',
        ProviderAttributeValue: providerUserId,
        ProviderName: providerName,
      },
      UserPoolId: userPoolId,
    };

  const result = await new Promise((resolve, reject) => {
    cognitoIdp.adminLinkProviderForUser(params, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });

  return result;
};

export const listIdentityProviders = async (userPoolId: string) => {
  const params: CognitoIdentityServiceProvider.Types.ListIdentityProvidersRequest =
    {
      UserPoolId: userPoolId,
    };

  const result = await new Promise((resolve, reject) => {
    cognitoIdp.listIdentityProviders(params, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });

  return result;
};
