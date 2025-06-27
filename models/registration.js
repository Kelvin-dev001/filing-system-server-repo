const mongoose = require('mongoose');

const FamilyMemberSchema = new mongoose.Schema({
  name: String,
  relationship: String,
  age: Number,
  residence: String,
});

const SpouseSchema = new mongoose.Schema({
  fullName: String,
  nationality: String,
  idDocument: String,
  profession: String,
  workplace: String,
  cellPhone: String,
});

const RegistrationSchema = new mongoose.Schema({
  fullName: { type: String, required: true, index: true },
  fileNumber: { type: String, index: true },
  countryPlaceOfBirth: String,
  birthDate: Date,
  maritalStatus: String,
  profession: String,
  fatherName: String,
  motherName: String,
  education: String,
  workplaceOrSchool: String,
  phone: String,
  passportOrIdNumber: String,
  passportIssuedAt: String,
  passportValidUntil: Date,
  residenceKenya: String,
  residenceMozambique: String,
  district: String,
  cellPhone: String,
  documentsPresented: String,
  issuedOn: Date,
  entryDateKenya: Date,
  currentResidence: String,
  observations: String,
  spouse: SpouseSchema,
  familyMozambique: [FamilyMemberSchema],
  familyUnder15: [FamilyMemberSchema],
  passportPhoto: String, // path to uploaded photo
  formImages: [String],   // additional images
}, { timestamps: true });

RegistrationSchema.index({ fullName: "text", fileNumber: "text" });

module.exports = mongoose.model('Registration', RegistrationSchema);