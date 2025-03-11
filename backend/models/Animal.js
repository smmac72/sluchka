const mongoose = require("mongoose");

const AnimalSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true, trim: true },
  species: { type: String, required: true, enum: ["dog", "cat", "horse", "bird", "rabbit", "other"] },
  breed: { type: String, required: true, trim: true },
  subBreed: { type: String, trim: true },
  gender: { type: String, required: true, enum: ["male", "female"] },
  birthdate: { type: Date },
  color: { type: String, trim: true },
  description: { type: String, trim: true },
  images: [{ type: String }],
  documents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }],
  verified: { type: Boolean, default: false },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

AnimalSchema.virtual("calculatedAge").get(function() {
  if (!this.birthdate) return null;
  const today = new Date();
  const birthDate = new Date(this.birthdate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

module.exports = mongoose.model("Animal", AnimalSchema);
