import React, { useState, useEffect } from "react";
import axios from "axios";

const Profile = () => {
  // State to store the user's profile data
  const [profile, setProfile] = useState({
    username: "",
    avatar: "",
    auth:""
  });
  const [edit, setEdit] = useState(false);

  // State to store the edit mode status
  const [isEditing, setIsEditing] = useState(false);

  // Fetch the user's profile data when the component mounts
  useEffect(() => {
    async function fetchProfile() {
      axios
        .get("http://127.0.0.1.nip.io/api/users/me/fullprofile")
        .then((response) => {
          const { username, avatar } = response.data;
          console.log(username, avatar);
          setProfile({
            username,
            avatar,
          });
        })
        .catch((error) => {
          console.log(error);
        });
    }
    fetchProfile();
  }, []);

  // Function to toggle edit mode

  // Render the profile data in a card
  return (
    <div className="card">
      <div className="avatar">
        <img src={profile.avatar} alt={profile.username} />
      </div>
      <h1>Profile</h1>

      <>
        {/* <p>Username: {profile.username}</p> */}
        {/* <p>Score: {profile.score}</p> */}
        <button onClick={() => setEdit((edit) => !edit)}>Edit</button>
      </>

      {edit ? <Modal setEdit={setEdit} profile={profile} /> : null}
    </div>
  );
};

export default Profile;

const Modal = ({ setEdit, profile }) => {

  const [createObjectURL, setCreateObjectURL] = useState(null);
  const uploadToClient = (event) => {
    console.log("in change")
    if (event.target.files && event.target.files[0]) {
      const i = event.target.files[0];

      // console.log(i)
      // setImage(i);
      setCreateObjectURL(URL.createObjectURL(i));
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-6  w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-modal md:h-full">
      <div className="relative w-full h-full max-w-md md:h-auto">
        {/* <!-- Modal content --> */}
        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
          {/* <!-- Modal header --> */}
          <div className="flex items-center justify-between p-5 border-b rounded-t dark:border-gray-600">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
              Edit Profile
            </h3>
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
              onClick={() => setEdit((edit) => !edit)}
            >
              <svg
                aria-hidden="true"
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          {/* <!-- Modal body --> */}
          <div className="p-6 space-y-6">
            <div className="relative avatar mt-10  ">
              <img className="absolute" src={createObjectURL} alt={profile.username} />
              <input type="file" name="myImage" accept="image/*" className="opacity-0 absolute"  onChange={uploadToClient}/>
            </div>
            <div>
              <label
                htmlFor="first_name"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                First name
              </label>
              <input
                type="text"
                id="first_name"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
            </div>
            <div>
              <label className="inline-flex relative items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Toggle me
                </span>
              </label>
            </div>
          </div>
          {/* <!-- Modal footer --> */}
          <div className="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
            <button
              data-modal-toggle="small-modal"
              type="button"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Edit it
            </button>
            <button
              data-modal-toggle="small-modal"
              type="button"
              className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
