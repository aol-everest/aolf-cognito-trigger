import { herokuConnectClient as client } from './knex';
import { lookupUser } from './auth';
import upsert from './upsert';

const upsertSFObject = (
  tableName: string,
  recordObject: any,
  constraintKey: string,
  trx: any
) => {
  return upsert(client)({
    table: tableName,
    object: recordObject,
    constraint: constraintKey,
  });
};

const updateTimeStamp = async (userId: string, userAttribute: any) => {
  const user = await lookupUser(userAttribute.email);
  if (user) {
    let userPayload: any = {
      external_id__c: user.externalId,
      cognito_user_id__c: userId,
      last_login__c: new Date(),
    };
    if (!user.cognito_user_id__c && userId) {
      userPayload = {
        ...userPayload,
        cognito_user_id__c: userId,
      };
    }
    if (userAttribute.picture) {
      userPayload = {
        ...userPayload,
        picture__c: userAttribute.picture,
      };
    }
    return await upsertSFObject(
      'salesforce.account',
      userPayload,
      'external_id__c',
      null // Pass null for trx since transaction is not used
    );
  }
};

export { updateTimeStamp };
