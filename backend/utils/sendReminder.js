const webpush = require("web-push");
const SubscriptionsModel = require("../models/SubscriptionsModel");

webpush.setVapidDetails("mailto:finance@analyser.si", process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);

async function sendPushNotification(subscription, data) {
    try {
        const payload = JSON.stringify(data);
        await webpush.sendNotification(subscription, payload);
    } catch (error) {
        try {
            // Handle errors, such as stale subscriptions
            if (error.statusCode === 410 || error.statusCode === 404) {
                console.log("Removing stale subscription:", subscription.endpoint);
                await SubscriptionsModel.deleteOne({ endpoint: subscription.endpoint });
            } else console.error("Error sending push notification:", error);
        } catch (deleteError) {
            console.error("Error removing stale subscription:", deleteError);
        }
    }
}

async function sendReminder() {
    // Send to all subscribers:
    const subs = await SubscriptionsModel.find();
    if (!subs || subs.length === 0) {
        console.log("Trying to send budget reminder, but no subscribers found for reminders.");
        return;
    }
    console.log("Sending budget reminder...", subs.length, "subscribers found.");
    subs.forEach((sub) =>
        sendPushNotification(sub, {
            title: "📈 Finances Reminder",
            body: "Don’t forget to log today’s expenses!",
        })
    );
}

module.exports = { sendPushNotification, sendReminder };
