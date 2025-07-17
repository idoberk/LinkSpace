const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Group = require('../models/Group');

exports.getUserStatistics = async (req, res) => {
  try {
    // Get all users
    const users = await User.find({});
    const totalUsers = users.length;
    
    // Calculate statistics
    const roles = {};
    let totalFriends = 0;
    let totalPosts = 0;
    let totalComments = 0;
    let totalGroups = 0;
    
    // Get posts count
    const posts = await Post.find({});
    totalPosts = posts.length;
    
    // Get comments count
    const comments = await Comment.find({});
    totalComments = comments.length;
    
    // Get groups count
    const groups = await Group.find({});
    totalGroups = groups.length;

    users.forEach(user => {
      // Count roles
      const role = user.role || 'user';
      roles[role] = (roles[role] || 0) + 1;
      
      // Count friends
      totalFriends += user.friends ? user.friends.length : 0;
    });

    const avgFriends = totalUsers > 0 ? (totalFriends / totalUsers).toFixed(2) : 0;
    const avgPosts = totalUsers > 0 ? (totalPosts / totalUsers).toFixed(2) : 0;
    const avgComments = totalUsers > 0 ? (totalComments / totalUsers).toFixed(2) : 0;

    res.json({
      totalUsers,
      totalPosts,
      totalComments,
      totalGroups,
      totalFriends,
      avgFriends: parseFloat(avgFriends),
      avgPosts: parseFloat(avgPosts),
      avgComments: parseFloat(avgComments),
      roles,
      recentActivity: {
        lastWeekUsers: users.filter(user => {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return new Date(user.createdAt) > weekAgo;
        }).length,
        lastMonthUsers: users.filter(user => {
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return new Date(user.createdAt) > monthAgo;
        }).length
      }
    });
  } catch (err) {
    console.error('Statistics error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}; 