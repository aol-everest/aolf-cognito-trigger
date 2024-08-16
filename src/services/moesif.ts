// @ts-ignore
// import * as moesif from 'moesif-aws-lambda';
import Moesif from 'moesif-aws-lambda';
import {
  Handler,
  APIGatewayProxyEvent,
  APIGatewayEvent,
  Context,
  APIGatewayProxyCallback,
} from 'aws-lambda';

const moesifOptions = {
  applicationId: process.env.MOESIF_APPLICATION_ID,

  identifyUser: (event: APIGatewayProxyEvent) => {
    return event.requestContext.identity.cognitoIdentityId;
  },
  debug: true,
};

// Initialize Moesif with your application ID
const moesif = Moesif({
  applicationId: process.env.MOESIF_APPLICATION_ID, // Store Moesif App ID in environment variables
});

const wrapWithMoesif = (handler: Handler) => {
  return Moesif(moesifOptions, handler);
};

export { moesifOptions, moesif, wrapWithMoesif };
