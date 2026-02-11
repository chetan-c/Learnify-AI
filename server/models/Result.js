// server/models/Result.js

import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        pdf: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PDF',
            required: true,
        },
        examData: {
            type: Object, // Stores the JSON structure of the exam
            required: true,
        },
        answers: [
            {
                questionId: Number,
                userAnswer: String,
                isCorrect: Boolean,
            },
        ],
        score: {
            type: Number,
            required: true,
        },
        totalPoints: {
            type: Number,
            required: true,
        },
        feedback: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Result', resultSchema);
