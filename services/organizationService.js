import Organization from "../models/Organization.js";

export const getMyOrganizationService = async (organizationId) => {
  const org = await Organization.findById(organizationId).populate("subscriptionPlanId");
  if (!org) throw { status: 404, message: "Organization not found" };
  return org;
};

const EDITABLE_FIELDS = ["name", "phone", "logo", "address"];
export const updateOrganizationService = async (organizationId, updates) => {
  const patch = {};
  for (const key of EDITABLE_FIELDS) if (updates[key] !== undefined) patch[key] = updates[key];
  const org = await Organization.findByIdAndUpdate(organizationId, patch, { new: true, runValidators: true });
  if (!org) throw { status: 404, message: "Organization not found" };
  return org;
};

/** Org-level preferences: currency, fiscal year, approval workflow, policy rules (doc module 2/9/10). */
export const updateOrganizationSettingsService = async (organizationId, settingsPatch) => {
  const org = await Organization.findById(organizationId);
  if (!org) throw { status: 404, message: "Organization not found" };
  org.settings = { ...org.settings.toObject(), ...settingsPatch };
  await org.save();
  return org;
};
