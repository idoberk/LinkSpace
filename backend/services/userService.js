const User = require('../models/User');

const removeUserFromFriends = async (userId, session = null) => {
	const filter = { friends: userId };
	const update = {
		$pull: { friends: userId },
		$inc: { 'stats.totalFriends': -1 },
	};
	const options = session ? { session } : {};
	return User.updateMany(filter, update, options);
};

const removeUserFromFriendRequests = async (userId, session = null) => {
	const filter = {};
	const update = {
		$pull: {
			'friendRequests.sent': { user: userId },
			'friendRequests.received': { user: userId },
		},
	};
	const options = session ? { session } : {};
	return User.updateMany(filter, update, options);
};

/**
 * Atomically increments or decrements a user's stat field.
 * @param {string|ObjectId} userId - The user ID
 * @param {string} statField - The stats field to update (e.g., 'stats.totalPosts')
 * @param {number} increment - The amount to increment (or decrement)
 * @param {Object} [session] - Optional mongoose session
 * @returns {Promise<Object>} - The update result
 */
const updateUserStat = async (userId, statField, increment, session = null) => {
	const update = { $inc: { [statField]: increment } };
	const options = session ? { session } : {};
	return User.findByIdAndUpdate(userId, update, options);
};

/**
 * Sets a user's stat field to a specific value (e.g., after recalculating totalFriends).
 * @param {string|ObjectId} userId - The user ID
 * @param {string} statField - The stats field to set (e.g., 'stats.totalFriends')
 * @param {number} value - The value to set
 * @param {Object} [session] - Optional mongoose session
 * @returns {Promise<Object>} - The update result
 */
const setUserStatToCount = async (userId, statField, value, session = null) => {
	const update = { $set: { [statField]: value } };
	const options = session ? { session } : {};
	return User.findByIdAndUpdate(userId, update, options);
};

module.exports = {
	removeUserFromFriends,
	removeUserFromFriendRequests,
	updateUserStat,
	setUserStatToCount,
};
