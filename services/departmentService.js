import Department from "../models/Department.js";
import User from "../models/User.js";

export const createDepartmentService = async (organizationId, { name, managerId, branchId, allocatedBudget }) => {
  const exists = await Department.findOne({ organizationId, name });
  if (exists) throw { status: 409, message: "A department with this name already exists" };

  if (managerId) {
    const mgr = await User.findOne({ _id: managerId, organizationId });
    if (!mgr) throw { status: 404, message: "Manager not found in this organization" };
  }

  return Department.create({ organizationId, name, managerId: managerId || null, branchId: branchId || null, allocatedBudget: allocatedBudget || 0 });
};

export const listDepartmentsService = async (organizationId) =>
  Department.find({ organizationId }).populate("managerId", "name email").populate("branchId", "name").sort({ name: 1 });

export const getDepartmentService = async (organizationId, id) => {
  const dept = await Department.findOne({ _id: id, organizationId }).populate("managerId", "name email");
  if (!dept) throw { status: 404, message: "Department not found" };
  return dept;
};

export const updateDepartmentService = async (organizationId, id, updates) => {
  const dept = await Department.findOneAndUpdate({ _id: id, organizationId }, updates, { new: true, runValidators: true });
  if (!dept) throw { status: 404, message: "Department not found" };
  return dept;
};

export const deleteDepartmentService = async (organizationId, id) => {
  const dept = await Department.findOneAndDelete({ _id: id, organizationId });
  if (!dept) throw { status: 404, message: "Department not found" };
  return dept;
};
