import Exp from "../models/Exp.js";

// CREATE
export const createExp = async (req, res) => {
  try {
    const { title, amount, category } = req.body;

    if (!title || !amount || !category) {
      return res.status(400).json({ message: "Title, amount and category are required" });
    }

    // CloudinaryStorage uploads directly — req.file.path is the secure URL
    const receiptUrl = req.file ? req.file.path : null;

    const newExp = await Exp.create({
      ...req.body,
      owner: req.user._id,
      receipt: receiptUrl,
    });

    res.status(201).json(newExp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ 
export const getExps = async (req, res) => {
  try {
    const exps = await Exp.find({ owner: req.user._id });
    res.json(exps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE
export const updateExp = async (req, res) => {
  try {
    const exp = await Exp.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true }
    );

    if (!exp) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json(exp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE 
export const deleteExp = async (req, res) => {
  try {
    const exp = await Exp.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!exp) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// FILTER
export const filterExp = async (req, res) => {
  try {
    const filter = { owner: req.user._id };

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.date) {
      const date = new Date(req.query.date);
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      filter.date = { $gte: date, $lt: nextDate };
    }

    if (req.query.month && req.query.year) {
      const start = new Date(`${req.query.year}-${req.query.month}-01`);
      const end = new Date(start);
      end.setMonth(start.getMonth() + 1);

      filter.date = { $gte: start, $lt: end };
    }

    const expenses = await Exp.find(filter);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const monthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: "month and year query params are required" });
    }

    const start = new Date(`${year}-${month}-01`);
    const end = new Date(start);
    end.setMonth(start.getMonth() + 1);

    const report = await Exp.aggregate([
      {
        $match: {
          owner: req.user._id,
          date: { $gte: start, $lt: end }
        }
      },
      {
        $group: {
          _id: "$category",
          totalSpent: { $sum: "$amount" }
        }
      }
    ]);

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
