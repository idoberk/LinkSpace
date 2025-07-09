import ProfilePicture from '../components/ProfilePicture';
import TopBar from '../components/TopBar';

// TODO: change the profile picture to the user's avatar picture from backend
const Home = () => {
	return (
		<div className='bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen'>
			<TopBar />
			<ProfilePicture picture='https://fastly.picsum.photos/id/58/1280/853.jpg?hmac=YO3QnOm9TpyM5DqsJjoM4CHg8oIq4cMWLpd9ALoP908' />
		</div>
	);
};

export default Home;
