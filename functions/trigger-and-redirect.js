const fetch = require('node-fetch');
require('dotenv').config();

exports.handler = async (event) => {
    const recordId = event.queryStringParameters.recordid;
    const zapierUrl = process.env.WEBHOOK + `?recordid=${recordId}`;

    // Trigger the Zapier webhook
    await fetch(zapierUrl);

    // Redirect to the form URL
    return {
        statusCode: 302,
        headers: {
            Location: process.env.FORM
        }
    };
};
