const User = require('../models/User');
const { handleErrors } = require('../middleware/errorHandler');
const { createError } = require('../utils/errorUtils');
const {
	setUserStatToCount,
} = require('../services/userService');

// Operations users can do with other users (search users, send friend requests, etc...)

const getAllUsers = async (req, res) => {
	try {
		const {
			page = 1,
			limit = 10,
			search,
			sortBy = 'createdAt',
		} = req.query;
		const skip = (page - 1) * limit;

		let query = {};

		if (search) {
			query = {
				$or: [
					{ 'profile.firstName': { $regex: search, $options: 'i' } },
					{ 'profile.lastName': { $regex: search, $options: 'i' } },
					{ email: { $regex: search, $options: 'i' } },
				],
			};
		}

		const users = await User.find(query)
			.select('-password')
			.sort({ [sortBy]: -1 })
			.limit(parseInt(limit))
			.skip(skip);

		const usersWithDisplayName = users.map((user) => ({
			...user.toObject(),
			displayName: user.profile.fullName,
		}));

		const total = await User.countDocuments(query);

		res.json({
			users: usersWithDisplayName,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				pages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status || 500).json({ errors });
	}
};

const getUserById = async (req, res) => {
	try {
		const user = await User.findById(req.params.id).select('-password');

		if (!user) {
			throw createError('User not found', 404);
		}

		const viewerId = req.user?.userId;
		const publicProfile = user.getPublicProfile(viewerId);

		res.json(publicProfile);
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status || 500).json({ errors });
	}
};

const searchUser = async (req, res) => {
	try {
		const {
			firstName,
			lastName,
			city,
			joinedAfter,
			joinedBefore,
			page = 1,
			limit = 10,
		} = req.query;
		const skip = (page - 1) * limit;
		let query = {};

		if (firstName) {
			query['profile.firstName'] = { $regex: firstName, $options: 'i' };
		}
		if (lastName) {
			query['profile.lastName'] = { $regex: lastName, $options: 'i' };
		}
		if (city) {
			query.$and = [
				{ 'profile.address': { $regex: city, $options: 'i' } },
				{ 'settings.privacy.locationInfo': { $ne: 'private' } },
			];
		}
		if (joinedAfter || joinedBefore) {
			query.createdAt = {};

			if (joinedAfter) {
				query.createdAt.$gte = new Date(joinedAfter);
			}
			if (joinedBefore) {
				query.createdAt.$lte = new Date(joinedBefore);
			}
		}

		const users = await User.find(query)
			.select(
				'profile.firstName profile.lastName profile.avatar profile.coverImage profile.address settings.privacy.locationInfo createdAt',
			)
			.sort({ createdAt: -1 })
			.limit(parseInt(limit))
			.skip(skip);

		const viewerId = req.user?.userId;
		const foundUsers = users.map((user) => {
			const userObj = user.toObject();
			const isFriend = viewerId && user.isFriendsWith(viewerId);
			const isOwner = viewerId === user._id.toString();

			const result = {
				_id: user._id,
				displayName: user.profile.fullName,
				profile: {
					firstName: user.profile.firstName,
					lastName: user.profile.lastName,
					avatar: user.profile.avatar,
					coverImage: user.profile.coverImage,
				},
				createdAt: user.createdAt,
			};

			const canViewLocation =
				isOwner ||
				userObj.settings.privacy.locationInfo === 'public' ||
				(userObj.settings.privacy.locationInfo === 'friends' &&
					isFriend);

			if (canViewLocation && userObj.profile.address) {
				result.profile.address = userObj.profile.address;
			}

			return result;
		});

		const total = await User.countDocuments(query);

		res.json({
			users: foundUsers,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				pages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status || 500).json({ errors });
	}
};

const sendFriendRequest = async (req, res) => {
	try {
		const senderId = req.user.userId;
		const receiverId = req.params.id;

		if (senderId === receiverId) {
			throw createError('Cannot send friend request to yourself', 400);
		}
		const sender = await User.findById(senderId);
		const receiver = await User.findById(receiverId);

		if (!receiver) {
			throw createError('User not found', 404);
		}

		if (sender.isFriendsWith(receiverId)) {
			throw createError('Already friends with this user', 400);
		}

		const existingRequest = sender.friendRequests.sent.find(
			(req) => req.user.toString() === receiverId,
		);

		if (existingRequest) {
			throw createError('Friend request already sent', 400);
		}

		sender.friendRequests.sent.push({ user: receiverId });
		receiver.friendRequests.received.push({ user: senderId });

		await sender.save();
		await receiver.save();

		res.json({ message: 'Friend request sent successfully' });
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status || 500).json({ errors });
	}
};

const acceptFriendRequest = async (req, res) => {
	try {
		const userId = req.user.userId;
		const friendId = req.params.id;

		const user = await User.findById(userId);
		const friend = await User.findById(friendId);

		if (!friend) {
			throw createError('User not found', 404);
		}

		const requestIndex = user.friendRequests.received.findIndex(
			(req) => req.user.toString() === friendId,
		);

		if (requestIndex === -1) {
			throw createError('No friend request from this user', 400);
		}

		user.friendRequests.received.splice(requestIndex, 1);

		const sentIndex = friend.friendRequests.sent.findIndex(
			(req) => req.user.toString() === userId,
		);

		if (sentIndex !== -1) {
			friend.friendRequests.sent.splice(sentIndex, 1);
		}

		user.friends.push(friendId);
		friend.friends.push(userId);

		await setUserStatToCount(
			userId,
			'stats.totalFriends',
			user.friends.length,
		);
		await setUserStatToCount(
			friendId,
			'stats.totalFriends',
			friend.friends.length,
		);

		await user.save();
		await friend.save();

		res.json({ message: 'Friend request accepted' });
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status || 500).json({ errors });
	}
};

const rejectFriendRequest = async (req, res) => {
	try {
		const userId = req.user.userId;
		const friendId = req.params.id;

		const user = await User.findById(userId);
		const friend = await User.findById(friendId);

		if (!friend) {
			throw createError('User not found', 404);
		}

		user.friendRequests.received = user.friendRequests.received.filter(
			(req) => req.user.toString() !== friendId,
		);

		friend.friendRequests.sent = friend.friendRequests.sent.filter(
			(req) => req.user.toString() !== userId,
		);

		await user.save();
		await friend.save();

		res.json({ message: 'Friend request rejected' });
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status || 500).json({ errors });
	}
};

const removeFriend = async (req, res) => {
	try {
		const userId = req.user.userId;
		const friendId = req.params.id;

		const user = await User.findById(userId);
		const friend = await User.findById(friendId);

		if (!friend) {
			throw createError('User not found', 404);
		}

		user.friends = user.friends.filter((f) => f.toString() !== friendId);
		friend.friends = friend.friends.filter((f) => f.toString() !== userId);

		await setUserStatToCount(
			userId,
			'stats.totalFriends',
			user.friends.length,
		);
		await setUserStatToCount(
			friendId,
			'stats.totalFriends',
			friend.friends.length,
		);

		await user.save();
		await friend.save();

		res.json({ message: 'Friend removed successfully' });
	} catch (error) {
		const errors = handleErrors(error);
		res.status(errors.status || 500).json({ errors });
	}
};

module.exports = {
	getAllUsers,
	getUserById,
	searchUser,
	sendFriendRequest,
	acceptFriendRequest,
	rejectFriendRequest,
	removeFriend,
};
