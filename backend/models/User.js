const validator = require('validator');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const {
	MAX_CONTENT_LENGTH,
	MIN_PASS_LENGTH,
	MIN_FIRST_LAST_NAME_LENGTH,
	MAX_FIRST_LAST_NAME_LENGTH,
} = require('../utils/constants');

const userSchema = new mongoose.Schema(
	{
		// phoneNumber?
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
				MIN_PASS_LENGTH,
				`Password must be at least ${MIN_PASS_LENGTH} characters long`,
			],
		},
		profile: {
			firstName: {
				type: String,
				required: [true, 'First name is required'],
				trim: true,
				minLength: [
					MIN_FIRST_LAST_NAME_LENGTH,
					`First name must be at least ${MIN_FIRST_LAST_NAME_LENGTH} characters long`,
				],
				maxLength: [
					MAX_FIRST_LAST_NAME_LENGTH,
					`First name cannot exceed ${MAX_FIRST_LAST_NAME_LENGTH} characters`,
				],
				validate: {
					validator: validator.isAlpha,
					message: 'Name must only contain letters',
				},
			},
			lastName: {
				type: String,
				required: [true, 'Last name is required'],
				trim: true,
				minLength: [
					MIN_FIRST_LAST_NAME_LENGTH,
					`Last name must be at least ${MIN_FIRST_LAST_NAME_LENGTH} characters long`,
				],
				maxLength: [
					MAX_FIRST_LAST_NAME_LENGTH,
					`Last name cannot exceed ${MAX_FIRST_LAST_NAME_LENGTH} characters`,
				],
				validate: {
					validator: validator.isAlpha,
					message: 'Name must only contain letters',
				},
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
					MAX_CONTENT_LENGTH,
					`Bio cannot exceed ${MAX_CONTENT_LENGTH} characters`,
				],
				default: '',
			},
			address: {
				type: String,
			},
			avatar: {
				url: String,
				publicId: String,
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
			// Application's admin, not group's admin. Doesn't have real usage at the moment, but can be useful in the future.
			type: String,
			enum: ['user', 'admin'],
			default: 'user',
		},
		status: {
			isOnline: {
				type: Boolean,
				default: false,
			},
			isActive: {
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
userSchema.index({ 'profile.firstName': 1, 'profile.lastName': 1 });
userSchema.index({ createdAt: -1 });

// Fire function BEFORE a doc has been saved to the database
userSchema.pre('save', async function (next) {
	// Only hash the password if it has been modified or it is new
	if (!this.isModified('password')) {
		return next();
	}

	// Hashing the passwords before saving the user to the database.
	const salt = await bcrypt.genSalt();
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

const FIELD_GROUPS = {
	contactInfo: ['email', 'phone'],
	personalInfo: ['birthDate', 'bio'],
	locationInfo: ['address', 'city'],
};

userSchema.methods.getPublicProfile = function (viewerId) {
	const isOwner = viewerId?.toString() === this._id.toString();
	const isFriend = viewerId && this.isFriendsWith(viewerId);
	const publicProfile = {
		id: this._id,
		displayName: this.profile.fullName,
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
	return `${this.profile.firstName} ${this.profile.lastName}`;
});

userSchema.methods.comparePassword = async function (candidatePassword) {
	return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isFriendsWith = function (userId) {
	return this.friends.some(
		(friendId) => friendId.toString() === userId.toString(),
	);
};

module.exports = mongoose.model('User', userSchema);
