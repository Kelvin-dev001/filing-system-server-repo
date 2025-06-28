const mongoose = require('mongoose');

const PassportGrantedSchema = new mongoose.Schema({
  number: String, // Número
  issueDate: Date, // Data
  expiryDate: Date, // Prazo de Validade
  country: String // Países
});

const RepatriationSchema = new mongoose.Schema({
  date: Date, // Data
  conditions: String, // Condições
  stateCharges: String // Encargos para o Estado
});

const ConsularFileSchema = new mongoose.Schema({
  fileNumber: { type: String, required: true, index: true }, // index for file number search
  name: { type: String, index: true }, // index for name search
  openedOn: Date, // Aberto em ... de ... de ...
  spouse: String, // Cônjuge
  observations: String, // Observações
  passportsGranted: [PassportGrantedSchema], // Passaportes Concedidos
  repatriations: [RepatriationSchema], // Repatriações
  civilNotarialActs: String, // Actos de registo civil e notariado
  applicantSignature: String, // Assinatura do inscrito
  // Optionally, link to registration:
  registrationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration' }
}, { timestamps: true });

// Compound text index for name and fileNumber
ConsularFileSchema.index({ name: "text", fileNumber: "text" });

module.exports = mongoose.model('ConsularFile', ConsularFileSchema);