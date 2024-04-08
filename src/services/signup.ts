import { herokuConnectClient as client } from './knex';
import { v1 as uuidv1 } from 'uuid';
import { lookupUser } from './auth';
import upsert from './upsert';
import config from 'config';

interface CallerContext {
  clientId: string;
}

const getRecordTypeId = async (sobject: string, recordTypeName: string) => {
  const recordTypes = await client
    .withSchema('salesforce')
    .select(['recordtype.sfid', 'recordtype.developername', 'recordtype.name'])
    .distinct()
    .from('recordtype')
    .where('recordtype.sobjecttype', sobject)
    .andWhere('recordtype.developername', recordTypeName);

  const [recordType] = recordTypes;
  return recordType;
};

const upsertSFObject = (
  tableName: string,
  recordObject: any,
  constraintKey: string
) => {
  return upsert(client)({
    table: tableName,
    object: recordObject,
    constraint: constraintKey,
  });
};

const signup = async (
  userId: string,
  userAttribute: any,
  callerContext: CallerContext
) => {
  let signupOrganization = 'AOL';
  switch (callerContext.clientId) {
    case process.env.IAHV_CLIENT_ID:
      signupOrganization = 'IAHV';
      break;
    case process.env.HB_CLIENT_ID:
      signupOrganization = 'HB';
      break;
  }
  console.log('signupOrganization', signupOrganization);
  const recordtype = await getRecordTypeId('Account', 'PersonAccount');
  const user = await lookupUser(userAttribute.email);
  if (!user || user.user_status__pc !== 'Disabled') {
    let userPayload = {
      external_id__c: user?.externalId || uuidv1(),
      cognito_user_id__c: userId || user?.cognito_user_id__c,
      firstname: userAttribute.given_name || user?.first_name || '',
      lastname: userAttribute.family_name || user?.last_name || 'UNKNOWN',
      personemail: userAttribute.email,
      picture__c: userAttribute.picture || user?.picture__c || '',
      recordtypeid: recordtype.sfid,
      entity_type__pc: 'Member',
      status__c: 'Active',
      user_default_organization__pc: signupOrganization,
      user_status__pc: 'Active',
      user_source__pc: 'Member Site',
    };

    return await upsertSFObject(
      'salesforce.account',
      userPayload,
      'external_id__c'
    );
  }
};

export { signup, getRecordTypeId };
