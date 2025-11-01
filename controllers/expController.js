import Exp from "../models/exp.js";
//CREATE
export const createExp = async (req, res) => {
  try {
    const newExp = await Exp.create(req.body);
    res.status(201).json(newExp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ
export const getExps = async (req, res) => {
  const exps = await Exp.find();
  res.json(exps);
};

// UPDATE
export const updateExp = async (req, res) => {
  const exp = await Exp.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(exp);
};

// DELETE
export const deleteExp = async (req, res) => {
  await Exp.findByIdAndDelete(req.params.id);
  res.json({ message: "Exp deleted successfully" });
};

//filter 
export const filterExp = async (req, res) => {
  try {
    const filter = { owner: req.user._id };

    if (req.query.category) filter.category = req.query.category;

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


//monthlyReport
export const monthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const start = new Date(`${year}-${month}-01`);
    const end = new Date(start);
    end.setMonth(start.getMonth() + 1);

    const result = await Exp.aggregate([
      {
        $match: {
          owner: req.user._id, // 🔥 this is where $match goes
          date: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: "$category",
          totalSpent: { $sum: "$amount" },
        },
      },
    ]);

    const totalSpent = result.reduce((sum, cat) => sum + cat.totalSpent, 0);

    res.json({ month, totalSpent, categoryBreakdown: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
