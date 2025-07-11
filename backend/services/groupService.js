const Group = require('../models/Group');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { createError } = require('../utils/errorUtils');
const { deleteMediaFiles } = require('./mediaService');
const { PAST_30_DAYS } = require('../utils/constants');

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

const isGroupActiveEnough = (group) => {
	const lastActivity = group.settings?.activity?.lastActivity;

	if (!lastActivity) {
		return false;
	}

	const activePastMonth = new Date(Date.now() - PAST_30_DAYS);

	return new Date(lastActivity) > activePastMonth;
};

// TODO: Consider adding more hierarchial transfers (most active member / oldest member / etc...)
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

// TODO: Maybe when deleting groups / posts / etc... delete the folders from cloudinary too and not just the files.

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

	const groupPosts = await Post.find({ group: groupId }, 'media', {
		session,
	});

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
	}

	await Post.deleteMany({ group: groupId }, { session });

	const postIds = groupPosts.map((post) => post._id);

	await Comment.deleteMany({ post: { $in: postIds } }, { session });
	await Group.findByIdAndDelete(groupId, { session });
};

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

module.exports = {
	shouldAllowOwnershipTransfer,
	isGroupActiveEnough,
	findNewGroupOwner,
	transferGroupOwnership,
	deleteGroupAndContent,
	handleUserGroupDeletion,
};
