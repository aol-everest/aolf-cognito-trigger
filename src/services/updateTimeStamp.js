const client = require('./knex').herokuConnectClient;
const { lookupUser } = require('./auth');
const upsert = require('./upsert')(client);

const upsertSFObject = (tableName, recordObject, constraintKey, trx) => {
  return upsert(
    {
      table: tableName,
      object: recordObject,
      constraint: constraintKey,
    },
    trx
  );
}

const updateTimeStamp = async (userId, userAttribute) => {
  const user = await lookupUser(userAttribute.email);
  if (user) {
    let userPayload = {
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
      userPayload = { ...userPayload, picture__c: userAttribute.picture };
    }
    if (userAttribute.given_name) {
      // userPayload = { ...userPayload, firstname: userAttribute.given_name };
    }
    if (userAttribute.family_name) {
      // userPayload = { ...userPayload, lastname: userAttribute.family_name };
    }
    return await upsertSFObject(
      'salesforce.account',
      userPayload,
      'external_id__c'
    );
  }
};

module.exports = {
  updateTimeStamp,
};