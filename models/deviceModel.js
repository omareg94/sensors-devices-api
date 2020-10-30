const mongoose = require('mongoose');

const { Schema } = mongoose;

const deviceSchema = new Schema(
  {
    // _id: {type: Schema.Types.ObjectId },     // id of deviceSchema
    name: { type: String, required: true },
    owner: { type: Schema.Types.Mixed },    // can be a string or array of strings (multiple users)
    added: { type: Number, default: Date.now },    // time this device was added
    type: { type: String, required: true },     // (e.g. temperature, acidity, oxygen-percentage, … )
    modelName: { type: String },
    location: { type: [Number], validate: [(arr) => (arr.length <= 10), '{PATH} exceeds the limit of 2'] },
    locationNotes: { type: String },
    manufacturer: { type: String },
    description: { type: String },    // custom description that user can write
    retired: { type: Boolean, default: false },
    readings: { type: Array, default: [] }    // To move readings to readingsBucket later
  }
);

const deviceModel = mongoose.model('Device', deviceSchema);     // create deviceModel out of deviceSchema
module.exports = deviceModel;