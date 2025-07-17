import { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import api from '../lib/axios';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import PostAddIcon from '@mui/icons-material/PostAdd';
import CommentIcon from '@mui/icons-material/Comment';
import GroupIcon from '@mui/icons-material/Group';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const Statistics = () => {
	const [statistics, setStatistics] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Refs for D3 charts
	const monthlyChartRef = useRef();
	const weeklyChartRef = useRef();
	const yearlyChartRef = useRef();
	const avgPostsChartRef = useRef();

	useEffect(() => {
		fetchStatistics();
	}, []);

	const fetchStatistics = async () => {
		try {
			setLoading(true);
			setError(null);

			// Fetch statistics from our new API
			const response = await api.get('/statistics/users');
			console.log('Statistics from API:', response.data);
			setStatistics(response.data);

			// Fetch additional data for charts
			const [postsRes, commentsRes, groupsRes] = await Promise.all([
				api.get('/posts'),
				api.get('/comments'),
				api.get('/groups'),
			]);

			// Extract the actual data arrays from the API responses
			const posts = postsRes.data.posts || [];
			const comments = commentsRes.data.comments || [];
			const groups = groupsRes.data.groups || [];

			console.log('Posts data:', posts);
			console.log('Comments data:', comments);
			console.log('Groups data:', groups);

			// Process data for charts
			const chartData = processChartData(posts, comments, groups);
			setChartData(chartData);
		} catch (err) {
			setError('Error loading statistics');
			console.error('Error fetching statistics:', err);
		} finally {
			setLoading(false);
		}
	};

	const [chartData, setChartData] = useState(null);

	const processChartData = (posts, comments, groups) => {
		// Ensure we have arrays
		const postsArray = Array.isArray(posts) ? posts : [];
		const commentsArray = Array.isArray(comments) ? comments : [];
		const groupsArray = Array.isArray(groups) ? groups : [];

		console.log('Processing chart data:', {
			postsCount: postsArray.length,
			commentsCount: commentsArray.length,
			groupsCount: groupsArray.length,
		});

		const currentDate = new Date();

		// Log post dates to debug
		if (postsArray.length > 0) {
			console.log('Sample post dates:');
			postsArray.slice(0, 5).forEach((post, index) => {
				console.log(
					`Post ${index + 1}:`,
					new Date(post.createdAt).toISOString(),
				);
			});

			// Check for posts outside the 5-year window
			const currentYear = currentDate.getFullYear();
			const fiveYearsAgo = currentYear - 5;
			const postsOutsideWindow = postsArray.filter((post) => {
				const postYear = new Date(post.createdAt).getFullYear();
				return postYear < fiveYearsAgo;
			});

			console.log(
				`Posts outside 5-year window (before ${fiveYearsAgo}):`,
				postsOutsideWindow.length,
			);
			if (postsOutsideWindow.length > 0) {
				console.log('Posts outside window dates:');
				postsOutsideWindow.forEach((post, index) => {
					console.log(
						`Post ${index + 1}:`,
						new Date(post.createdAt).toISOString(),
					);
				});
			}
		}
		const monthlyData = [];
		const weeklyData = [];
		const yearlyData = [];

		// Process monthly data (last 12 months)
		for (let i = 11; i >= 0; i--) {
			const date = new Date(
				currentDate.getFullYear(),
				currentDate.getMonth() - i,
				1,
			);
			const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
			const monthEnd = new Date(
				date.getFullYear(),
				date.getMonth() + 1,
				0,
			);

			const monthPosts = postsArray.filter((post) => {
				const postDate = new Date(post.createdAt);
				return postDate >= monthStart && postDate <= monthEnd;
			}).length;

			const monthComments = commentsArray.filter((comment) => {
				const commentDate = new Date(comment.createdAt);
				return commentDate >= monthStart && commentDate <= monthEnd;
			}).length;

			monthlyData.push({
				month: date.toLocaleDateString('en-US', {
					month: 'short',
					year: 'numeric',
				}),
				posts: monthPosts,
				comments: monthComments,
				avgPostsPerGroup:
					groupsArray.length > 0
						? (monthPosts / groupsArray.length).toFixed(1)
						: 0,
			});
		}

		// Process weekly data (last 8 weeks)
		for (let i = 7; i >= 0; i--) {
			const weekStart = new Date(
				currentDate.getTime() - i * 7 * 24 * 60 * 60 * 1000,
			);
			const weekEnd = new Date(
				weekStart.getTime() + 6 * 24 * 60 * 60 * 1000,
			);

			const weekPosts = postsArray.filter((post) => {
				const postDate = new Date(post.createdAt);
				return postDate >= weekStart && postDate <= weekEnd;
			}).length;

			const weekComments = commentsArray.filter((comment) => {
				const commentDate = new Date(comment.createdAt);
				return commentDate >= weekStart && commentDate <= weekEnd;
			}).length;

			weeklyData.push({
				week: `Week ${Math.ceil((weekStart.getDate() + 6) / 7)}`,
				posts: weekPosts,
				comments: weekComments,
				avgPostsPerGroup:
					groupsArray.length > 0
						? (weekPosts / groupsArray.length).toFixed(1)
						: 0,
			});
		}

		// Process yearly data (last 5 years)
		for (let i = 4; i >= 0; i--) {
			const year = currentDate.getFullYear() - i;
			const yearStart = new Date(year, 0, 1);
			const yearEnd = new Date(year, 11, 31);

			const yearPosts = postsArray.filter((post) => {
				const postDate = new Date(post.createdAt);
				return postDate >= yearStart && postDate <= yearEnd;
			});

			const yearComments = commentsArray.filter((comment) => {
				const commentDate = new Date(comment.createdAt);
				return commentDate >= yearStart && commentDate <= yearEnd;
			});

			console.log(
				`Year ${year}: ${yearPosts.length} posts, ${yearComments.length} comments`,
			);
			console.log(
				`Year ${year} date range:`,
				yearStart.toISOString(),
				'to',
				yearEnd.toISOString(),
			);

			// Log posts that don't match the year
			const postsNotInYear = postsArray.filter((post) => {
				const postDate = new Date(post.createdAt);
				const postYear = postDate.getFullYear();
				return (
					postYear === year &&
					(postDate < yearStart || postDate > yearEnd)
				);
			});

			if (postsNotInYear.length > 0) {
				console.log(
					`Posts in year ${year} but outside date range:`,
					postsNotInYear.length,
				);
			}

			yearlyData.push({
				year: year.toString(),
				posts: yearPosts.length,
				comments: yearComments.length,
				avgPostsPerGroup:
					groupsArray.length > 0
						? (yearPosts.length / groupsArray.length).toFixed(1)
						: 0,
			});
		}

		console.log('Total posts in array:', postsArray.length);
		console.log('Yearly data:', yearlyData);

		// Calculate total posts in yearly data
		const totalPostsInYearlyData = yearlyData.reduce(
			(sum, year) => sum + year.posts,
			0,
		);
		console.log('Total posts in yearly data:', totalPostsInYearlyData);
		console.log(
			'Missing posts:',
			postsArray.length - totalPostsInYearlyData,
		);

		// Check if all posts are accounted for
		if (postsArray.length !== totalPostsInYearlyData) {
			console.log(
				'WARNING: Not all posts are accounted for in yearly data!',
			);
			console.log('This could mean:');
			console.log('1. Posts are outside the 5-year window');
			console.log('2. Posts have invalid dates');
			console.log("3. There's a bug in the date filtering logic");
		}

		return { monthlyData, weeklyData, yearlyData };
	};

	// Colors for charts
	const colors = [
		'#3B82F6',
		'#10B981',
		'#F59E0B',
		'#EF4444',
		'#8B5CF6',
		'#06B6D4',
	];

	// D3 Chart functions
	const createMonthlyChart = () => {
		if (!chartData || !monthlyChartRef.current) return;

		// Clear previous chart
		d3.select(monthlyChartRef.current).selectAll('*').remove();

		const margin = { top: 20, right: 30, bottom: 60, left: 60 };
		const width = 800 - margin.left - margin.right;
		const height = 400 - margin.top - margin.bottom;

		const svg = d3
			.select(monthlyChartRef.current)
			.append('svg')
			.attr('width', width + margin.right + margin.left)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		// X axis
		const x = d3
			.scaleBand()
			.range([0, width])
			.domain(chartData.monthlyData.map((d) => d.month))
			.padding(0.2);

		svg.append('g')
			.attr('transform', `translate(0,${height})`)
			.call(d3.axisBottom(x))
			.selectAll('text')
			.style('text-anchor', 'end')
			.attr('dx', '-.8em')
			.attr('dy', '.15em')
			.attr('transform', 'rotate(-45)');

		// Y axis
		const y = d3
			.scaleLinear()
			.domain([
				0,
				d3.max(chartData.monthlyData, (d) =>
					Math.max(d.posts, d.comments),
				),
			])
			.range([height, 0]);

		svg.append('g').call(d3.axisLeft(y));

		// Add the bars
		svg.selectAll('mybar')
			.data(chartData.monthlyData)
			.join('rect')
			.attr('x', (d) => x(d.month))
			.attr('y', (d) => y(d.posts))
			.attr('width', x.bandwidth())
			.attr('height', (d) => height - y(d.posts))
			.attr('fill', colors[0])
			.attr('rx', 4)
			.on('mouseover', function (event, d) {
				d3.select(this).attr('fill', d3.color(colors[0]).brighter(0.3));
			})
			.on('mouseout', function (event, d) {
				d3.select(this).attr('fill', colors[0]);
			});

		// Add value labels on bars
		svg.selectAll('text.bar-label')
			.data(chartData.monthlyData)
			.join('text')
			.attr('class', 'bar-label')
			.attr('x', (d) => x(d.month) + x.bandwidth() / 2)
			.attr('y', (d) => y(d.posts) - 5)
			.attr('text-anchor', 'middle')
			.style('font-size', '12px')
			.style('fill', '#666')
			.text((d) => d.posts);

		// Add chart title
		svg.append('text')
			.attr('x', width / 2)
			.attr('y', -5)
			.attr('text-anchor', 'middle')
			.style('font-size', '16px')
			.style('font-weight', 'bold')
			.text('Number of Posts per Month');
	};

	const createWeeklyChart = () => {
		if (!chartData || !weeklyChartRef.current) return;

		// Clear previous chart
		d3.select(weeklyChartRef.current).selectAll('*').remove();

		const margin = { top: 20, right: 30, bottom: 60, left: 60 };
		const width = 800 - margin.left - margin.right;
		const height = 400 - margin.top - margin.bottom;

		const svg = d3
			.select(weeklyChartRef.current)
			.append('svg')
			.attr('width', width + margin.right + margin.left)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		// X axis
		const x = d3
			.scaleBand()
			.range([0, width])
			.domain(chartData.weeklyData.map((d) => d.week))
			.padding(0.2);

		svg.append('g')
			.attr('transform', `translate(0,${height})`)
			.call(d3.axisBottom(x))
			.selectAll('text')
			.style('text-anchor', 'end')
			.attr('dx', '-.8em')
			.attr('dy', '.15em')
			.attr('transform', 'rotate(-45)');

		// Y axis
		const y = d3
			.scaleLinear()
			.domain([
				0,
				d3.max(chartData.weeklyData, (d) =>
					Math.max(d.posts, d.comments),
				),
			])
			.range([height, 0]);

		svg.append('g').call(d3.axisLeft(y));

		// Add the bars for posts
		svg.selectAll('mybar-posts')
			.data(chartData.weeklyData)
			.join('rect')
			.attr('x', (d) => x(d.week))
			.attr('y', (d) => y(d.posts))
			.attr('width', x.bandwidth() / 2)
			.attr('height', (d) => height - y(d.posts))
			.attr('fill', colors[1])
			.attr('rx', 4)
			.on('mouseover', function (event, d) {
				d3.select(this).attr('fill', d3.color(colors[1]).brighter(0.3));
			})
			.on('mouseout', function (event, d) {
				d3.select(this).attr('fill', colors[1]);
			});

		// Add the bars for comments
		svg.selectAll('mybar-comments')
			.data(chartData.weeklyData)
			.join('rect')
			.attr('x', (d) => x(d.week) + x.bandwidth() / 2)
			.attr('y', (d) => y(d.comments))
			.attr('width', x.bandwidth() / 2)
			.attr('height', (d) => height - y(d.comments))
			.attr('fill', colors[2])
			.attr('rx', 4)
			.on('mouseover', function (event, d) {
				d3.select(this).attr('fill', d3.color(colors[2]).brighter(0.3));
			})
			.on('mouseout', function (event, d) {
				d3.select(this).attr('fill', colors[2]);
			});

		// Add legend
		const legend = svg
			.append('g')
			.attr('transform', `translate(${width - 100}, 0)`);

		legend
			.append('rect')
			.attr('x', 0)
			.attr('y', 0)
			.attr('width', 15)
			.attr('height', 15)
			.attr('fill', colors[1]);

		legend
			.append('text')
			.attr('x', 20)
			.attr('y', 12)
			.style('font-size', '12px')
			.text('Posts');

		legend
			.append('rect')
			.attr('x', 0)
			.attr('y', 20)
			.attr('width', 15)
			.attr('height', 15)
			.attr('fill', colors[2]);

		legend
			.append('text')
			.attr('x', 20)
			.attr('y', 32)
			.style('font-size', '12px')
			.text('Comments');

		// Add chart title
		svg.append('text')
			.attr('x', width / 2)
			.attr('y', -5)
			.attr('text-anchor', 'middle')
			.style('font-size', '16px')
			.style('font-weight', 'bold')
			.text('Weekly Activity - Posts and Comments');
	};

	const createYearlyChart = () => {
		if (!chartData || !yearlyChartRef.current) return;

		// Clear previous chart
		d3.select(yearlyChartRef.current).selectAll('*').remove();

		console.log('Creating yearly chart with data:', chartData.yearlyData);
		const totalPostsInChart = chartData.yearlyData.reduce(
			(sum, year) => sum + year.posts,
			0,
		);
		console.log('Total posts in yearly chart:', totalPostsInChart);

		const margin = { top: 20, right: 30, bottom: 60, left: 60 };
		const width = 800 - margin.left - margin.right;
		const height = 400 - margin.top - margin.bottom;

		const svg = d3
			.select(yearlyChartRef.current)
			.append('svg')
			.attr('width', width + margin.right + margin.left)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		// X axis
		const x = d3
			.scaleBand()
			.range([0, width])
			.domain(chartData.yearlyData.map((d) => d.year))
			.padding(0.2);

		svg.append('g')
			.attr('transform', `translate(0,${height})`)
			.call(d3.axisBottom(x))
			.selectAll('text')
			.style('text-anchor', 'middle')
			.style('font-size', '14px');

		// Y axis
		const y = d3
			.scaleLinear()
			.domain([0, d3.max(chartData.yearlyData, (d) => d.posts)])
			.range([height, 0]);

		svg.append('g').call(d3.axisLeft(y));

		// Add the bars
		svg.selectAll('mybar')
			.data(chartData.yearlyData)
			.join('rect')
			.attr('x', (d) => x(d.year))
			.attr('y', (d) => y(d.posts))
			.attr('width', x.bandwidth())
			.attr('height', (d) => height - y(d.posts))
			.attr('fill', colors[4])
			.attr('rx', 4)
			.on('mouseover', function (event, d) {
				d3.select(this).attr('fill', d3.color(colors[4]).brighter(0.3));
			})
			.on('mouseout', function (event, d) {
				d3.select(this).attr('fill', colors[4]);
			});

		// Add value labels on bars
		svg.selectAll('text.bar-label')
			.data(chartData.yearlyData)
			.join('text')
			.attr('class', 'bar-label')
			.attr('x', (d) => x(d.year) + x.bandwidth() / 2)
			.attr('y', (d) => y(d.posts) - 5)
			.attr('text-anchor', 'middle')
			.style('font-size', '12px')
			.style('fill', '#666')
			.text((d) => d.posts);

		// Add chart title
		svg.append('text')
			.attr('x', width / 2)
			.attr('y', -5)
			.attr('text-anchor', 'middle')
			.style('font-size', '16px')
			.style('font-weight', 'bold')
			.text('Number of Posts per Year');

		// Add total posts info
		svg.append('text')
			.attr('x', width / 2)
			.attr('y', -25)
			.attr('text-anchor', 'middle')
			.style('font-size', '12px')
			.style('fill', '#666')
			.text(`Total posts in chart: ${totalPostsInChart}`);
	};

	const createAvgPostsPerGroupChart = () => {
		if (!chartData || !avgPostsChartRef.current) return;

		// Clear previous chart
		d3.select(avgPostsChartRef.current).selectAll('*').remove();

		const margin = { top: 20, right: 30, bottom: 60, left: 60 };
		const width = 800 - margin.left - margin.right;
		const height = 400 - margin.top - margin.bottom;

		const svg = d3
			.select(avgPostsChartRef.current)
			.append('svg')
			.attr('width', width + margin.right + margin.left)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		// X axis
		const x = d3
			.scaleBand()
			.range([0, width])
			.domain(chartData.monthlyData.map((d) => d.month))
			.padding(0.2);

		svg.append('g')
			.attr('transform', `translate(0,${height})`)
			.call(d3.axisBottom(x))
			.selectAll('text')
			.style('text-anchor', 'end')
			.attr('dx', '-.8em')
			.attr('dy', '.15em')
			.attr('transform', 'rotate(-45)');

		// Y axis
		const y = d3
			.scaleLinear()
			.domain([
				0,
				d3.max(chartData.monthlyData, (d) =>
					parseFloat(d.avgPostsPerGroup),
				),
			])
			.range([height, 0]);

		svg.append('g').call(d3.axisLeft(y));

		// Add the line
		const line = d3
			.line()
			.x((d) => x(d.month) + x.bandwidth() / 2)
			.y((d) => y(parseFloat(d.avgPostsPerGroup)));

		svg.append('path')
			.datum(chartData.monthlyData)
			.attr('fill', 'none')
			.attr('stroke', colors[3])
			.attr('stroke-width', 3)
			.attr('d', line);

		// Add dots
		svg.selectAll('circle')
			.data(chartData.monthlyData)
			.join('circle')
			.attr('cx', (d) => x(d.month) + x.bandwidth() / 2)
			.attr('cy', (d) => y(parseFloat(d.avgPostsPerGroup)))
			.attr('r', 6)
			.attr('fill', colors[3])
			.attr('stroke', 'white')
			.attr('stroke-width', 2)
			.on('mouseover', function (event, d) {
				d3.select(this)
					.attr('r', 8)
					.attr('fill', d3.color(colors[3]).brighter(0.3));
			})
			.on('mouseout', function (event, d) {
				d3.select(this).attr('r', 6).attr('fill', colors[3]);
			});

		// Add value labels
		svg.selectAll('text.avg-label')
			.data(chartData.monthlyData)
			.join('text')
			.attr('class', 'avg-label')
			.attr('x', (d) => x(d.month) + x.bandwidth() / 2)
			.attr('y', (d) => y(parseFloat(d.avgPostsPerGroup)) - 10)
			.attr('text-anchor', 'middle')
			.style('font-size', '12px')
			.style('fill', '#666')
			.text((d) => parseFloat(d.avgPostsPerGroup).toFixed(1));

		// Add chart title
		svg.append('text')
			.attr('x', width / 2)
			.attr('y', -5)
			.attr('text-anchor', 'middle')
			.style('font-size', '16px')
			.style('font-weight', 'bold')
			.text('Average Posts per Group per Month');
	};

	// Create charts when data is available
	useEffect(() => {
		if (chartData && statistics) {
			createMonthlyChart();
			createWeeklyChart();
			createYearlyChart();
			createAvgPostsPerGroupChart();
		}
	}, [chartData, statistics]);

	if (loading) {
		return (
			<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
					<p className='text-gray-600'>Loading statistics...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
				<div className='text-center'>
					<div className='text-red-500 text-6xl mb-4'>⚠️</div>
					<h2 className='text-2xl font-bold text-gray-800 mb-2'>
						Error Loading Data
					</h2>
					<p className='text-gray-600 mb-4'>{error}</p>
					<button
						onClick={fetchStatistics}
						className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors'>
						Try Again
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gray-50 p-8'>
			<div className='max-w-7xl mx-auto'>
				{/* Header */}
				<div className='mb-8'>
					<h1 className='text-4xl font-bold text-gray-800 mb-2 flex items-center'>
						<BarChartIcon
							className='mr-3 text-blue-600'
							style={{ fontSize: '2rem' }}
						/>
						LinkSpace Statistics
					</h1>
					<p className='text-gray-600'>
						A comprehensive analysis of activity and community
						involvement
					</p>
				</div>

				{/* Summary Cards */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
					<div className='bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500'>
						<div className='flex items-center'>
							<div className='p-2 bg-blue-100 rounded-lg'>
								<PeopleIcon className='w-6 h-6 text-blue-600' />
							</div>
							<div className='mr-4'>
								<p className='text-sm font-medium text-gray-600'>
									Total Users
								</p>
								<p className='text-2xl font-bold text-gray-900'>
									{statistics?.totalUsers || 0}
								</p>
							</div>
						</div>
					</div>

					<div className='bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500'>
						<div className='flex items-center'>
							<div className='p-2 bg-green-100 rounded-lg'>
								<PostAddIcon className='w-6 h-6 text-green-600' />
							</div>
							<div className='mr-4'>
								<p className='text-sm font-medium text-gray-600'>
									Total Posts
								</p>
								<p className='text-2xl font-bold text-gray-900'>
									{statistics?.totalPosts || 0}
								</p>
							</div>
						</div>

						{/* <div className='bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow'>
						 	<h3 className='text-lg font-semibold text-gray-700'>
						 		Anonymous Comments
						 	</h3>
						 	<p className='text-3xl font-bold text-orange-600'>
						 		{statistics.anonymousComments}
						 	</p>
						 </div>  */}
						{/* <div className='bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow'>
						 	<h3 className='text-lg font-semibold text-gray-700'>
						 		Active Users
						 	</h3>
						 	<p className='text-3xl font-bold text-purple-600'>
						 		{statistics.topCommenters?.length || 0}
						 	</p>

							</div> */}

						<div className='bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500'>
							<div className='flex items-center'>
								<div className='p-2 bg-purple-100 rounded-lg'>
									<CommentIcon className='w-6 h-6 text-purple-600' />
								</div>
								<div className='mr-4'>
									<p className='text-sm font-medium text-gray-600'>
										Total Comments
									</p>
									<p className='text-2xl font-bold text-gray-900'>
										{statistics?.totalComments || 0}
									</p>
								</div>
							</div>
						</div>

						<div className='bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500'>
							<div className='flex items-center'>
								<div className='p-2 bg-orange-100 rounded-lg'>
									<GroupIcon className='w-6 h-6 text-orange-600' />
								</div>
								<div className='mr-4'>
									<p className='text-sm font-medium text-gray-600'>
										Total Groups
									</p>
									<p className='text-2xl font-bold text-gray-900'>
										{statistics?.totalGroups || 0}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Averages Section */}
					<div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
						<div className='bg-white p-6 rounded-lg shadow-md'>
							<div className='text-center'>
								<TrendingUpIcon className='w-8 h-8 text-blue-600 mx-auto mb-2' />
								<h3 className='text-lg font-semibold text-gray-800 mb-2'>
									Average Friends per User
								</h3>
								<p className='text-3xl font-bold text-blue-600'>
									{statistics?.avgFriends || 0}
								</p>
							</div>
						</div>

						<div className='bg-white p-6 rounded-lg shadow-md'>
							<div className='text-center'>
								<TrendingUpIcon className='w-8 h-8 text-green-600 mx-auto mb-2' />
								<h3 className='text-lg font-semibold text-gray-800 mb-2'>
									Average Posts per User
								</h3>
								<p className='text-3xl font-bold text-green-600'>
									{statistics?.avgPosts || 0}
								</p>
							</div>
						</div>

						<div className='bg-white p-6 rounded-lg shadow-md'>
							<div className='text-center'>
								<TrendingUpIcon className='w-8 h-8 text-purple-600 mx-auto mb-2' />
								<h3 className='text-lg font-semibold text-gray-800 mb-2'>
									Average Comments per User
								</h3>
								<p className='text-3xl font-bold text-purple-600'>
									{statistics?.avgComments || 0}
								</p>
							</div>
						</div>
					</div>

					{/* D3 Charts Section */}
					<div className='space-y-8 mb-8'>
						{/* Monthly Posts Chart */}
						<div className='bg-white p-6 rounded-lg shadow-md'>
							<h2 className='text-2xl font-bold mb-6 text-gray-800 text-center'>
								Number of Posts per Month
							</h2>
							<div className='flex justify-center'>
								<div ref={monthlyChartRef}></div>
							</div>
						</div>

						{/* Weekly Activity Chart */}
						<div className='bg-white p-6 rounded-lg shadow-md'>
							<h2 className='text-2xl font-bold mb-6 text-gray-800 text-center'>
								Weekly Activity - Posts and Comments
							</h2>
							<div className='flex justify-center'>
								<div ref={weeklyChartRef}></div>
							</div>
						</div>

						{/* Yearly Posts Chart */}
						<div className='bg-white p-6 rounded-lg shadow-md'>
							<h2 className='text-2xl font-bold mb-6 text-gray-800 text-center'>
								Number of Posts per Year
							</h2>
							<div className='flex justify-center'>
								<div ref={yearlyChartRef}></div>
							</div>
						</div>

						{/* Average Posts Per Group Chart */}
						<div className='bg-white p-6 rounded-lg shadow-md'>
							<h2 className='text-2xl font-bold mb-6 text-gray-800 text-center'>
								Average Posts per Group per Month
							</h2>
							<div className='flex justify-center'>
								<div ref={avgPostsChartRef}></div>
							</div>
						</div>
					</div>

					{/* Recent Activity */}
					<div className='bg-white p-6 rounded-lg shadow-md mb-8'>
						<h2 className='text-2xl font-bold mb-4 text-gray-800'>
							Recent Activity
						</h2>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
							<div className='text-center p-4 bg-blue-50 rounded-lg'>
								<h3 className='text-lg font-semibold text-blue-800 mb-2'>
									New Users This Week
								</h3>
								<p className='text-2xl font-bold text-blue-600'>
									{statistics?.recentActivity
										?.lastWeekUsers || 0}
								</p>
							</div>
							<div className='text-center p-4 bg-green-50 rounded-lg'>
								<h3 className='text-lg font-semibold text-green-800 mb-2'>
									New Users This Month
								</h3>
								<p className='text-2xl font-bold text-green-600'>
									{statistics?.recentActivity
										?.lastMonthUsers || 0}
								</p>
							</div>
						</div>
					</div>

					{/* Roles Distribution Table */}
					{statistics?.roles &&
						Object.keys(statistics.roles).length > 0 && (
							<div className='bg-white p-6 rounded-lg shadow-md mb-8'>
								<h2 className='text-2xl font-bold mb-4 text-gray-800 text-center'>
									Role Details
								</h2>
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
									{Object.entries(statistics.roles).map(
										([role, count], index) => (
											<div
												key={role}
												className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
												<div className='flex items-center'>
													<div
														className='w-4 h-4 rounded-full mr-3'
														style={{
															backgroundColor:
																colors[
																	index %
																		colors.length
																],
														}}></div>
													<span className='font-medium text-gray-700 capitalize'>
														{role}
													</span>
												</div>
												<span className='text-lg font-bold text-blue-600'>
													{count}
												</span>
											</div>
										),
									)}
								</div>
							</div>
						)}
				</div>
			</div>
		</div>
	);
};

export default Statistics;
