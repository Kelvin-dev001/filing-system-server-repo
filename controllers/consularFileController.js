const ConsularFile = require('../models/consularFile');

// Create a new consular file
exports.createConsularFile = async (req, res) => {
  try {
    const newFile = new ConsularFile(req.body);
    await newFile.save();
    res.status(201).json(newFile);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all consular files with pagination & search
exports.getConsularFiles = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", dateFrom, dateTo } = req.query;
    const query = {};

    // Only search fields that exist in the model: name and fileNumber
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { fileNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Date filter (by createdAt)
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const total = await ConsularFile.countDocuments(query);
    const files = await ConsularFile.find(query)
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      records: files,
      totalPages: Math.ceil(total / limit),
      total,
      page: Number(page)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single consular file by ID
exports.getConsularFileById = async (req, res) => {
  try {
    const file = await ConsularFile.findById(req.params.id);
    if (!file) return res.status(404).json({ message: "Not found" });
    res.json(file);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a consular file
exports.updateConsularFile = async (req, res) => {
  try {
    const updated = await ConsularFile.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a consular file
exports.deleteConsularFile = async (req, res) => {
  try {
    await ConsularFile.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Legacy search by fileNumber
exports.searchConsularFiles = async (req, res) => {
  const { fileNumber } = req.query;
  try {
    const results = await ConsularFile.find({
      fileNumber: { $regex: fileNumber, $options: 'i' }
    });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};