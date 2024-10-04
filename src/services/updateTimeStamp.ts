import { herokuConnectClient as client } from './knex';
import { lookupUser } from './auth';
import upsert from './upsert';

interface UserPayload {
  external_id__c: string;
  cognito_user_id__c: string;
  picture__c: string;
  last_login__c: Date;
}

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
    let userPayload: UserPayload = {
      external_id__c: user.externalId,
      cognito_user_id__c:
        userAttribute.sub || userId || user?.cognito_user_id__c,
      picture__c: user.picture__c || userAttribute.picture,
      last_login__c: new Date(),
    };

    return await upsertSFObject(
      'salesforce.account',
      userPayload,
      'external_id__c',
      null // Pass null for trx since transaction is not used
    );
  }
};

export { updateTimeStamp };
