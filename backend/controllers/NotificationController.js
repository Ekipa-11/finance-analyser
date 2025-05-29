const NotificationModel = require("../models/NotificationModel.js");

/**
 * NotificationController.js
 *
 * @description :: Server-side logic for managing Notifications.
 */

async function list(req, res) {
    try {
        // Check if the user is authenticated
        if (!req.user || !req.user.id) return res.status(401).json({ message: "Unauthorized: User ID is missing" });

        const notifications = await NotificationModel.find({ user_id: req.user.id });
        return res.json(notifications);
    } catch (err) {
        return res.status(500).json({ message: "Error when getting Notification.", error: err });
    }
}

async function show(req, res) {
    const id = req.params.id;
    try {
        // Check if the user is authenticated
        if (!req.user || !req.user.id) return res.status(401).json({ message: "Unauthorized: User ID is missing" });

        const notification = await NotificationModel.findOne({ _id: id });
        // Check if user is trying to access their own notification
        if (notification && notification.user.toString() !== req.user.id)
            return res.status(403).json({ message: "You are not authorized to access this notification" });

        if (!notification) return res.status(404).json({ message: "No such Notification" });
        return res.json(notification);
    } catch (err) {
        return res.status(500).json({ message: "Error when getting Notification.", error: err });
    }
}

async function create(req, res) {
    try {
        // Check if the user is authenticated
        if (!req.user || !req.user.id) return res.status(401).json({ message: "Unauthorized: User ID is missing" });
        // Check if every required field is present
        if (!req.body || !req.body.message || !req.body.type)
            return res.status(400).json({ message: "Missing required fields. All fields: message, type" });

        const notification = new NotificationModel({
            user_id: req.user.id,

            message: req.body.message,
            type: req.body.type,
            read: false,
            created_at: req.body.created_at,
            updated_at: req.body.updated_at,
        });

        const savedNotification = await notification.save();
        return res.status(201).json(savedNotification);
    } catch (err) {
        return res.status(500).json({ message: "Error when creating Notification", error: err });
    }
}

async function update(req, res) {
    const id = req.params.id;
    try {
        const notification = await NotificationModel.findOne({ _id: id });
        if (!notification) return res.status(404).json({ message: "No such Notification" });

        notification.id = req.body.id ? req.body.id : notification.id;
        notification.message = req.body.message ? req.body.message : notification.message;
        notification.type = req.body.type ? req.body.type : notification.type;
        notification.read = req.body.read ? req.body.read : notification.read;
        notification.created_at = req.body.created_at ? req.body.created_at : notification.created_at;
        notification.updated_at = req.body.updated_at ? req.body.updated_at : notification.updated_at;

        const updatedNotification = await notification.save();
        return res.json(updatedNotification);
    } catch (err) {
        return res.status(500).json({ message: "Error when updating Notification.", error: err });
    }
}

async function update_read(req, res) {
    const id = req.params.id;
    try {
        const notification = await NotificationModel.findById(id);
        if (!notification) return res.status(404).json({ message: "No such Notification" });
        if (notification.user_id.toString() !== req.user.id)
            return res.status(403).json({ message: "Forbidden: You can only update your own notifications" });
        notification.read = true; // Mark as read
        notification.updated_at = new Date(); // Update the timestamp
        const updatedNotification = await notification.save();
        return res.json(updatedNotification);
    } catch (err) {
        return res.status(500).json({ message: "Error when updating the Notification.", error: err });
    }
}

async function update_unread(req, res) {
    const id = req.params.id;
    try {
        const notification = await NotificationModel.findById(id);
        if (!notification) return res.status(404).json({ message: "No such Notification" });
        if (notification.user_id.toString() !== req.user.id)
            return res.status(403).json({ message: "Forbidden: You can only update your own notifications" });
        notification.read = false; // Mark as read
        notification.updated_at = new Date(); // Update the timestamp
        const updatedNotification = await notification.save();
        return res.json(updatedNotification);
    } catch (err) {
        return res.status(500).json({ message: "Error when updating the Notification.", error: err });
    }
}

async function remove(req, res) {
    const id = req.params.id;
    try {
        await NotificationModel.findByIdAndRemove(id);
        return res.status(204).json();
    } catch (err) {
        return res.status(500).json({ message: "Error when deleting the Notification.", error: err });
    }
}

module.exports = {
    list,
    show,
    create,
    update,
    remove,
    update_read,
    update_unread,
};
