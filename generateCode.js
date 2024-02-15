const twoFactor = require("node-2fa");

export const generateCode = async (service) => {
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
    await fetch(`${webhookUrl}?token=${tokenObj.token}&service=${service}`);
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
