require('dotenv').config(); // Load environment variables from .env file

export default async (req, context) => {
    const formUrl = process.env.FORM_URL;
    const webhookBaseUrl = process.env.WEBHOOK_URL;

    try {
        // Validate environment variables
        if (!formUrl || !webhookBaseUrl) {
            console.error('Missing FORM_URL or WEBHOOK_URL');
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Server configuration error' })
            };
        }

        // Extract recordid from query parameters
        const url = new URL(req.url, `https://${req.headers.host}`);
        const recordId = url.searchParams.get('recordid');

        // Construct webhook URL
        const webhookUrlObj = new URL(webhookBaseUrl);
        if (recordId) {
            webhookUrlObj.searchParams.set('recordid', recordId);
        }
        const finalWebhookUrl = webhookUrlObj.toString();

        // Trigger webhook
        await fetch(finalWebhookUrl, {
            method: 'POST'
        });

        // Return redirect response
        return {
            statusCode: 302,
            headers: {
                Location: formUrl
            }
        };
    } catch (error) {
        // Log error for debugging but still redirect
        console.error('Webhook error:', error);
        return {
            statusCode: 302,
            headers: {
                Location: formUrl
            }
        };
    }
};
