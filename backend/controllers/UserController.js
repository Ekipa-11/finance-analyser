const UserModel = require("../models/UserModel.js");
const TransactionModel = require("../models/TransactionModel.js");
const BudgetModel = require("../models/BudgetModel.js");
const NotificationModel = require("../models/NotificationModel.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function hashPassword(pass) {
    const salt = await bcrypt.genSalt(10);
    hashedPass = await bcrypt.hash(pass, salt);
    return hashedPass;
}

/**
 * UserController.js
 *
 * @description :: Server-side logic for managing Users.
 */

async function list(req, res) {
    try {
        const users = await UserModel.find();
        return res.json(users);
    } catch (err) {
        return res.status(500).json({
            message: "Error when getting User.",
            error: err,
        });
    }
}

async function show(req, res) {
    const id = req.params.id;
    try {
        const user = await UserModel.findOne({ _id: id });
        if (!user) {
            return res.status(404).json({
                message: "No such User",
            });
        }
        return res.json(user);
    } catch (err) {
        return res.status(500).json({
            message: "Error when getting User.",
            error: err,
        });
    }
}

async function show_with_all(req, res) {
    const id = req.params.id;
    try {
        // Check if the user is authenticated
        if (!req.user || !req.user.id) return res.status(401).json({ message: "Unauthorized: User ID is missing" });
        const user = await UserModel.findOne({ _id: id });
        if (!user) return res.status(404).json({ message: "No such User" });
        // Check if the user is trying to access their own profile
        if (req.user.id !== id) return res.status(403).json({ message: "You are not authorized to access this user" });
        // Fetch transactions, budgets, and notifications for the user
        const transactions = await TransactionModel.find({ user_id: id });
        const budgets = await BudgetModel.find({ user_id: id });
        const notifications = await NotificationModel.find({ user_id: id });
        // Return user data along with transactions, budgets, and notifications
        const userJson = user.toJSON ? user.toJSON() : user;
        userJson.transactions = transactions;
        userJson.budgets = budgets;
        userJson.notifications = notifications;
        return res.json(userJson);
    } catch (err) {
        return res.status(500).json({ message: "Error when getting User.", error: err });
    }
}

async function me(req, res) {
    try {
        // Check if the user is authenticated
        if (!req.user || !req.user.id) return res.status(401).json({ message: "Unauthorized: User ID is missing" });
        // Fetch the authenticated user
        const user = await UserModel.findOne({ _id: req.user.id });
        if (!user) return res.status(404).json({ message: "No such User" });
        // Fetch transactions, budgets, and notifications for the user
        const transactions = await TransactionModel.find({ user_id: req.user.id });
        const budgets = await BudgetModel.find({ user_id: req.user.id });
        const notifications = await NotificationModel.find({ user_id: req.user.id });
        // Return user data along with transactions, budgets, and notifications
        const userJson = user.toJSON ? user.toJSON() : user;
        userJson.transactions = transactions;
        userJson.budgets = budgets;
        userJson.notifications = notifications;
        return res.json(userJson);
    }
    catch (err) {
        return res.status(500).json({ message: "Error when getting User.", error: err });
    }
}

async function update(req, res) {
    const id = req.params.id;
    try {
        const user = await UserModel.findOne({ _id: id });
        // Check if the user exists
        if (!user) return res.status(404).json({ message: "No such User" });
        // Check if the user is trying to update their own profile
        if (req.user.id !== id) return res.status(403).json({ message: "You are not authorized to update this user" });

        user.username = req.body.username ? req.body.username : user.username;
        if (req.body.password) user.password = await hashPassword(req.body.password);
        user.email = req.body.email ? req.body.email : user.email;
        user.updated_at = new Date();

        const updatedUser = await user.save();
        return res.json(updatedUser);
    } catch (err) {
        return res.status(500).json({
            message: "Error when updating User.",
            error: err,
        });
    }
}

async function remove(req, res) {
    const id = req.params.id;
    try {
        const user = await UserModel.findById(id);
        if (!user) return res.status(404).json({ message: "No such User" });
        if (req.user.id !== id) return res.status(403).json({ message: "You are not authorized to delete this user" });

        // Delete all transactions, budgets, and notifications associated with the user
        await TransactionModel.deleteMany({ user_id: id });
        await BudgetModel.deleteMany({ user_id: id });
        await NotificationModel.deleteMany({ user_id: id });
        // Delete the user
        await UserModel.deleteOne({ _id: id });
        return res.status(204).json();
    } catch (err) {
        return res.status(500).json({
            message: "Error when deleting the User.",
            error: err,
        });
    }
}

async function login(req, res) {
    try {
        // Check if email and password are provided
        if (!req.body.email || !req.body.password) return res.status(400).json({ message: "Email and password are required for login" });

        const { email, password } = req.body;

        // find user
        const user = await UserModel.findOne({ email });
        if (!user) return res.status(400).json({ message: "User doesn't exist" });

        // check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // generate JWT token
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || "default_jwt_secret", { expiresIn: "1h" });
        
        res.setHeader("X-AuthToken", token);
        res.setHeader("Authorization", `Bearer ${token}`);
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function register(req, res) {
    try {
        // Check if email, password, and username are provided
        if (!req.body.email || !req.body.password || !req.body.username)
            return res.status(400).json({ message: "Email, password, and username are required" });

        const { username, email, password } = req.body;

        // Check if email already exists
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }
        // Check if username already exists
        const existingUsername = await UserModel.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: "Username already exists" });
        }

        // Password at least 6 characters
        if (!password || password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long",
            });
        }

        // Create new user
        const newUser = new UserModel({
            username,
            email,
            password: await hashPassword(password),
            created_at: new Date(),
            updated_at: new Date(),
        });

        const savedUser = await newUser.save();

        // Generate JWT token
        const token = jwt.sign({ id: savedUser._id, email: savedUser.email }, process.env.JWT_SECRET || "default_jwt_secret", { expiresIn: "1h" });

        res.setHeader("X-AuthToken", token);
        res.setHeader("Authorization", `Bearer ${token}`);
        res.status(201).json({ token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = { list, show, show_with_all, me, update, remove, login, register };
