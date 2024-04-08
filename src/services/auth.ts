import { herokuConnectClient } from './knex';
import bcrypt from 'bcryptjs';

interface User {
  sfid: string;
  userType: string;
  externalId: string;
  name: string;
  first_name: string;
  deviceId: string;
  last_name: string;
  email: string;
  isActive: boolean;
  status: string;
  password: string;
  phone_number: string;
  cognito_user_id__c: string;
  user_status__pc: string;
  user_default_organization__pc: string;
  user_source__pc: string;
  recordtypeid: string;
  picture__c: string;
}

const getRecordTypeId = async (sobject: string, recordTypeName: string) => {
  const recordTypes = await herokuConnectClient
    .withSchema('salesforce')
    .select(['recordtype.sfid', 'recordtype.developername', 'recordtype.name'])
    .distinct()
    .from('recordtype')
    .where('recordtype.sobjecttype', sobject)
    .andWhere('recordtype.developername', recordTypeName);

  const [recordType] = recordTypes;
  return recordType;
};

const isEmpty = (str: string | null | undefined) => !str || !str.trim();

const lookupUser = async (userName: string) => {
  if (isEmpty(userName)) {
    return null;
  }
  const recordtype = await getRecordTypeId('Account', 'PersonAccount');
  let query = herokuConnectClient
    .withSchema('salesforce')
    .select([
      'account.sfid',
      'account.entity_type__pc AS userType',
      'account.external_id__c AS externalId',
      'account.name AS name',
      'account.firstname AS first_name',
      'account.device_id__c AS deviceId',
      'account.lastname AS last_name',
      'account.personemail AS email',
      'account.is_active__c AS isActive',
      'account.status__c AS status',
      'account.password__c as password',
      'account.personmobilephone as phone_number',
      'account.cognito_user_id__c',
      'account.user_status__pc',
      'account.user_default_organization__pc',
      'account.user_source__pc',
      'account.recordtypeid',
      'account.picture__c',
    ])
    .from('account')
    .where('account.recordtypeid', recordtype.sfid)
    .andWhere(
      herokuConnectClient.raw(
        'LOWER(account.personemail) = ?',
        userName.toLowerCase().trim()
      )
    );

  let results = await query;
  if (results.length === 0) {
    return null;
  } else {
    return results[0] as User;
  }
};

const authenticateUser = async (userName: string, password: string) => {
  const user = await lookupUser(userName);
  if (!user) {
    throw new Error('[Incorrect username or password.]');
  }
  if (user.status === 'Deactive') {
    throw new Error('[User is inActive]');
  }
  const compareResult = bcrypt.compareSync(password, user.password || '');
  if (!compareResult) {
    throw new Error('[Incorrect username or password.]');
  }
  return user;
};

export { lookupUser, authenticateUser };
