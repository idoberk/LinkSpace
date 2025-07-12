import FeedButton from './FeedButton';
import ProfilePicture from './ProfilePicture';
import RecommendRoundedIcon from '@mui/icons-material/RecommendRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';

// TODO: Show media in the post

const Post = ({ post }) => {
	if (!post) return null;
	const author = post.author;

	return (
		<div className='border border-gray-200 p-4 rounded-2xl mt-2'>
			<div className='flex flex-row gap-2 items-center mb-2'>
				<ProfilePicture
					width={50}
					height={50}
					picture={author?.profile?.avatar || undefined}
				/>
				<span className='text-gray-700 text-lg font-bold'>
					{author?.profile?.firstName} {author?.profile?.lastName}
				</span>
			</div>
			<span className='text-gray-500 text-sm'>
				{new Date(post.createdAt).toLocaleString('he-IL', {
					day: '2-digit',
					month: '2-digit',
					year: 'numeric',
				})}
			</span>
			<div className='mb-2 text-gray-800 text-base'>{post.content}</div>
			{post.media && post.media.length > 0 && (
				<div className='flex flex-col gap-2 mb-2'>
					{post.media.map((item, idx) =>
						item.type === 'image' ? (
							<img
								key={idx}
								src={item.url}
								alt={`media-${idx}`}
								className='rounded-xl max-h-80'
							/>
						) : item.type === 'video' ? (
							<video
								key={idx}
								src={item.url}
								controls
								className='rounded-xl max-h-80'
							/>
						) : null,
					)}
					{post.tags && post.tags.length > 0 && (
						<div className='flex flex-row gap-1'>
							{post.tags.map((tag, idx) => (
								<span
									key={idx}
									className='bg-blue-100 text-gray-500 px-2 py-1 rounded-full text-xs font-semibold'>
									#{tag}
								</span>
							))}
						</div>
					)}
				</div>
			)}
			<div className='flex flex-row gap-2 mb-2 items-center'>
				<span className='text-gray-500 text-md'>
					{post.likes.length} likes
				</span>
				<span className='text-gray-500 text-md'>
					{post.comments.length} comments
				</span>
			</div>
			<hr className='w-full mb-2 border-gray-200' />
			<div className={'flex flex-row gap-2 items-center '}>
				<FeedButton className=' justify-center items-center border border-gray-200 rounded-full'>
					<RecommendRoundedIcon className='text-gray-500 mr-2' />
					Like
				</FeedButton>
				<FeedButton className=' justify-center items-center border border-gray-200 rounded-full'>
					<ForumRoundedIcon className='text-gray-500 mr-2' />
					Comment
				</FeedButton>
			</div>
		</div>
	);
};

export default Post;
