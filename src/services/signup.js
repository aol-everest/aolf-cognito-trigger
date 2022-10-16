const client = require('./knex').herokuConnectClient;
const { v1: uuidv1 } = require('uuid');
const { lookupUser } = require('./auth');
const upsert = require('./upsert')(client);
const config = require('config');

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
};

const upsertSFObject = (tableName, recordObject, constraintKey) => {
  return upsert({
    table: tableName,
    object: recordObject,
    constraint: constraintKey,
  });
};

const signup = async (userId, userAttribute, callerContext) => {
  let signupOrgnization = 'AOL';
  switch (callerContext.clientId) {
    case config.IAHV_CLIENT_ID:
      signupOrgnization = 'IAHV';
      break;
    case config.HB_CLIENT_ID:
      signupOrgnization = 'HB';
      break;
  }
  console.log('signupOrgnization', signupOrgnization);
  const recordtype = await getRecordTypeId('Account', 'PersonAccount');
  const user = await lookupUser(userAttribute.email);
  if (!user) {
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
      user_default_organization__pc: signupOrgnization,
      user_status__pc: 'Active',
      user_source__pc: 'Member Site',
    };
    return await upsertSFObject(
      'salesforce.account',
      userPayload,
      'external_id__c'
    );
  } else if (user.user_status__pc !== 'Disabled') {
    let userPayload = {
      sfid: user.sfid,
      external_id__c: user.externalId,
      user_default_organization__pc:
        user.user_default_organization__pc || signupOrgnization,
      user_source__pc: user.user_source__pc || 'Member Site',
      user_status__pc: 'Active',
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
    return await upsertSFObject('salesforce.account', userPayload, 'sfid');
  }
};

module.exports = {
  signup,
  getRecordTypeId,
};
