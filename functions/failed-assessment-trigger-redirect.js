// functions/failed-assessment-trigger-redirect.js
import { triggerWebhook } from '../utils/triggerWebhook.js';

export default async (req, context) => {
    const formUrl =
        process.env.FORM_URL ||
        'https://airtable.com/appBh07Fo0Y1BWw36/pagkAikW1Nz4tMzuy/form';
    const webhookBaseUrl =
        process.env.FAILED_WEBHOOK_URL ||
        'https://hooks.zapier.com/hooks/catch/666916/2st11jh/';

    return triggerWebhook(req, webhookBaseUrl, formUrl);
};
