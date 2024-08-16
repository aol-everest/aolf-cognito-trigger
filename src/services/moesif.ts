// @ts-ignore
// import * as moesif from 'moesif-aws-lambda';
import moesif from 'moesif-aws-lambda';
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

const wrapWithMoesif = (handler: Handler) => {
  return moesif(moesifOptions, handler);
};

export { moesifOptions, moesif, wrapWithMoesif };
