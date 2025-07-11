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
			url: String,
			publicId: String,
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
					enum: ['approved', 'pending'],
					default: 'pending',
				},
			},
		],
		banList: [
			{
				user: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'User',
					required: true,
				},
				bannedAt: {
					type: Date,
					default: Date.now,
				},
				bannedBy: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'User',
					required: true,
				},
				reason: {
					type: String,
					maxLength: MAX_CONTENT_LENGTH,
				},
			},
		],
		membershipHistory: [
			{
				user: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'User',
				},
				action: {
					type: String,
					enum: [
						'joined',
						'left',
						'removed',
						'banned',
						'promoted_to_admin',
						'demoted_from_admin',
					],
					required: true,
				},
				date: {
					type: Date,
					default: Date.now,
				},
				performedBy: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'User',
				},
				reason: {
					type: String,
					maxLength: MAX_CONTENT_LENGTH,
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
			},
		},
		stats: {
			totalPosts: {
				type: Number,
				default: 0,
			},
			totalMembers: {
				type: Number,
				default: 0,
			},
			totalBanned: {
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
groupSchema.index({ 'banList.user': 1 });
groupSchema.index({ 'membershipHistory.user': 1 });
groupSchema.index({ admins: 1 });

groupSchema.methods.isUserBanned = function (userId) {
	return this.banList.some(
		(ban) => ban.user.toString() === userId.toString(),
	);
};

groupSchema.virtual('pendingMembers').get(function () {
	return this.members.filter((member) => member.status === 'pending');
});

groupSchema.virtual('approvedMembers').get(function () {
	return this.members.filter((member) => member.status === 'approved');
});

module.exports = mongoose.model('Group', groupSchema);
