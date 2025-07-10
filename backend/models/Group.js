const mongoose = require('mongoose');
const { MAX_CONTENT_LENGTH } = require('../utils/constants');

const groupSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
		description: {
			type: String,
			maxLength: MAX_CONTENT_LENGTH,
		},
		category: {
			type: String,
			enum: [
				'technology',
				'sports',
				'music',
				'gaming',
				'education',
				'business',
				'art',
				'health',
				'food',
				'travel',
				'photography',
				'books',
				'movies',
				'politics',
				'science',
				'other',
			],
			required: true,
			default: 'other',
		},
		privacy: {
			type: String,
			enum: ['public', 'private'],
			default: 'public',
		},
		coverImage: {
			url: { type: String },
			publicId: { type: String },
		},
		creator: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		admins: [
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
		settings: {
			joiningRequiresApproval: {
				type: Boolean,
				default: true,
			},
			ownershipTransfer: {
				enabled: {
					type: Boolean,
					default: true,
				},
				requireApproval: {
					type: Boolean,
					default: false,
				},
				minimumMembersForTransfer: {
					type: Number,
					default: 2,
				},
			},
			activity: {
				lastActivity: {
					type: Date,
					default: Date.now,
				},
				activeMembersCount: {
					type: Number,
					default: 0,
				},
			},
		},
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
groupSchema.index({ creator: 1 });
groupSchema.index({ 'members.user': 1 });
groupSchema.index({ admins: 1 });

module.exports = mongoose.model('Group', groupSchema);
