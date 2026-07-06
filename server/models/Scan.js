import mongoose from 'mongoose';

const scanSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    trim: true,
  },
  scannedAt: {
    type: Date,
    default: Date.now,
  },
  duration: String,
  score: {
    score: Number,
    label: String,
    color: String,
    summary: {
      totalHeadersMissing: Number,
      totalPathsExposed: Number,
      sslIssues: Number,
    },
  },
  isHttps: Boolean,
  certDaysLeft: Number,
}, {
  timestamps: false,
});

export default mongoose.model('Scan', scanSchema);