const SubscriptionsModel = require("../models/SubscriptionsModel.js");
const webpush = require("web-push");

webpush.setVapidDetails(
    "mailto:you@example.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
);

async function subscribeToNotifications (req, res) {
    // Validate the request body
    if (!req.body || !req.body.endpoint || !req.body.keys) {
        return res.status(400).json({ message: "Invalid subscription data" });
    }   
    const subscription = req.body;
    console.log("Received subscription:", subscription);
    await SubscriptionsModel.updateOne({ endpoint: subscription.endpoint }, subscription, { upsert: true });
    res.status(201).json({ message: "Subscribed" });
}

module.exports = { subscribeToNotifications };