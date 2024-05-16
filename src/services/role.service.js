import RoleSchema from "../models/role.model.js";

export const getRole = async (role) => {
    return await RoleSchema.find(role);
  };

export const getRoleByLabel = async (label) => {
    return await RoleSchema.findOne({label})
};