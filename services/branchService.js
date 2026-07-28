import Branch from "../models/Branch.js";

export const createBranchService = async (organizationId, { name, location, allocatedBudget }) => {
  const exists = await Branch.findOne({ organizationId, name });
  if (exists) throw { status: 409, message: "A branch with this name already exists" };
  return Branch.create({ organizationId, name, location: location || null, allocatedBudget: allocatedBudget || 0 });
};

export const listBranchesService = async (organizationId) => Branch.find({ organizationId }).sort({ name: 1 });

export const getBranchService = async (organizationId, id) => {
  const branch = await Branch.findOne({ _id: id, organizationId });
  if (!branch) throw { status: 404, message: "Branch not found" };
  return branch;
};

export const updateBranchService = async (organizationId, id, updates) => {
  const branch = await Branch.findOneAndUpdate({ _id: id, organizationId }, updates, { new: true, runValidators: true });
  if (!branch) throw { status: 404, message: "Branch not found" };
  return branch;
};

export const deleteBranchService = async (organizationId, id) => {
  const branch = await Branch.findOneAndDelete({ _id: id, organizationId });
  if (!branch) throw { status: 404, message: "Branch not found" };
  return branch;
};
