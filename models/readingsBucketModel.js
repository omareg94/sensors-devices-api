// This readingsBucketModel isn't implemented totally yet (to do later)
  // Alternative simple readings storing is used temporarily
  // Based on thoughts from article: https://www.mongodb.com/blog/post/time-series-data-and-mongodb-part-2-schema-design-best-practices

const mongoose = require('mongoose');

const { Schema } = mongoose;

const readingsBucketSchema = new Schema(
  {
    // _id: {type: Schema.Types.ObjectId },    // Id of readings bucket
    ofDevice: { type: String },     // device id that had the reading
    startTime: { type: String },    // readings start time
    endTime: { type: String },     // readings end time
    count: { type: String },     // readings count
    readings: { type: Array }    // array of readings
  }
);

const readingsBucketModel = mongoose.model('ReadingsBucket', readingsBucketSchema);
module.exports = readingsBucketModel;