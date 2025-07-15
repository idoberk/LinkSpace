const Group = require('../models/Group');
const Post = require('../models/Post');
const { createError } = require('../utils/errorUtils');
const { deleteMediaFiles } = require('./mediaService');
const { PAST_30_DAYS } = require('../utils/constants');
const { deletePostAndComments } = require('./postService');

/**
 * Checks if group ownership transfer is allowed based on group settings and member count.
 * @param {Object} group - The group document
 * @returns {boolean}
 */
const shouldAllowOwnershipTransfer = (group) => {
	if (!group.settings?.ownershipTransfer?.enabled) {
		return false;
	}

	const minimumMembers =
		group.settings.ownershipTransfer.minimumMembersForTransfer || 2;
	const approvedMembersCount = group.members.filter(
		(member) =>
			member.status === 'approved' &&
			member.user.toString() !== group.creator.toString(),
	);

	return approvedMembersCount >= minimumMembers;
};

/**
 * Checks if the group has been active in the past 30 days.
 * @param {Object} group - The group document
 * @returns {boolean}
 */
const isGroupActiveEnough = (group) => {
	const lastActivity = group.settings?.activity?.lastActivity;

	if (!lastActivity) {
		return false;
	}

	const activePastMonth = new Date(Date.now() - PAST_30_DAYS);

	return new Date(lastActivity) > activePastMonth;
};

/**
 * Finds a new group owner (admin) if the current owner is removed.
 * @param {Object} group - The group document
 * @param {string|ObjectId} currentOwnerId - The current owner's user ID
 * @param {Object} session - Mongoose session
 * @returns {Promise<Object|null>} - The new owner user document or null
 */
const findNewGroupOwner = async (group, currentOwnerId, session) => {
	if (!shouldAllowOwnershipTransfer(group) || !isGroupActiveEnough(group)) {
		return null;
	}
	// Try to find an active admin
	const activeAdmins = group.admins.filter(
		(admin) =>
			admin._id.toString() !== currentOwnerId.toString() &&
			admin.status?.isOnline !== false,
	);

	if (activeAdmins.length > 0) {
		// Return the most recent active admin
		return activeAdmins.sort(
			(a, b) =>
				new Date(b.status?.lastSeen || 0) -
				new Date(a.status?.lastSeen || 0),
		)[0];
	}

	// No suitable replacement found
	return null;
};

/**
 * Transfers group ownership to a new owner.
 * @param {string|ObjectId} groupId - The group ID
 * @param {Object} newOwner - The new owner user document
 * @param {Object} session - Mongoose session
 * @returns {Promise<void>}
 */
const transferGroupOwnership = async (groupId, newOwner, session) => {
	await Group.findByIdAndUpdate(
		groupId,
		{
			creator: newOwner._id,
			$pull: {
				admins: newOwner._id,
				'members.user': newOwner._id,
			},
			$push: {
				admins: newOwner._id,
			},
		},
		{ session },
	);

	// Optional: Log the ownership transfer
	console.log(
		`Group ${groupId} ownership transferred from deleted user to ${newOwner._id}`,
	);
};

/**
 * Deletes a group and all its posts, comments, and media.
 * @param {string|ObjectId} groupId - The group ID
 * @param {Object} session - Mongoose session
 * @returns {Promise<void>}
 */
const deleteGroupAndContent = async (groupId, session) => {
	const group = await Group.findById(groupId).session(session);

	if (!group) {
		throw createError('Group not found', 404);
	}
	if (group.coverImage) {
		try {
			await deleteMediaFiles([group.coverImage]);
			console.log(`Deleted cover image for group ${groupId}`);
		} catch (error) {
			console.log(
				`Error deleting cover image for group ${groupId}:`,
				error,
			);
		}
	}

	const groupPosts = await Post.find({ group: groupId }, null, { session });

	for (const post of groupPosts) {
		if (post.media && post.media.length > 0) {
			try {
				await deleteMediaFiles(post.media);
				console.log(
					`Deleted media for post ${post._id} in group ${groupId}`,
				);
			} catch (error) {
				console.error(
					`Error deleting media for post ${post._id}:`,
					error,
				);
			}
		}
		// Recursively delete post and all its comments
		await deletePostAndComments(post._id, session);
	}

	await Group.findByIdAndDelete(groupId, { session });
};

/**
 * Handles deletion or transfer of groups when a user is deleted.
 * @param {string|ObjectId} userId - The user ID
 * @param {Object} session - Mongoose session
 * @returns {Promise<void>}
 */
const handleUserGroupDeletion = async (userId, session) => {
	// Handle groups created by the user
	const groupsCreatedByUser = await Group.find({ creator: userId })
		.populate('admins', 'status lastSeen')
		.populate('members.user', 'status lastSeen')
		.session(session);

	for (const group of groupsCreatedByUser) {
		const newOwner = await findNewGroupOwner(group, userId, session);

		if (newOwner) {
			// Transfer group ownership
			await transferGroupOwnership(group._id, newOwner, session);
		} else {
			// Couldn't find a suitable replacement, delete the group instead
			await deleteGroupAndContent(group._id, session);
			console.log(
				`Group ${group._id} deleted due to no suitable ownership transfer`,
			);
		}
	}

	// Remove user from all the groups they're a member of
	await Group.updateMany(
		{ 'members.user': userId },
		{ $pull: { members: { user: userId } } },
		{ session },
	);

	// Remove user from all the groups they're an admin of
	await Group.updateMany(
		{ admins: userId },
		{ $pull: { admins: userId } },
		{ session },
	);
};

/**
 * Increments or decrements a numeric stat field for a group.
 * @param {string|ObjectId} groupId - The group ID
 * @param {string} statField - The stats field to update (e.g., 'stats.totalPosts')
 * @param {number} [amount=1] - The amount to increment/decrement
 * @returns {Promise<Object>} - The update result
 */
const updateGroupStat = async (groupId, statField, amount = 1) => {
	return Group.findByIdAndUpdate(groupId, { $inc: { [statField]: amount } });
};

module.exports = {
	shouldAllowOwnershipTransfer,
	isGroupActiveEnough,
	findNewGroupOwner,
	transferGroupOwnership,
	deleteGroupAndContent,
	handleUserGroupDeletion,
	updateGroupStat,
};
