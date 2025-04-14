require('dotenv').config(); // Load environment variables from .env file

export default async (req, context) => {
    // Use environment variables with fallback values
    const formUrl =
        process.env.FORM_URL ||
        'https://airtable.com/appBh07Fo0Y1BWw36/pagkAikW1Nz4tMzuy/form';
    const webhookBaseUrl =
        process.env.WEBHOOK_URL ||
        'https://hooks.zapier.com/hooks/catch/666916/2rtoy3n/';

    // Detect if running in Netlify Dev (local) or production
    const isNetlifyDev = process.env.NETLIFY_DEV === 'true';

    try {
        // Log environment details for debugging
        console.log('FORM_URL:', formUrl);
        console.log('WEBHOOK_URL:', webhookBaseUrl);
        console.log('NETLIFY_DEV:', process.env.NETLIFY_DEV);
        console.log('Request URL:', req.url);

        // Validate environment variables
        if (!formUrl || !webhookBaseUrl) {
            console.error('Missing FORM_URL or WEBHOOK_URL');
            if (isNetlifyDev) {
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
            return {
                statusCode: 500,
                body: JSON.stringify({
                    error: 'Server configuration error: Missing environment variables'
                })
            };
        }

        // Extract recordid from query parameters with simplified URL parsing
        let recordId = null;
        try {
            // Use a fixed base URL since req.headers.host might be unreliable
            const url = new URL(
                req.url,
                'https://mark-level-completed.netlify.app'
            );
            recordId = url.searchParams.get('recordid');
            console.log('Record ID:', recordId);
        } catch (urlError) {
            console.error('URL parsing error:', urlError.message);
            if (isNetlifyDev) {
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
            return {
                statusCode: 500,
                body: JSON.stringify({
                    error: `Failed to parse URL: ${urlError.message}`
                })
            };
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

        // Return redirect response based on environment
        if (isNetlifyDev) {
            return new Response(null, {
                status: 302,
                headers: { Location: formUrl }
            });
        }
        return {
            statusCode: 302,
            headers: {
                Location: formUrl
            }
        };
    } catch (error) {
        // Log detailed error and return a response
        console.error('Function error:', error.message, error.stack);
        if (isNetlifyDev) {
            return new Response(
                JSON.stringify({ error: `Function crashed: ${error.message}` }),
                {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: `Function crashed: ${error.message}`
            })
        };
    }
};
