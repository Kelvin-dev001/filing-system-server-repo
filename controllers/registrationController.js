const Registration = require('../models/registration');

// Create
exports.createRegistration = async (req, res) => {
  try {
    // Allow only valid fields from the schema
    const {
      fullName, fileNumber, countryPlaceOfBirth, birthDate, maritalStatus, profession,
      fatherName, motherName, education, workplaceOrSchool, phone, cellPhone,
      passportOrIdType, passportOrIdNumber, passportIssuedAt, passportValidUntil,
      residenceKenya, location, residenceMozambique, district, documentsPresented,
      issuedOn, entryDateKenya, currentResidence, observations, spouse,
      familyMozambique, familyUnder15, consularCardNumber, consularCardIssueDate,
      passports, repatriations, civilActs, passportPhoto, formImages
    } = req.body;

    // Ensure familyUnder15 supports ageType (years/months)
    const sanitizedFamilyUnder15 = Array.isArray(familyUnder15)
      ? familyUnder15.map(m => ({
          ...m,
          ageType: m.ageType === "months" ? "months" : "years", // default to years if missing/invalid
        }))
      : [];

    // Optionally, same for familyMozambique if you want ageType there too
    const sanitizedFamilyMozambique = Array.isArray(familyMozambique)
      ? familyMozambique.map(m => ({
          ...m,
          ageType: m.ageType === "months" ? "months" : "years", // default to years if missing/invalid
        }))
      : [];

    const newReg = new Registration({
      fullName, fileNumber, countryPlaceOfBirth, birthDate, maritalStatus, profession,
      fatherName, motherName, education, workplaceOrSchool, phone, cellPhone,
      passportOrIdType, passportOrIdNumber, passportIssuedAt, passportValidUntil,
      residenceKenya, location, residenceMozambique, district, documentsPresented,
      issuedOn, entryDateKenya, currentResidence, observations, spouse,
      familyMozambique: sanitizedFamilyMozambique,
      familyUnder15: sanitizedFamilyUnder15,
      consularCardNumber, consularCardIssueDate,
      passports, repatriations, civilActs, passportPhoto, formImages
    });

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

    // Search by fullName, fileNumber, passportOrIdType, passportOrIdNumber
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { fileNumber: { $regex: search, $options: 'i' } },
        { passportOrIdNumber: { $regex: search, $options: 'i' } },
        { passportOrIdType: { $regex: search, $options: 'i' } }
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
    // Only allow updating schema fields
    const updateFields = { ...req.body };

    // Ensure familyUnder15 supports ageType (years/months)
    if (Array.isArray(updateFields.familyUnder15)) {
      updateFields.familyUnder15 = updateFields.familyUnder15.map(m => ({
        ...m,
        ageType: m.ageType === "months" ? "months" : "years"
      }));
    }
    // Optionally, same for familyMozambique if you want ageType there too
    if (Array.isArray(updateFields.familyMozambique)) {
      updateFields.familyMozambique = updateFields.familyMozambique.map(m => ({
        ...m,
        ageType: m.ageType === "months" ? "months" : "years"
      }));
    }

    const updated = await Registration.findByIdAndUpdate(req.params.id, updateFields, { new: true });
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