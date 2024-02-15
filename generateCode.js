const twoFactor = require("node-2fa");

exports.generateCode = async (service) => {
  try {
    // Pull the service name
    if(!service) {
      return {
        statusCode: 400,
        body: 'Service name is required'
      };
    }

    // Verify we've got a secret defined for that service
    const secretKey = service.toUpperCase()+'_SECRET';
    const secret = process.env[secretKey];
    if(!secret) {
      return {
        statusCode: 400,
        body: `${secretKey} is not defined in the env`
      };
    }

    // Generate a token
    const tokenObj = twoFactor.generateToken(secret);
    if(!tokenObj) {
      console.error(`Unable to generate ${secretKey} token`);
      return {
        statusCode: 500,
        body: `Unable to generate ${secretKey} token`
      };
    }

    // Pull the webhook to hit once we make a token
    const webhookUrlKey = service.toUpperCase()+'_WEBHOOK';
    const webhookUrl = process.env[webhookUrlKey];

    // Send it
    const hook = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: `The 2FA code for ${service.toLowerCase()} is ${tokenObj.token}.`,
      }),
    });
    if(!hook.ok) {
      console.error(await hook.text());
    } else {
      console.debug(await hook.text());
    }
    console.debug('Done!');
    return {
      statusCode: 204
    }
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500
    };
  }
};
