// server/models/PDF.js

import mongoose from 'mongoose';

const pdfSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    originalName: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
    },

    filePath: {
      type: String,
      required: true,
    },

    extractedText: {
      type: String,
    },

    isProcessed: {
      type: Boolean,
      default: false,
    },
    metadata: {
      topics: [String],
      concepts: [String],
      summary: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('PDF', pdfSchema);
