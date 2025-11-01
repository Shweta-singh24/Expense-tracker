import Exp from "../models/exp.js";

export const monthlyReport = async (req, res) => {
  try {
    // 1️⃣ Get month & year from query
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({ message: "Please provide month and year" });
    }

    // 2️⃣ Calculate date range for that month
    const start = new Date(`${year}-${month}-01`);
    const end = new Date(start);
    end.setMonth(start.getMonth() + 1);

    // 3️⃣ Run aggregation pipeline
    const result = await Exp.aggregate([
      {
        $match: {
          // 🔐 include user filter if using auth
          // owner: req.user._id,
          date: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: "$category",
          totalSpent: { $sum: "$amount" },
          expenses: { $push: "$$ROOT" }, // optional: keep list of expenses
        },
      },
      {
        $sort: { totalSpent: -1 },
      },
    ]);

    // 4️⃣ Compute overall stats
    const totalSpent = result.reduce((sum, cat) => sum + cat.totalSpent, 0);
    const topCategory = result.length > 0 ? result[0]._id : null;

    // 5️⃣ Find highest spending day
    const dayData = await Exp.aggregate([
      {
        $match: { date: { $gte: start, $lt: end } },
      },
      {
        $group: {
          _id: { $dayOfMonth: "$date" },
          dailySpent: { $sum: "$amount" },
        },
      },
      { $sort: { dailySpent: -1 } },
      { $limit: 1 },
    ]);

    const highestSpendingDay = dayData.length > 0
      ? `${year}-${month}-${String(dayData[0]._id).padStart(2, "0")}`
      : null;

    // 6️⃣ Send report
    res.json({
      month: `${year}-${month}`,
      totalSpent,
      categoryBreakdown: result.map(r => ({
        category: r._id,
        total: r.totalSpent,
      })),
      topCategory,
      highestSpendingDay,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
