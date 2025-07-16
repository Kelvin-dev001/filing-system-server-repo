const mongoose = require('mongoose');

// Update: FamilyMemberSchema now supports ageType (years/months)
const FamilyMemberSchema = new mongoose.Schema({
  name: String,
  relationship: String,
  age: Number,
  ageType: {
    type: String,
    enum: ["years", "months"],
    default: "years"
  },
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
  fileNumber: { type: String, required: true, index: true },
  countryPlaceOfBirth: String,
  birthDate: Date,
  maritalStatus: String,
  profession: String,
  fatherName: String,
  motherName: String,
  education: String,
  workplaceOrSchool: String,
  phone: String,

  passportOrIdType: { 
    type: String, 
    enum: ["Passport", "C. Emergencia", "BI", "Cédula Pessoal"], 
    default: "Passport" 
  },
  passportOrIdNumber: String,
  passportIssuedAt: String,
  passportValidUntil: Date,
  residenceKenya: String,
  district: String,
  location: String,
  residenceMozambique: String,
  cellPhone: String,
  documentsPresented: String,
  issuedOn: Date,
  entryDateKenya: Date,
  currentResidence: String,
  observations: String,
  spouse: SpouseSchema,
  familyMozambique: [FamilyMemberSchema],
  // Change: familyUnder15 can store ageType for months/years
  familyUnder15: [FamilyMemberSchema],
  passportPhoto: String, // path to uploaded photo
  formImages: [String],   // additional images
}, { timestamps: true });

RegistrationSchema.index({ fullName: "text", fileNumber: "text" });

module.exports = mongoose.model('Registration', RegistrationSchema);