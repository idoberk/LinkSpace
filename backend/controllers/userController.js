const User = require('../models/User');

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
		res.status(500).json({ error: 'Error fetching users' });
	}
};

const getUserById = async (req, res) => {
	try {
		const user = await User.findById(req.params.id).select('-password');

		if (!user) {
			return res.status(404).json({
				error: 'User was not found',
			});
		}

		const viewerId = req.user?.userId;
		const publicProfile = user.getPublicProfile(viewerId);

		res.json(publicProfile);
	} catch (error) {
		res.status(500).json({ error: error.message });
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
				'profile.firstName profile.lastName profile.avatar profile.address settings.privacy.locationInfo createdAt',
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
		res.status(500).json({ error: 'Error searching users' });
	}
};

module.exports = { getAllUsers, getUserById, searchUser };
