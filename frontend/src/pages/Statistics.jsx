import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';
import api from '../lib/axios';

const Statistics = () => {
  const weeklyChartRef = useRef();
  const monthlyChartRef = useRef();
  const yearlyChartRef = useRef();
  const [comments, setComments] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCommentsData();
  }, []);

  const fetchCommentsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch comments directly from the comments API
      const commentsRes = await api.get('/comments');
      const allComments = commentsRes.data.comments || [];
      
      console.log('Comments from API:', allComments);
      
      const commentCounts = {};
      const weeklyComments = {};
      const monthlyComments = {};
      const yearlyComments = {};
      
      allComments.forEach(comment => {
        // Count comments per user
        if (comment.author) {
          const authorId = comment.author._id;
          commentCounts[authorId] = (commentCounts[authorId] || 0) + 1;
        }
        
        const date = new Date(comment.createdAt);
        
        // Count comments per week
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
        const weekKey = `${weekStart.getFullYear()}-W${Math.ceil((weekStart.getDate() + 6) / 7)}`;
        weeklyComments[weekKey] = (weeklyComments[weekKey] || 0) + 1;
        
        // Count comments per month
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        monthlyComments[monthKey] = (monthlyComments[monthKey] || 0) + 1;
        
        // Count comments per year
        const yearKey = `${date.getFullYear()}`;
        yearlyComments[yearKey] = (yearlyComments[yearKey] || 0) + 1;
      });
      
      // Statistics
      const totalComments = allComments.length;
      const commentsWithUsers = allComments.filter(c => c.author).length;
      const anonymousComments = totalComments - commentsWithUsers;
      
      // Top commenters
      const topCommenters = Object.entries(commentCounts)
        .map(([authorId, count]) => {
          const comment = allComments.find(c => c.author?._id === authorId);
          return {
            username: comment?.author?.profile?.firstName + ' ' + comment?.author?.profile?.lastName,
            email: comment?.author?.email,
            profilePicture: comment?.author?.profile?.avatar,
            count
          };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      // Weekly data
      const weeklyData = Object.entries(weeklyComments)
        .map(([weekKey, count]) => {
          const [year, week] = weekKey.split('-W');
          return {
            _id: { year: parseInt(year), week: parseInt(week) },
            count
          };
        })
        .sort((a, b) => {
          if (a._id.year !== b._id.year) return b._id.year - a._id.year;
          return b._id.week - a._id.week;
        });

      // Monthly data
      const monthlyData = Object.entries(monthlyComments)
        .map(([monthKey, count]) => {
          const [year, month] = monthKey.split('-');
          return {
            _id: { year: parseInt(year), month: parseInt(month) },
            count
          };
        })
        .sort((a, b) => {
          if (a._id.year !== b._id.year) return b._id.year - a._id.year;
          return b._id.month - a._id.month;
        });

      // Yearly data
      const yearlyData = Object.entries(yearlyComments)
        .map(([yearKey, count]) => {
          return {
            _id: { year: parseInt(yearKey) },
            count
          };
        })
        .sort((a, b) => b._id.year - a._id.year);
      
      setComments(allComments);
      setStatistics({
        totalComments,
        commentsWithUsers,
        anonymousComments,
        weeklyComments: weeklyData,
        monthlyComments: monthlyData,
        yearlyComments: yearlyData,
        topCommenters
      });
      
    } catch (err) {
      setError('Error loading data');
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (statistics) {
      createWeeklyChart();
      createMonthlyChart();
      createYearlyChart();
    }
  }, [statistics]);

  const createWeeklyChart = () => {
    const data = statistics.weeklyComments;
    
    if (!data || data.length === 0) {
      d3.select(weeklyChartRef.current).html('<text x="400" y="200" text-anchor="middle">No weekly data available</text>');
      return;
    }
    
    const svg = d3.select(weeklyChartRef.current)
      .html('')
      .attr('width', 800)
      .attr('height', 400);

    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .range([0, width])
      .domain(data.map(d => `Week ${d._id.week}, ${d._id.year}`))
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count)])
      .range([height, 0]);

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    // Y axis
    g.append('g')
      .call(d3.axisLeft(y));

    // Bars
    g.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(`Week ${d._id.week}, ${d._id.year}`))
      .attr('width', x.bandwidth())
      .attr('y', d => y(d.count))
      .attr('height', d => height - y(d.count))
      .attr('fill', '#10B981')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('fill', '#34D399');
      })
      .on('mouseout', function(event, d) {
        d3.select(this).attr('fill', '#10B981');
      });

    // Bar labels
    g.selectAll('.bar-label')
      .data(data)
      .enter().append('text')
      .attr('class', 'bar-label')
      .attr('x', d => x(`Week ${d._id.week}, ${d._id.year}`) + x.bandwidth() / 2)
      .attr('y', d => y(d.count) - 5)
      .attr('text-anchor', 'middle')
      .text(d => d.count);
  };

  const createMonthlyChart = () => {
    const data = statistics.monthlyComments;
    
    if (!data || data.length === 0) {
      d3.select(monthlyChartRef.current).html('<text x="400" y="200" text-anchor="middle">No monthly data available</text>');
      return;
    }
    
    const svg = d3.select(monthlyChartRef.current)
      .html('')
      .attr('width', 800)
      .attr('height', 400);

    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .range([0, width])
      .domain(data.map(d => `${d._id.month}/${d._id.year}`))
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count)])
      .range([height, 0]);

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    // Y axis
    g.append('g')
      .call(d3.axisLeft(y));

    // Bars
    g.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(`${d._id.month}/${d._id.year}`))
      .attr('width', x.bandwidth())
      .attr('y', d => y(d.count))
      .attr('height', d => height - y(d.count))
      .attr('fill', '#4F46E5')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('fill', '#6366F1');
      })
      .on('mouseout', function(event, d) {
        d3.select(this).attr('fill', '#4F46E5');
      });

    // Bar labels
    g.selectAll('.bar-label')
      .data(data)
      .enter().append('text')
      .attr('class', 'bar-label')
      .attr('x', d => x(`${d._id.month}/${d._id.year}`) + x.bandwidth() / 2)
      .attr('y', d => y(d.count) - 5)
      .attr('text-anchor', 'middle')
      .text(d => d.count);
  };

  const createYearlyChart = () => {
    const data = statistics.yearlyComments;
    
    if (!data || data.length === 0) {
      d3.select(yearlyChartRef.current).html('<text x="400" y="200" text-anchor="middle">No yearly data available</text>');
      return;
    }
    
    const svg = d3.select(yearlyChartRef.current)
      .html('')
      .attr('width', 800)
      .attr('height', 400);

    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .range([0, width])
      .domain(data.map(d => `${d._id.year}`))
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count)])
      .range([height, 0]);

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'middle');

    // Y axis
    g.append('g')
      .call(d3.axisLeft(y));

    // Bars
    g.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(`${d._id.year}`))
      .attr('width', x.bandwidth())
      .attr('y', d => y(d.count))
      .attr('height', d => height - y(d.count))
      .attr('fill', '#F59E0B')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('fill', '#FBBF24');
      })
      .on('mouseout', function(event, d) {
        d3.select(this).attr('fill', '#F59E0B');
      });

    // Bar labels
    g.selectAll('.bar-label')
      .data(data)
      .enter().append('text')
      .attr('class', 'bar-label')
      .attr('x', d => x(`${d._id.year}`) + x.bandwidth() / 2)
      .attr('y', d => y(d.count) - 5)
      .attr('text-anchor', 'middle')
      .text(d => d.count);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-xl text-red-600 mb-4">{error}</div>
        <div className="text-gray-600 mb-4">No comments available at the moment</div>
        <button 
          onClick={fetchCommentsData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  // If there are no comments at all
  if (!statistics || statistics.totalComments === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">Comments Statistics</h1>
            <button 
              onClick={fetchCommentsData}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Refresh Data
            </button>
          </div>
          <div className="flex flex-col items-center justify-center h-64">
            <div className="text-xl text-gray-600 mb-4">No comments in the system</div>
            <div className="text-gray-500">Comments will appear here once users start commenting on posts</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Comments Statistics</h1>
          <button 
            onClick={fetchCommentsData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Refresh Data
          </button>
        </div>
        {/* General statistics */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-700">Total Comments</h3>
              <p className="text-3xl font-bold text-blue-600">{statistics.totalComments}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-700">Comments with Users</h3>
              <p className="text-3xl font-bold text-green-600">{statistics.commentsWithUsers}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-700">Active Users</h3>
              <p className="text-3xl font-bold text-purple-600">{statistics.topCommenters?.length || 0}</p>
            </div>
          </div>
        )}

        {/* Weekly Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Comments by Week</h2>
          <div className="flex justify-center">
            <svg ref={weeklyChartRef}></svg>
          </div>
        </div>

        {/* Monthly Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Comments by Month</h2>
          <div className="flex justify-center">
            <svg ref={monthlyChartRef}></svg>
          </div>
        </div>

        {/* Yearly Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Comments by Year</h2>
          <div className="flex justify-center">
            <svg ref={yearlyChartRef}></svg>
          </div>
        </div>

        {/* Top commenters table */}
        {statistics?.topCommenters && statistics.topCommenters.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Top Commenters</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-right">User</th>
                    <th className="px-4 py-2 text-right">Email</th>
                    <th className="px-4 py-2 text-right">Comments Count</th>
                  </tr>
                </thead>
                <tbody>
                  {statistics.topCommenters.map((user, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2 text-right">
                        <div className="flex items-center">
                          {user.profilePicture && (
                            <img 
                              src={user.profilePicture} 
                              alt={user.username}
                              className="w-8 h-8 rounded-full mr-2"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          {user.username || 'Anonymous User'}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-right">{user.email || '-'}</td>
                      <td className="px-4 py-2 text-right font-semibold">{user.count || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* All comments list */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">All Comments</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {comments && comments.length > 0 ? comments.map((comment) => (
              <div key={comment._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center mb-2">
                    {comment.author?.profile?.avatar && (
                      <img 
                        src={comment.author.profile.avatar} 
                        alt={comment.author.profile?.firstName || 'User'}
                        className="w-8 h-8 rounded-full mr-2"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <span className="font-semibold text-gray-800">
                      {comment.author && comment.author.profile ? 
                        `${comment.author.profile.firstName || ''} ${comment.author.profile.lastName || ''}`.trim() || 
                        comment.author.email || 
                        'Anonymous User' 
                        : 'Anonymous User'}
                    </span>
                    <span className="text-gray-500 text-sm mr-2">
                      {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('en-GB') : 'Unknown date'}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 mb-2">{comment.content || 'No content'}</p>
                {comment.post && comment.post.title && (
                  <div className="text-sm text-gray-500">
                    <span>In post: </span>
                    <span className="font-medium">{comment.post.title}</span>
                  </div>
                )}
                {comment.parentComment && comment.parentComment.content && (
                  <div className="text-sm text-gray-500 mt-1">
                    <span>Reply to: </span>
                    <span className="font-medium">{comment.parentComment.content.substring(0, 50)}...</span>
                  </div>
                )}
              </div>
            )) : (
              <div className="text-center text-gray-500 py-8">
                No comments available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
