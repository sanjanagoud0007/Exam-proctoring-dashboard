import ProctorLog from "../models/ProctorLogModel.js";

export const createProctorLog = async (data) => {
	// Basic wrapper to create a log entry; expand with validation as needed
	const log = await ProctorLog.create(data);
	return log;
};

export const getAllProctorLogs = async () => {
	return ProctorLog.find();
};

export default {
	createProctorLog,
	getAllProctorLogs,
};
