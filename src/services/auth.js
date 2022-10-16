const client = require('./knex').herokuConnectClient;
const bcrypt = require('bcryptjs');

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

const lookupUser = async (userName) => {
  const recordtype = await getRecordTypeId('Account', 'PersonAccount');
  let query = client
    .withSchema('salesforce')
    .select(
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
      'account.recordtypeid'
    )
    .from('account')
    .where('account.recordtypeid', recordtype.sfid)
    .andWhere(
      client.raw(
        'LOWER(account.personemail) = ?',
        userName.toLowerCase().trim()
      )
    );

  let results = await query;
  if (results.length === 0) {
    return null;
  } else {
    return results[0];
  }
};

const authenticateUser = async (userName, password) => {
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

module.exports = {
  lookupUser,
  authenticateUser,
};
