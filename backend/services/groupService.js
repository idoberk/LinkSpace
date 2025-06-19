const Group = require('../models/Group');
const Comment = require('../models/Comment');
const Post = require('../models/Post');

const shouldAllowOwnershipTransfer = (group) => {
	if (!group.settings?.ownershipTransfer?.enabled) {
		return false;
	}

	const minimumMembers =
		group.settings.ownershipTransfer.minimumMembersForTransfer || 2;
	const approvedMembersCount = group.memers.filter(
		(member) =>
			member.status === 'approved' &&
			member.user.toString() !== group.creator.toString(),
	);

	return approvedMembersCount >= minimumMembers;
};

const isGroupActiveEnough = (group) => {
	const lastActivity = group.settings?.activity?.lastActivity;

	if (!lastActivity) {
		return false;
	}

	const activePastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

	return new Date(lastActivity) > activePastMonth;
};

// TODO: Consider adding more hierarchial transfers (most active member / oldest member / etc...)
const findNewGroupOwner = async (group, currentOwnerId, session) => {
	if (!shouldAllowOwnershipTransfer(group) || !isGroupActiveEnough(group)) {
		return null;
	}
	// Try to find an active manager
	const activeManagers = group.managers.filter(
		(manager) =>
			manager._id.toString() !== currentOwnerId.toString() &&
			manager.status?.isOnline !== false,
	);

	if (activeManagers.length > 0) {
		// Return the most recent active manager
		return activeManagers.sort(
			(a, b) =>
				new Date(b.status?.lastSeen || 0) -
				new Date(a.status?.lastSeen || 0),
		)[0];
	}

	// No suitable replacement found
	return null;
};

const transferGroupOwnership = async (groupId, newOwner, session) => {
	await Group.findByIdAndUpdate(
		groupId,
		{
			creator: newOwner._id,
			$pull: {
				managers: newOwner._id,
				'members.user': newOwner._id,
			},
			$push: {
				managers: newOwner._id,
			},
		},
		{ session },
	);

	// Optional: Log the ownership transfer
	console.log(
		`Group ${groupId} ownership transferred from deleted user to ${newOwner._id}`,
	);
};

const deleteGroupAndContent = async (groupId, session) => {
	await Post.deleteMany({ group: groupId }, { session });

	const groupPosts = await Post.find({ group: groupId }, '_id', { session });
	const postIds = groupPosts.map((post) => post._id);

	await Comment.deleteMany({ post: { $in: postIds } }, { session });
	await Group.findByIdAndDelete(groupId, { session });

	console.log(
		`Group ${groupId} deleted due to no suitable ownership transfer`,
	);
};

const handleUserGroupDeletion = async (userId, session) => {
	// Handle groups created by the user
	const groupsCreatedByUser = await Group.find({ creator: userId })
		.populate('managers', 'status lastSeen')
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
		}
	}

	// Remove user from all the groups they're a member of
	await Group.updateMany(
		{ 'members.user': userId },
		{ $pull: { 'members.user': userId } },
		{ session },
	);

	// Remove user from all the groups they're a manager of
	await Group.updateMany(
		{ managers: userId },
		{ $pull: { managers: userId } },
		{ session },
	);
};

module.exports = {
	shouldAllowOwnershipTransfer,
	isGroupActiveEnough,
	findNewGroupOwner,
	transferGroupOwnership,
	deleteGroupAndContent,
	handleUserGroupDeletion,
};
