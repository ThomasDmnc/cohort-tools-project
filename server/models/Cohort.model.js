const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cohortSchema = new Schema({
  cohortSlug: { type: String, unique: true, require: true },
  cohortName: { type: String, require: true },
  program: {
    type: String,
    enum: ["Web Dev", "UX/UI", "Data Analytics", "Cybersecurity"],
  },
  format: { type: String, enum: ["FullTime", "PartTime"] },
  campus: {
    type: String,
    enum: [
      "Madrid",
      "Barcelona",
      "Miami",
      "Paris",
      "Berlin",
      "Amsterdam",
      "Lisbon",
      "Remote",
    ],
  },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  inProgress: { type: Boolean, default: false },
  programManager: { type: String, require: true },
  leadTeacher: { type: String, require: true },
  totalHours: { type: Number, default: 360 },
});

const Cohort = mongoose.model("Cohort", cohortSchema);
module.exports = Cohort;
