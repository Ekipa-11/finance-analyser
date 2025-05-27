var CategoryModel = require('../models/CategoryModel.js');

/**
 * CategoryController.js
 *
 * @description :: Server-side logic for managing Categorys.
 */
/**
 * CategoryController.list()
 */
async function list(req, res) {
    try {
        const categories = await CategoryModel.find();
        return res.json(categories);
    } catch (err) {
        return res.status(500).json({ message: 'Error when getting Category.', error: err });
    }
}

/**
 * CategoryController.show()
 */
async function show(req, res) {
    try {
        const category = await CategoryModel.findOne({ _id: req.params.id });
        if (!category) return res.status(404).json({ message: 'No such Category' });
        return res.json(category);
    } catch (err) {
        return res.status(500).json({ message: 'Error when getting Category.', error: err });
    }
}

/**
 * CategoryController.create()
 */
async function create(req, res) {
    try {
        // Check if every required field is present
        if (!req.body || !req.body.name)
            return res.status(400).json({ message: 'Missing name.' });
        // Check if the user is authenticated
        if (!req.user || !req.user.id)
            return res.status(401).json({ message: 'Unauthorized: User ID is missing' });
        // Create a new category
        if (typeof req.body.name !== 'string' || req.body.name.trim() === '')
            return res.status(400).json({ message: 'Invalid name. It should be a non-empty string.' });
        if (req.body.name.length > 50)
            return res.status(400).json({ message: 'Name is too long. Maximum length is 50 characters.' });
        if (req.body.name.length < 3)
            return res.status(400).json({ message: 'Name is too short. Minimum length is 3 characters.' });
        // Create a new category
        const category = new CategoryModel({
            name: req.body.name,
            created_at: Date.now(),
            updated_at: Date.now(),
        });
        const savedCategory = await category.save();
        return res.status(201).json(savedCategory);
    } catch (err) {
        return res.status(500).json({ message: 'Error when creating Category', error: err });
    }
}

/**
 * CategoryController.update()
 */
async function update(req, res) {
    try {
        // Check if the request body is present
        if (!req.body) return res.status(400).json({ message: 'Request body is missing' });
        // Check if the user ID is present
        if (!req.user || !req.user.id) return res.status(401).json({ message: 'Unauthorized: User ID is missing' });
        const category = await CategoryModel.findOne({ _id: req.params.id });
        if (!category) return res.status(404).json({ message: 'No such Category' });
        // Update the category fields
        category.name = req.body.name ? req.body.name : category.name;
        category.updated_at = Date.now();
        // Validate the name field
        if (typeof category.name !== 'string' || category.name.trim() === '')
            return res.status(400).json({ message: 'Invalid name. It should be a non-empty string.' });
        if (category.name.length > 50)
            return res.status(400).json({ message: 'Name is too long. Maximum length is 50 characters.' });
        if (category.name.length < 3)
            return res.status(400).json({ message: 'Name is too short. Minimum length is 3 characters.' });
        
        const updatedCategory = await category.save();
        return res.json(updatedCategory);
    } catch (err) {
        return res.status(500).json({ message: 'Error when updating Category.', error: err });
    }
}

/**
 * CategoryController.remove()
 */
async function remove(req, res) {
    try {
        await CategoryModel.findByIdAndRemove(req.params.id);
        return res.status(204).json();
    } catch (err) {
        return res.status(500).json({ message: 'Error when deleting the Category.', error: err });
    }
}

module.exports = { list, show, create, update, remove };
