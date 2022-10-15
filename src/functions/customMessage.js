const pug = require('pug');
exports.handler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  if (event.triggerSource === 'CustomMessage_ForgotPassword') {
    const html = await pug.renderFile('src/Template/forgotPassword.pug', {
      codeParameter: event.request.codeParameter,
    });
    console.log(html);
    // Ensure that your message contains event.request.codeParameter. This is the placeholder for code that will be sent
    /*event.response.smsMessage = `Art of Living Journey: You have submitted a password change request!
    If it was you, confirm the password change request by using verification code.
    Your verification code is ${event.request.codeParameter}.`;*/
    event.response.emailSubject =
      'Art of Living Journey: Your verification code for reset password';
    event.response.emailMessage = `${html}`;
  } else if (event.triggerSource === 'CustomMessage_AdminCreateUser') {
    const html = await pug.renderFile('src/Template/adminCreateUser.pug', {
      codeParameter: event.request.codeParameter,
      email: event.request.usernameParameter,
    });
    console.log(html);
    // Ensure that your message contains event.request.codeParameter. This is the placeholder for code that will be sent
    /*event.response.smsMessage = `Art of Living Journey: You have submitted a password change request!
    If it was you, confirm the password change request by using verification code.
    Your verification code is ${event.request.codeParameter}.`;*/
    event.response.emailSubject =
      'Art of Living Journey: Your temporary password';
    event.response.emailMessage = `${html}`;
  }
  // Create custom message for other events

  // Return to Amazon Cognito
  callback(null, event);
}
