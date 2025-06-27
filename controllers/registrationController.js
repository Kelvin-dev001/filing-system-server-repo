const Registration = require('../models/registration');

// Create
exports.createRegistration = async (req, res) => {
  try {
    const newReg = new Registration(req.body);
    await newReg.save();
    res.status(201).json(newReg);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Read all (with pagination and search)
exports.getRegistrations = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", dateFrom, dateTo } = req.query;
    const query = {};

    // Search by fullName or fileNumber or passportOrIdNumber
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { fileNumber: { $regex: search, $options: 'i' } },
        { passportOrIdNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Date filter (createdAt)
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const total = await Registration.countDocuments(query);
    const regs = await Registration.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      records: regs,
      totalPages: Math.ceil(total / limit),
      total,
      page: Number(page)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Read single
exports.getRegistrationById = async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id);
    if (!reg) return res.status(404).json({ message: "Not found" });
    res.json(reg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update
exports.updateRegistration = async (req, res) => {
  try {
    const updated = await Registration.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete
exports.deleteRegistration = async (req, res) => {
  try {
    await Registration.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Legacy search endpoint
exports.searchRegistrations = async (req, res) => {
  const { name } = req.query;
  try {
    const results = await Registration.find({
      fullName: { $regex: name, $options: 'i' }
    });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};