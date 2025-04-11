require('dotenv').config(); // Load environment variables from .env file

export default async (req, context) => {
    const formUrl = process.env.FORM_URL;
    const webhookBaseUrl = process.env.WEBHOOK_URL;

    try {
        const url = new URL(req.url);
        const recordId = url.searchParams.get('recordid');
        const webhookUrlObj = new URL(webhookBaseUrl);
        if (recordId) {
            webhookUrlObj.searchParams.set('recordid', recordId);
        }
        const finalWebhookUrl = webhookUrlObj.toString();

        await fetch(finalWebhookUrl, {
            method: 'POST'
        });

        return new Response(null, {
            status: 302,
            headers: { Location: formUrl }
        });
    } catch (error) {
        return new Response(null, {
            status: 302,
            headers: { Location: formUrl }
        });
    }
};
