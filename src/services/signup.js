const client = require('./knex').herokuConnectClient;
const { v1: uuidv1 } = require('uuid');
const { lookupUser } = require('./auth');
const upsert = require('./upsert')(client);

const getRecordTypeId = async (sobject, recordTypeName) => {
  const recordTypes = await client
    .withSchema('salesforce')
    .select()
    .distinct([
      'recordtype.sfid',
      'recordtype.developername',
      'recordtype.name',
    ])
    .from('recordtype')
    .where('recordtype.sobjecttype', sobject)
    .andWhere('recordtype.developername', recordTypeName);

  const [recordType] = recordTypes;
  return recordType;
}

const upsertSFObject = (tableName, recordObject, constraintKey) => {
  return upsert(
    {
      table: tableName,
      object: recordObject,
      constraint: constraintKey,
    }
  );
}

const signup = async (userId, userAttribute) => {
  const recordtype = await getRecordTypeId('Account', 'PersonAccount');
  const user = await lookupUser(userAttribute.email);
  if(!user) {
    const userPayload = {
      external_id__c: uuidv1(),
      cognito_user_id__c: userId,
      firstname: userAttribute.given_name,
      lastname: userAttribute.family_name || 'UNKNOWN',
      personemail: userAttribute.email,
      picture__c: userAttribute.picture,
      recordtypeid: recordtype.sfid,
      entity_type__pc: 'Student',
      status__c: 'Active',
    };
    return await upsertSFObject('salesforce.account', userPayload, 'external_id__c');
  } else {
    let userPayload = {
      external_id__c: user.externalId,
      status__c: 'Active',
    };
    if (!user.cognito_user_id__c && userId) {
      userPayload = {
        ...userPayload,
        cognito_user_id__c: userId,
      };
    }
    if (userAttribute.given_name) {
      userPayload = { ...userPayload, firstname: userAttribute.given_name };
    }
    if (userAttribute.family_name) {
      userPayload = { ...userPayload, lastname: userAttribute.family_name };
    }
    if (userAttribute.picture) {
      userPayload = { ...userPayload, picture__c: userAttribute.picture };
    }
    return await upsertSFObject(
      'salesforce.account',
      userPayload,
      'external_id__c'
    );
  }
}

module.exports = {
  signup,
  getRecordTypeId,
};