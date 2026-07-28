import Vendor from "../models/Vendor.js";

export const createVendorService = async (organizationId, { name, category, contactInfo }) => {
  const exists = await Vendor.findOne({ organizationId, name });
  if (exists) throw { status: 409, message: "Vendor already exists" };
  return Vendor.create({ organizationId, name, category: category || null, contactInfo: contactInfo || {} });
};

export const listVendorsService = async (organizationId, { search } = {}) => {
  const filter = { organizationId, isActive: true };
  if (search) filter.name = { $regex: search, $options: "i" };
  return Vendor.find(filter).sort({ totalSpend: -1, name: 1 });
};

export const getVendorService = async (organizationId, id) => {
  const vendor = await Vendor.findOne({ _id: id, organizationId });
  if (!vendor) throw { status: 404, message: "Vendor not found" };
  return vendor;
};

export const updateVendorService = async (organizationId, id, updates) => {
  const vendor = await Vendor.findOneAndUpdate({ _id: id, organizationId }, updates, { new: true, runValidators: true });
  if (!vendor) throw { status: 404, message: "Vendor not found" };
  return vendor;
};

export const deleteVendorService = async (organizationId, id) => {
  const vendor = await Vendor.findOneAndDelete({ _id: id, organizationId });
  if (!vendor) throw { status: 404, message: "Vendor not found" };
  return vendor;
};

// Called from expenseService when an approved expense links to a vendor —
// this is the "analyze spend per vendor" requirement (doc module 12).
export const incrementVendorSpend = async (organizationId, vendorId, amount) => {
  if (!vendorId) return;
  await Vendor.updateOne({ _id: vendorId, organizationId }, { $inc: { totalSpend: amount } });
};
