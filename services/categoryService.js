import Category from "../models/Category.js";

export const createCategoryService = async (organizationId, { name, icon }) => {
  const exists = await Category.findOne({ organizationId, name });
  if (exists) throw { status: 409, message: "Category already exists" };
  return Category.create({ organizationId, name, icon: icon || null, isDefault: false });
};

// Returns platform defaults (organizationId: null) + this org's custom categories.
export const listCategoriesService = async (organizationId) =>
  Category.find({ isActive: true, $or: [{ organizationId: null }, { organizationId }] }).sort({ isDefault: -1, name: 1 });

export const updateCategoryService = async (organizationId, id, updates) => {
  const cat = await Category.findOneAndUpdate({ _id: id, organizationId }, updates, { new: true, runValidators: true });
  if (!cat) throw { status: 404, message: "Category not found or not editable (platform defaults are Super Admin only)" };
  return cat;
};

export const deleteCategoryService = async (organizationId, id) => {
  const cat = await Category.findOneAndDelete({ _id: id, organizationId });
  if (!cat) throw { status: 404, message: "Category not found or not deletable" };
  return cat;
};

// Super Admin only — manage the platform-wide default category list (doc 6.5).
export const createPlatformCategoryService = async ({ name, icon }) => {
  const exists = await Category.findOne({ organizationId: null, name });
  if (exists) throw { status: 409, message: "Platform category already exists" };
  return Category.create({ organizationId: null, name, icon: icon || null, isDefault: true });
};
