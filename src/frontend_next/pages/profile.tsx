import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert } from 'reactstrap';

const Profile = () => {
  // State to store the user's profile data
  const [profile, setProfile] = useState({});
  const [data2fa, set2fa] = useState({});
  const [friends, setFriends] = useState([]);

  const [qrnextButton, setqrnextButton] = useState(true);
  const [qrprevButton, setqrprevButton] = useState(false);
  const [qr2faConfirm, set2faConfirm] = useState(false);
  const [qr2faCodeInput, set2faCodeInput] = useState('0');
  const [qr2faCodeError, set2faCodeError] = useState(false);

  function modal2faDefault(){
    toggle2faModal();
    setqrnextButton(true);
    setqrprevButton(false);
    set2faConfirm(false);
    set2faCodeError(false);
  }

  const toggle2faModal = () => setModal(!modal);
  const [modal, setModal] = useState(false);
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

  // State to store the edit mode status
  const [isEditing, setIsEditing] = useState(false);

  // Fetch the user's profile data when the component mounts
  useEffect(() => {
    async function fetchProfile() {
      axios.get('/api/users/me/fullprofile')
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

  // Function to toggle2faModal edit mode
  const toggle2faModalEdit = () => {
    setIsEditing((prevState) => !prevState);
  };

  // Render the profile data in a card
  return (
    <>
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
          <button  type="button" onClick={toggle2faModalEdit}>
            Cancel
          </button>
        </form>
      ) : (
        <>
          <p>Username: {profile.username}</p>
          {/* <p>Score: {profile.score}</p> */}
          <button className='btn btn-primary m-2' onClick={toggle2faModalEdit} >Edit</button>
          <button className='btn btn-primary m-2' onClick={enable2fa}>
            Enable 2fa
          </button>
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
    <Modal isOpen={modal} toggle={modal2faDefault} size="sm">
        <ModalHeader toggle2faModal={toggle2faModal}>Enable 2fa</ModalHeader>
        <ModalBody>
          {qrnextButton &&
          <div id="2faQr">
            <p className='text-center'>Scan this QR code with your authenticator app</p>
            <img className='m-auto' src={data2fa.otpAuthURL} alt="qr" />
          </div>
          }
          {qrprevButton &&
          <div className='' id="2faConfirm">
            <input id="2faCodeValidForm" className='m-auto' type="text" inputMode='numeric' id="2faCodeInput" placeholder="Code" maxLength={6}/>
            <button className='m-auto' onClick={confirm2fa}>Confirm</button>
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
        <ModalFooter>
          {qrnextButton && 
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