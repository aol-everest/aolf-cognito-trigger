const { signup } = require('./../services/signup');
exports.handler = async (event, context, callback) => {
  console.log(event);
  await signup(
    event.userName,
    event.request.userAttributes,
    event.callerContext
  );
  /*if(true) {
    throw new Error('Known error!');
  }*/
  callback(null, event);
};
