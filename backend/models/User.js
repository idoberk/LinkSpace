const validator = require('validator');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: [true, 'Username is required'],
			unique: true,
			trim: true,
			minLength: [
				3,
				'Username must be at least 3 characters long, got {VALUE}',
			],
			maxLength: [30, 'Username cannot exceed 30 characters'],
		},
		email: {
			type: String,
			required: [true, 'Email is required'],
			unique: true,
			lowercase: true,
			trim: true,
			validate: {
				validator: validator.isEmail,
				message: 'Invalid email address',
			},
		},
		password: {
			type: String,
			required: [true, 'Password is required'],
			minLength: [
				6,
				'Password must be at least 6 characters long, got {VALUE}',
			],
		},
	},
	{
		timestamps: true,
	},
);

module.exports = mongoose.model('User', userSchema);
