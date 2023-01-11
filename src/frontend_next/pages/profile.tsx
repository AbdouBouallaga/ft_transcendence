import React, { useState, useEffect } from "react";
import Router, {useRouter} from 'next/router';
import axios from "axios";
import { Modal, Button, TextInput, Badge} from "flowbite-react";
import ImageResize from 'image-resize';
import { clear } from "console";

var imageResize = new ImageResize({
  format: 'png',
  width: 160
});

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
  const [qr2faCodeError, set2faCodeError] = useState(false);
  const [enabled2fa, set2faEnabled] = useState(false);
  const [editError, setEditError] = useState(false);
  const [editReloadContent, setReloadContent] = useState(1);

  function modal2faDefault(){
    toggle2faModal();
    setqrnextButton(true);
    setqrprevButton(false);
    set2faConfirm(false);
    set2faCodeError(false);
  }

  const [enable2famodal, setModal] = useState(false);
  const toggle2faModal = () => setModal(!enable2famodal);

  const [enableEditmodal, setEditModal] = useState(false);
  const toggleEditModal = () => setEditModal(!enableEditmodal);

  async function enable2fa() {
    axios.get('api/auth/tfa/generate')
    .then((response) => {
      console.log(response.data);
      set2fa(response.data);
      toggle2faModal();
      })
      .catch((error) => {
          console.log(error);
      })
  }
  async function disable2fa() {
    const TextInput = document.getElementById('2faCodeInput') as HTMLInputElement;
    console.log(TextInput.value);
    if (TextInput.value){
      set2faCodeError(false);
      axios({
        method: 'POST',
        url: '/api/auth/tfa/disable',
        data: {
          tfaCode: TextInput?.value
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
    const TextInput = document.getElementById('2faCodeInput') as HTMLInputElement;
    if (TextInput.value){
      set2faCodeError(false);
      axios({
        method: 'POST',
        url: '/api/auth/tfa/enable',
        data: {
          tfaCode: TextInput?.value
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

  async function PushEdits(Username:string, imgInput:string) {
    var imgResized = imageResize.play(imgInput)
    .then((resizedImage) => {
      console.log(resizedImage);
      axios({
        method: 'POST',
        url: '/api/users/me',
        data: {
          username: Username,
          avatar: resizedImage
        },
      })
      .then((response) => {
        if (response.data.login42){
          setEditModal(false);
          setEdit(false);
          toggleEditModal();
          Router.reload(); // reload l7za9 kaml
          // setReloadContent(editReloadContent + 1); // this reload the profile but not the navbar
        }
      })
      .catch((error) => {
        setEditError(true)
      })
    }
    )
  }

  async function ProcessEdits() {
    const TextInput = document.getElementById('username') as HTMLInputElement;
    const FileInput = document.getElementById('avatar') as HTMLInputElement;
    let maxSize:number = 6145*1024;
    let inputSize:number = FileInput.files[0].size;
    console.log(maxSize);
    console.log(inputSize);
    var imgInput:string = profile.avatar;
    if (FileInput.files[0] && maxSize > inputSize){
      imgInput = FileInput.files[0];
    }
    PushEdits(TextInput.value, imgInput);
    FileInput.value = "";

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
          set2faEnabled(tfaEnabled);
        })
        .catch((error) => {
          console.log(error);
        });
    }
    fetchProfile();
  }, [enabled2fa, editReloadContent]);

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
        
        {/* EDIT button and modal*/}
        <React.Fragment>
          <Button className='m-2' onClick={toggleEditModal}>Edit</Button>
          <Modal  show={enableEditmodal}
                  onClose={toggleEditModal}
                  size="sm"
          >
            <Modal.Header>Edit Profile</Modal.Header>
            <Modal.Body>
              {editError ?? <Badge color="failure">Error editing profile</Badge>}
              <div className="form-group">
                <label>Username</label>
                <TextInput id="username" className='form-control' type="text" defaultValue={profile.username} />
              </div>
              <div className="form-group">
                <label>Avatar</label>
                <input type="file" className="form-control-file" id="avatar" max-size="1" accept="image/*" />
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={ProcessEdits}>
                Save
              </Button>
              <Button color="failure" onClick={toggleEditModal}>
                Cancel
              </Button>
            </Modal.Footer>
          </Modal>
        </React.Fragment>

        {/* 2FA button and modal*/}
        <React.Fragment>
        {profile.tfaEnabled ? <Button className='m-2' color="failure" onClick={toggle2faModal} >Disable 2fa</Button> : <Button className='m-2' onClick={enable2fa}>Enable 2fa</Button>}
          <Modal  show={enable2famodal}
                  onClose={modal2faDefault}
                  size="sm"
          >
            <Modal.Header >Two-factor authentication</Modal.Header>
            {!profile.tfaEnabled &&
            <Modal.Body>
              {qrnextButton &&
              <div id="2faQr">
                <p className='text-center'>Scan this QR code with your authenticator app</p>
                <img className='m-auto' src={data2fa.otpAuthURL} alt="qr" />
              </div>
              }
              {qrprevButton &&
              <div className='flex' id="2faConfirm">
                <TextInput id="2faCodeValidForm" className='form-control' type="text" inputMode='numeric' id="2faCodeInput" placeholder="Code" maxLength={6}/>
                <Button className='btn btn btn-primary' onClick={confirm2fa}>Confirm</Button>
              </div>
              }
              {qr2faCodeError &&
              <Badge color="failure" size="L">
                <strong >Wrong Code !!</strong>
              </Badge>
              }
              {qr2faConfirm && // roles inverted i know
              <Badge color="success" size="L">
                <strong >2fa disabled successfully</strong>
              </Badge>
              }
            </Modal.Body>
          }
          {profile.tfaEnabled &&
          <Modal.Body>
            {!qr2faConfirm &&
            <>
            <p className='text-center'>Confirm your 2fa code to disable it</p>
            <div className='flex' id="2faConfirm">
            <TextInput id="2faCodeValidForm" className='form-control' type="text" inputMode='numeric' id="2faCodeInput" placeholder="Code" maxLength={6}/>
            <Button className='btn btn btn-primary' onClick={disable2fa}>Confirm</Button>
            </div>
            </>
            }
            {qr2faConfirm && // yeah yeah, profile.tfaEnabled logic
              <Badge color="success" size="L">
              <strong >2fa enabled successfully</strong>
            </Badge>
            }
            {qr2faCodeError &&
              <Badge color="failure" size="L">
              <strong >Wrong Code !!</strong>
            </Badge>
            }
          </Modal.Body>
          }
            <Modal.Footer>
              {qrnextButton && !profile.tfaEnabled &&
              <Button id='qrnextButton' className=' btn btn-primary' onClick={() => {
                set2faCodeError(false);
                setqrnextButton(!qrnextButton)
                setqrprevButton(!qrprevButton)
              }}>
                Next
              </Button>
              }
              {qrprevButton &&
              <Button id='qrprevButton' className=' btn btn-primary' onClick={() => {
                set2faCodeError(false);
                setqrprevButton(!qrprevButton)
                setqrnextButton(!qrnextButton)
              }}>
                Previous
              </Button>
              }
              <Button className='btn btn-danger' onClick={modal2faDefault}>
                Cancel
              </Button>
            </Modal.Footer>
          </Modal>
        </React.Fragment>
      </>
    </div>
    </>
  );
};

export default Profile;