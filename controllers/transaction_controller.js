const transaction_model = require("../models/transaction_model");
const moment = require('moment');

const expenseCategories = ['Food', 'Entertainment', 'Travel', 'Utilities', 'Groceries', 'Products', 'Savings'];
const incomeCategories = ['Salary', 'Dividend', 'Gift'];

const parseTransactionPayload = (payload) => ({
    ...payload,
    amount: Number(payload.amount),
    description: payload.description?.trim(),
    category: payload.category?.trim(),
    type: payload.type?.trim(),
});

const validateTransactionPayload = (payload) => {
    if (!payload.amount || !payload.type || !payload.category || !payload.description || !payload.date) {
        return 'Amount, type, category, description, and date are required.';
    }

    if (Number.isNaN(Number(payload.amount)) || Number(payload.amount) <= 0) {
        return 'Amount must be a valid number greater than 0.';
    }

    if (!['Income', 'Expense'].includes(payload.type)) {
        return 'Type must be either Income or Expense.';
    }

    const allowedCategories = payload.type === 'Income' ? incomeCategories : expenseCategories;

    if (!allowedCategories.includes(payload.category)) {
        return `Category must match the selected ${payload.type.toLowerCase()} type.`;
    }

    return null;
};

const resolveDateFilter = ({ frequency, selectDate, selectedPeriod }) => {
    if (frequency === 'all') {
        return {};
    }

    if (frequency === 'custom') {
        if (!Array.isArray(selectDate) || selectDate.length !== 2) {
            return {};
        }

        return {
            date: {
                $gte: moment(selectDate[0]).startOf('day').toDate(),
                $lte: moment(selectDate[1]).endOf('day').toDate(),
            },
        };
    }

    const baseDate = selectedPeriod ? moment(selectedPeriod) : moment();

    if (!baseDate.isValid()) {
        return {};
    }

    const unitMap = {
        daily: 'day',
        weekly: 'week',
        monthly: 'month',
        yearly: 'year',
    };

    const unit = unitMap[frequency] || 'week';

    return {
        date: {
            $gte: baseDate.clone().startOf(unit).toDate(),
            $lte: baseDate.clone().endOf(unit).toDate(),
        },
    };
};

const getallts = async (req, res) => {
    try {
        const { frequency, selectDate, selectedPeriod, type } = req.body;

        const dateFilter = resolveDateFilter({ frequency, selectDate, selectedPeriod });

        const trs = await transaction_model.find({
            ...dateFilter,
            ...(type !== 'ALL' && { type }),
            userid: req.user.userId,
        }).sort({ date: -1, createdAt: -1 });

        res.status(200).json({
            success: true,
            transactions: trs,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Unable to fetch transactions.' });
    }
};

const addts = async (req, res) => {
    try {
        const payload = {
            ...parseTransactionPayload(req.body),
            userid: req.user.userId,
        };
        const validationError = validateTransactionPayload(payload);

        if (validationError) {
            return res.status(400).json({ success: false, message: validationError });
        }

        const newtr = new transaction_model(payload);
        await newtr.save();
        res.status(201).json({
            success: true,
            message: 'Transaction created successfully.',
            transaction: newtr,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Unable to create transaction.' });
    }
};

const editts = async (req, res) => {
    try {
        const { trs_id, payload } = req.body;

        if (!trs_id || !payload) {
            return res.status(400).json({ success: false, message: 'Transaction id and payload are required.' });
        }

        const normalizedPayload = parseTransactionPayload(payload);
        const validationError = validateTransactionPayload(normalizedPayload);

        if (validationError) {
            return res.status(400).json({ success: false, message: validationError });
        }

        const updatedTransaction = await transaction_model.findOneAndUpdate(
            { _id: trs_id, userid: req.user.userId },
            { ...normalizedPayload, userid: req.user.userId },
            { new: true, runValidators: true }
        );

        if (!updatedTransaction) {
            return res.status(404).json({ success: false, message: 'Transaction not found.' });
        }

        res.status(200).json({
            success: true,
            message: 'Transaction updated successfully.',
            transaction: updatedTransaction,
        });
    } 
    catch (error) {
        res.status(500).json({ success: false, message: 'Unable to update transaction.' });
    }
}

const delts = async (req, res) => {
    try {
        const { trs_id } = req.body;

        if (!trs_id) {
            return res.status(400).json({ success: false, message: 'Transaction id is required.' });
        }

        const deletedTransaction = await transaction_model.findOneAndDelete({ _id: trs_id, userid: req.user.userId });

        if (!deletedTransaction) {
            return res.status(404).json({ success: false, message: 'Transaction not found.' });
        }

        res.status(200).json({
            success: true,
            message: 'Transaction deleted successfully.',
            transaction: deletedTransaction,
        });
    } 
    catch (error) {
        res.status(500).json({ success: false, message: 'Unable to delete transaction.' });
    }
}

module.exports = { getallts, addts, editts, delts };
