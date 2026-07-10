"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const User_1 = require("../models/User");
const Task_1 = require("../models/Task");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const formatters_1 = require("../utils/formatters");
exports.userService = {
    async getAll(req) {
        const users = await User_1.User.find({ workspaceId: req.user.workspaceId }).sort({ createdAt: 1 });
        return users.map(formatters_1.formatUser);
    },
    async getById(id) {
        const user = await User_1.User.findById(id);
        return user ? (0, formatters_1.formatUser)(user) : null;
    },
    async create(data, req) {
        const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
        const user = await User_1.User.create({
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: (0, formatters_1.roleFromClient)(data.role) ?? 'DEV',
            teamId: data.teamId || null,
            workspaceId: req.user.workspaceId
        });
        return (0, formatters_1.formatUser)(user);
    },
    async update(id, data) {
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.email !== undefined)
            updateData.email = data.email;
        if (data.role !== undefined)
            updateData.role = (0, formatters_1.roleFromClient)(data.role);
        if (data.teamId !== undefined)
            updateData.teamId = data.teamId || null;
        if (data.password !== undefined)
            updateData.password = await bcryptjs_1.default.hash(data.password, 10);
        const user = await User_1.User.findByIdAndUpdate(id, updateData, { new: true });
        return user ? (0, formatters_1.formatUser)(user) : null;
    },
    async delete(id) {
        await Task_1.Task.updateMany({ assignedTo: id }, { $set: { assignedTo: null } });
        await User_1.User.findByIdAndDelete(id);
        return { success: true };
    }
};
