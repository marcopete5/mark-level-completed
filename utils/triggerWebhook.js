// utils/triggerWebhook.js
export const triggerWebhook = async (req, webhookBaseUrl, formUrl) => {
    try {
        // Log environment details for debugging
        console.log('FORM_URL:', formUrl);
        console.log('WEBHOOK_URL:', webhookBaseUrl);
        console.log('NETLIFY_DEV:', process.env.NETLIFY_DEV);
        console.log('Request URL:', req.url);

        // Validate parameters
        if (!formUrl || !webhookBaseUrl) {
            console.error('Missing FORM_URL or WEBHOOK_URL');
            return new Response(
                JSON.stringify({
                    error: 'Server configuration error: Missing environment variables'
                }),
                {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // Extract recordid from query parameters with simplified URL parsing
        let recordId = null;
        try {
            const url = new URL(
                req.url,
                'https://mark-level-completed.netlify.app'
            );
            recordId = url.searchParams.get('recordid');
            console.log('Record ID:', recordId);
        } catch (urlError) {
            console.error('URL parsing error:', urlError.message);
            return new Response(
                JSON.stringify({
                    error: `Failed to parse URL: ${urlError.message}`
                }),
                {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // Construct webhook URL
        const webhookUrlObj = new URL(webhookBaseUrl);
        if (recordId) {
            webhookUrlObj.searchParams.set('recordid', recordId);
        }
        const finalWebhookUrl = webhookUrlObj.toString();
        console.log('Final Webhook URL:', finalWebhookUrl);

        // Trigger webhook
        let webhookResponse;
        try {
            webhookResponse = await fetch(finalWebhookUrl, {
                method: 'POST'
            });
            console.log('Webhook response status:', webhookResponse.status);
            if (!webhookResponse.ok) {
                console.error(
                    `Webhook failed with status: ${webhookResponse.status}`
                );
            }
        } catch (fetchError) {
            console.error('Webhook fetch error:', fetchError.message);
            // Continue to redirect even if webhook fails, as per your requirements
        }

        // Always return a Response object
        return new Response(null, {
            status: 302,
            headers: { Location: formUrl }
        });
    } catch (error) {
        // Log detailed error and return a response
        console.error('Function error:', error.message, error.stack);
        return new Response(
            JSON.stringify({ error: `Function crashed: ${error.message}` }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
};
