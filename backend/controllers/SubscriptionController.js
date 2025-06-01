const SubscriptionsModel = require("../models/SubscriptionsModel.js");
const webpush = require("web-push");

webpush.setVapidDetails(
    "mailto:you@example.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
);

async function subscribeToNotifications (req, res) {
    const subscription = req.body;
    await SubscriptionsModel.updateOne({ endpoint: subscription.endpoint }, subscription, { upsert: true });
    res.status(201).json({ message: "Subscribed" });
}

module.exports = { subscribeToNotifications };