import FeedButton from './FeedButton';

const CreateGroup = () => {
	return (
		<form>
			<h2 className='text-center mt-4 text-2xl text-gray-500'>
				Create New Group
			</h2>
			<div className='flex flex-col items-center justify-center mt-10'>
				<input type='text' placeholder='Group Name' required />
				<input type='text' placeholder='Group Description' required />
				<select text='Category' placeholder='Category' required>
					<option value='Technology'>Technology</option>
					<option value='Sports'>Sports</option>
					<option value='Music'>Music</option>
					<option value='Art'>Art</option>
					<option value='Gaming'>Gaming</option>
					<option value='Education'>Gaming</option>
					<option value='Travel'>Gaming</option>
					<option value='Food'>Gaming</option>
					<option value='Health'>Gaming</option>
					<option value='Other'>Other</option>
				</select>
				<select text='privacy' defaultValue='public'>
					<option value='public'>Public</option>
					<option value='private'>Private</option>
				</select>
				{/* addcoverimage */}
			</div>
			<FeedButton type='submit'>Create Group</FeedButton>
		</form>
	);
};

export default CreateGroup;
