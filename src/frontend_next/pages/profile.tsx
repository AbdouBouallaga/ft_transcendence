import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
  // State to store the user's profile data
  const [profile, setProfile] = useState({});
  const [friends, setFriends] = useState([]);

  // State to store the edit mode status
  const [isEditing, setIsEditing] = useState(false);

  // Fetch the user's profile data when the component mounts
  useEffect(() => {
    async function fetchProfile() {
      axios.get('http://127.0.0.1.nip.io/api/users/me/fullprofile')
      .then((response) => {
        console.log(response.data)
        setProfile(response.data);
        setFriends(response.data.friends);
        console.log(profile)
        })
        .catch((error) => {
            console.log(error);
        })

    }
    fetchProfile();
  }, []);

  // Function to toggle edit mode
  const toggleEdit = () => {
    setIsEditing((prevState) => !prevState);
  };

  // Render the profile data in a card
  return (
    <div className="card">
        <div className="avatar">
        <img src={profile.avatar} alt={profile.login42} />
      </div>
      <h1>Profile</h1>
      {isEditing ? (
        <form>
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" defaultValue={profile.username} />
          <br />
          <button >Save</button>
          <button type="button" onClick={toggleEdit}>
            Cancel
          </button>
        </form>
      ) : (
        <>
          <p>Username: {profile.username}</p>
          {/* <p>Score: {profile.score}</p> */}
          <button onClick={toggleEdit} >Edit</button>
        </>
      )}
    <ul>
      {friends.map((friend) => (
        <li key={friend.id}>
          <div className="avatar">
            <img src={friend.avatar} alt={friend.username} />
          </div>
          <p>{friend.username}</p>
          <button onClick={() => handleUnfriend(friend.id)}>Unfriend</button>
          <button onClick={() => handleSendMessage(friend)}>Send Message</button>
        </li>
      ))}
    </ul>
    </div>
  );
};

export default Profile;