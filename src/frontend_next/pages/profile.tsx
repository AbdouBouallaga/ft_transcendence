import React, { useState, useEffect } from "react";
import Router, {useRouter} from 'next/router';
import axios from "axios";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert } from 'reactstrap';

const Profile = () => {
  // State to store the user's profile data
  const [profile, setProfile] = useState({
    username: "",
    avatar: "",
    auth:"",
    tfaEnabled: false,
  });
  const [edit, setEdit] = useState(false);

  // State to store the edit mode status
  const [isEditing, setIsEditing] = useState(false);

  //2fa
  const [data2fa, set2fa] = useState({});
  const [qrnextButton, setqrnextButton] = useState(true);
  const [qrprevButton, setqrprevButton] = useState(false);
  const [qr2faConfirm, set2faConfirm] = useState(false);
  const [qr2faCodeInput, set2faCodeInput] = useState('0');
  const [qr2faCodeError, set2faCodeError] = useState(false);
  const [enabled2fa, set2faEnabled] = useState(false);

  function modal2faDefault(){
    toggle2faModal();
    setqrnextButton(true);
    setqrprevButton(false);
    set2faConfirm(false);
    set2faCodeError(false);
  }

  const toggle2faModal = () => setModal(!enable2famodal);
  const [enable2famodal, setModal] = useState(false);
  async function enable2fa() {
    axios.get('api/auth/tfa/generate')
    .then((response) => {
      set2fa(response.data);
      toggle2faModal();
      })
      .catch((error) => {
          console.log(error);
      })
  }
  async function disable2fa() {
    const input = document.getElementById('2faCodeInput') as HTMLInputElement;
    console.log(input.value);
    if (input.value){
      set2faCodeError(false);
      axios({
        method: 'POST',
        url: '/api/auth/tfa/disable',
        data: {
          tfaCode: input?.value
        },
      })
      .then((response) => {
        if (response.data.success){
          set2faConfirm(true);
          set2faCodeError(false);
          set2faEnabled(false);
        }
        setqrnextButton(false);
        setqrprevButton(false);
        })
        .catch((error) => {
          set2faCodeError(true);
        })
      }
      else {
        set2faCodeError(true);
      }
  }
  async function confirm2fa() {
    const input = document.getElementById('2faCodeInput') as HTMLInputElement;
    if (input.value){
      set2faCodeError(false);
      axios({
        method: 'POST',
        url: '/api/auth/tfa/enable',
        data: {
          tfaCode: input?.value
        },
      })
      .then((response) => {
        if (response.data.success){
          set2faConfirm(true);
          set2faEnabled(true);
        }
        setqrnextButton(false);
        setqrprevButton(false);
        })
        .catch((error) => {
          set2faCodeError(true);
        })
      }
      else {
        set2faCodeError(true);
      }
  }


  // Fetch the user's profile data when the component mounts
  useEffect(() => {
    async function fetchProfile() {
      axios
        .get("/api/users/me/fullprofile")
        .then((response) => {
          const { username, avatar, tfaEnabled} = response.data;
          console.log(username, avatar);
          setProfile({
            username,
            avatar,
            tfaEnabled,
          });
        })
        .catch((error) => {
          console.log(error);
        });
    }
    fetchProfile();
  }, [enabled2fa]);

  // Function to toggle edit mode

  // Render the profile data in a card
  return (
    <>
    <div className="card">
      <div className="avatar">
        <img src={profile.avatar} alt={profile.username} />
      </div>
      <h1><b>{profile.username}</b></h1>

      <>
        {/* <p>Username: {profile.username}</p> */}
        {/* <p>Score: {profile.score}</p> */}
        <div className="">
        <button className='btn btn-primary m-2' onClick={() => setEdit((edit) => !edit)}>Edit</button>
        {profile.tfaEnabled ? <button className='btn btn-danger m-2' onClick={toggle2faModal} >Disable 2fa</button> : <button className='btn btn-primary m-2' onClick={enable2fa}>Enable 2fa</button>}
        {/* <button className='btn btn-primary m-2' onClick={enable2fa}>Enable 2fa</button> */}
        </div>
      </>
      {edit ? <ModalEdit setEdit={setEdit} profile={profile} /> : null}
    </div>
    <Modal isOpen={enable2famodal} toggle={modal2faDefault} size="sm">
        <ModalHeader toggle2faModal={toggle2faModal}>Enable 2fa</ModalHeader>
        {!profile.tfaEnabled &&
        <ModalBody>
          {qrnextButton &&
          <div id="2faQr">
            <p className='text-center'>Scan this QR code with your authenticator app</p>
            <img className='m-auto' src={data2fa.otpAuthURL} alt="qr" />
          </div>
          }
          {qrprevButton &&
          <div className='flex' id="2faConfirm">
            <input id="2faCodeValidForm" className='form-control' type="text" inputMode='numeric' id="2faCodeInput" placeholder="Code" maxLength={6}/>
            <button className='btn btn btn-primary' onClick={confirm2fa}>Confirm</button>
          </div>
          }
          {qr2faCodeError &&
          <div id='enabled' className='alert alert-danger text-center'>
            <strong >Wrong Code !!</strong>
          </div>
          }
          {qr2faConfirm &&
          <div id='enabled' className='alert alert-success text-center'>
            <strong >2fa enabled successfully</strong>
          </div>
          }
        </ModalBody>
      }
      {profile.tfaEnabled &&
      <ModalBody>
        {!qr2faConfirm &&
        <div className='flex' id="2faConfirm">
        <input id="2faCodeValidForm" className='form-control' type="text" inputMode='numeric' id="2faCodeInput" placeholder="Code" maxLength={6}/>
        <button className='btn btn btn-primary' onClick={disable2fa}>Confirm</button>
        </div>
        }
        {qr2faConfirm &&
          <div id='enabled' className='alert alert-success text-center'>
            <strong >2fa Disabled successfully</strong>
          </div>
        }
        {qr2faCodeError &&
          <div id='enabled' className='alert alert-danger text-center'>
            <strong >Wrong Code !!</strong>
          </div>
        }
      </ModalBody>
      }
        <ModalFooter>
          {qrnextButton && !profile.tfaEnabled &&
          <button id='qrnextButton' className=' btn btn-primary' onClick={() => {
            set2faCodeError(false);
            setqrnextButton(!qrnextButton)
            setqrprevButton(!qrprevButton)
          }}>
            Next
          </button>
          }
          {qrprevButton &&
          <button id='qrprevButton' className=' btn btn-primary' onClick={() => {
            set2faCodeError(false);
            setqrprevButton(!qrprevButton)
            setqrnextButton(!qrnextButton)
          }}>
            Previous
          </button>
          }
          <button className='btn btn-danger' onClick={modal2faDefault}>
            Cancel
          </button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default Profile;

const ModalEdit = ({ setEdit, profile }) => {

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
