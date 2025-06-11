const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			maxLength: 350,
		},
		// category?
		privacy: {
			type: String,
			enum: ['public', 'private'],
			default: 'public',
		},
		coverImage: String,
		creator: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		managers: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
			},
		],
		members: [
			{
				user: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'User',
				},
				joinedAt: {
					type: Date,
					default: Date.now,
				},
				status: {
					type: String,
					enum: ['approved', 'pending', 'blocked'],
					default: 'pending',
				},
			},
		],
		rules: [String],
		stats: {
			totalPosts: {
				type: Number,
				default: 0,
			},
			monthlyPosts: [
				{
					month: String,
					year: Number,
					count: Number,
				},
			],
		},
	},
	{
		timestamps: true,
	},
);

// Index for search
groupSchema.index({ name: 'text', description: 'text' });
groupSchema.index({ category: 1, privacy: 1 });

module.exports = mongoose.model('Group', groupSchema);
