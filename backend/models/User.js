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
		profile: {
			firstName: {
				type: String,
				trim: true,
				maxLength: [
					20,
					'First name cannot exceed 20 characters, got {VALUE}',
				],
			},
			lastName: {
				type: String,
				trim: true,
				maxLength: [
					20,
					'Last name cannot exceed 20 characters, got {VALUE}',
				],
			},
			birthDate: {
				type: Date,
				validate: {
					validator: validator.isDate,
					message: 'Invalid date',
				},
			},
			bio: {
				type: String,
				maxLength: [
					150,
					'Bio cannot exceed 150 characters, got {VALUE}',
				],
				default: '',
			},
			address: {
				type: String,
			},
			avatar: {
				type: String,
				default: '',
			},
		},
		friends: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
			},
		],
		friendRequests: {
			sent: [
				{
					user: {
						type: mongoose.Schema.Types.ObjectId,
						ref: 'User',
					},
					sentAt: {
						type: Date,
						default: Date.now,
					},
				},
			],
			received: [
				{
					user: {
						type: mongoose.Schema.Types.ObjectId,
						ref: 'User',
					},
					receivedAt: {
						type: Date,
						default: Date.now,
					},
				},
			],
		},
		groups: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Group',
			},
		],
		role: {
			type: String,
			enum: ['user', 'admin'],
			default: 'user',
		},
		status: {
			isOnline: {
				type: Boolean,
				default: false,
			},
			lastSeen: {
				type: Date,
				default: Date.now,
			},
		},
		settings: {
			privacy: {
				contactInfo: {
					type: String,
					enum: ['public', 'friends', 'private'],
					default: 'private',
				},
				personalInfo: {
					type: String,
					enum: ['public', 'friends', 'private'],
					default: 'friends',
				},
				locationInfo: {
					type: String,
					enum: ['public', 'friends', 'private'],
					default: 'public',
				},
				showOnlineStatus: {
					type: String,
					enum: ['public', 'friends', 'private'],
					default: 'public',
				},
				showLastSeen: {
					type: String,
					enum: ['public', 'friends', 'private'],
					default: 'public',
				},
			},
			notifications: {
				email: {
					type: Boolean,
					default: true,
				},
				friendRequest: {
					type: Boolean,
					default: false,
				},
				messages: {
					type: Boolean,
					default: false,
				},
				groupInvites: {
					type: Boolean,
					default: false,
				},
			},
		},
		stats: {
			totalPosts: {
				type: Number,
				default: 0,
			},
			totalFriends: {
				type: Number,
				default: 0,
			},
		},
	},
	{
		timestamps: true,
	},
);

// Indexes for better search performance
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ 'profile.firstName': 1, 'profile.lastName': 1 });
userSchema.index({ createdAt: -1 });

const FIELD_GROUPS = {
	contactInfo: ['email', 'phone'],
	personalInfo: ['birthDate', 'bio'],
	locationInfo: ['address'],
};

userSchema.methods.getPublicProfile = function (viewerId) {
	const isOwner = viewerId?.toString() === this._id.toString();
	const isFriend = viewerId && this.isFriendsWith(viewerId);
	const publicProfile = {
		id: this._id,
		username: this.username,
		profile: {
			firstName: this.profile.firstName,
			lastName: this.profile.lastName,
			avatar: this.profile.avatar,
		},
	};

	Object.entries(FIELD_GROUPS).forEach(([groupName, fields]) => {
		const privacyLevel = this.settings.privacy[groupName];
		const canView =
			isOwner ||
			privacyLevel === 'public' ||
			(privacyLevel === 'friends' && isFriend);

		if (canView) {
			fields.forEach((fieldName) => {
				if (this[fieldName]) {
					publicProfile[fieldName] = this[fieldName];
				}
				if (this.profile[fieldName]) {
					publicProfile.profile[fieldName] = this.profile[fieldName];
				}
			});
		}
	});

	return publicProfile;
};

userSchema.virtual('profile.fullName').get(function () {
	if (this.profile.firstName && this.profile.lastName) {
		return `${this.profile.firstName} ${this.profile.lastName}`;
	}

	return this.profile.firstName || this.profile.lastName || this.username;
});

userSchema.methods.comparePassword = async function (candidatePassword) {
	return this.password === candidatePassword;
};

userSchema.methods.isFriendsWith = function (userId) {
	return this.friends.some(
		(friendId) => friendId.toString() === userId.toString(),
	);
};

module.exports = mongoose.model('User', userSchema);
