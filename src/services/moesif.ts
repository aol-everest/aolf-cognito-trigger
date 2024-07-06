// @ts-ignore
import * as moesif from 'moesif-aws-lambda';
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
  identifyCompany: (event: APIGatewayProxyEvent) => {
    return '5678';
  },
};

const wrapWithMoesif = (handler: Handler) => {
  return moesif(
    moesifOptions,
    async (
      event: APIGatewayEvent,
      context: Context,
      callback: APIGatewayProxyCallback
    ) => {
      return await handler(event, context, callback);
    }
  );
};

export { moesifOptions, moesif, wrapWithMoesif };
