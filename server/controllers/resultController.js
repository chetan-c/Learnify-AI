// server/controllers/resultController.js
import Result from '../models/Result.js';
import PDF from '../models/PDF.js';
import { evaluateAnswer, compareMCQAnswers } from '../utils/examEvaluator.js';

// @desc    Save exam result and calculate score
// @route   POST /api/results
// @access  Private
export const saveResult = async (req, res) => {
    try {
        const { pdfId, examData, answers } = req.body;

        if (!pdfId || !examData || !answers) {
            return res.status(400).json({ message: 'Missing required result data' });
        }

        // Basic scoring logic
        // examData.questions should have the correct answers
        let score = 0;
        let totalPoints = 0;

        const scoredAnswers = [];
        for (const userAns of answers) {
            const question = examData.questions.find(q => q.id === userAns.questionId);
            if (!question) {
                scoredAnswers.push({ ...userAns, isCorrect: false, awardedPoints: 0 });
                continue;
            }

            const points = question.points || 1;
            totalPoints += points;

            if (question.type && question.type.toLowerCase() !== 'mcq') {
                // Descriptive: use semantic evaluator
                const pdfDoc = await PDF.findById(pdfId).select('extractedText');
                const pdfText = pdfDoc?.extractedText || '';
                const evalResult = evaluateAnswer(userAns.userAnswer || '', pdfText);
                const awarded = Math.round((evalResult.score / 100) * points);
                score += awarded;
                scoredAnswers.push({ ...userAns, isCorrect: evalResult.score >= 60, awardedPoints: awarded, eval: evalResult });
            } else {
                // MCQ: use robust answer comparison
                const isCorrect = compareMCQAnswers(userAns.userAnswer, question.answer || question.answerKey);
                if (isCorrect) score += points;
                scoredAnswers.push({ ...userAns, isCorrect, awardedPoints: isCorrect ? points : 0 });
            }
        }

        const result = await Result.create({
            user: req.user._id,
            pdf: pdfId,
            examData,
            answers: scoredAnswers,
            score,
            totalPoints,
            feedback: `You scored ${score} out of ${totalPoints}. ${score / totalPoints >= 0.7 ? 'Great work!' : 'Keep studying the document for better results.'}`
        });

        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's results
// @route   GET /api/results
// @access  Private
export const getUserResults = async (req, res) => {
    try {
        const results = await Result.find({ user: req.user._id })
            .populate('pdf', 'name')
            .sort({ createdAt: -1 });
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get specific result by ID
// @route   GET /api/results/:id
// @access  Private
export const getResultById = async (req, res) => {
    try {
        const result = await Result.findById(req.params.id).populate('pdf', 'name');

        if (!result) {
            return res.status(404).json({ message: 'Result not found' });
        }

        // Security check: ensure user owns the result or is admin
        if (result.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view this result' });
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
