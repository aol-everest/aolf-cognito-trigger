const { signup } = require('./../services/signup');
exports.handler = async (event, context) => {
  console.log(event);
  await signup(event.userName, event.request.userAttributes);
  /*if(true) {
    throw new Error('Known error!');
  }*/
  context.done(null, event);
};
