import React, { useState, useEffect } from "react";
import Router, { useRouter } from 'next/router';
import axios from "axios";
import { Modal, Button, TextInput, Badge, Table, Dropdown, Avatar } from "flowbite-react";
import ImageResize from 'image-resize';
import { clear } from "console";
import { TableBody } from "flowbite-react/lib/esm/components/Table/TableBody";
import { TableCell } from "flowbite-react/lib/esm/components/Table/TableCell";
import { TableRow } from "flowbite-react/lib/esm/components/Table/TableRow";

var imageResize = new ImageResize({
  format: 'png',
  width: 160
});

const Profile = () => {
  const router = useRouter();
  const [user, setUser] = useState<string>("me");
  const [exite, setExited] = useState<number>(0);
  // State to store the user's profile data
  const [profile, setProfile] = useState({
    username: "",
    avatar: "",
    auth: "",
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

  function modal2faDefault() {
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
    if (TextInput.value) {
      set2faCodeError(false);
      axios({
        method: 'POST',
        url: '/api/auth/tfa/disable',
        data: {
          tfaCode: TextInput?.value
        },
      })
        .then((response) => {
          if (response.data.success) {
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
    if (TextInput.value) {
      set2faCodeError(false);
      axios({
        method: 'POST',
        url: '/api/auth/tfa/enable',
        data: {
          tfaCode: TextInput?.value
        },
      })
        .then((response) => {
          if (response.data.success) {
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

  async function PushEdits(Username: string, imgInput: string) {
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
            if (response.data.login42) {
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
    let maxSize: number = 6145 * 1024;
    let inputSize: number = 0;
    if (FileInput.files && FileInput.files.length > 0) {
      inputSize = FileInput.files[0].size;
    } else {
      inputSize = maxSize + 1;
    }
    console.log(maxSize);
    console.log(inputSize);
    var imgInput: File = profile.avatar;
    if (FileInput.files && FileInput.files[0] && maxSize > inputSize) {
      imgInput = FileInput.files[0];
    }
    PushEdits(TextInput.value, imgInput);
    FileInput.value = "";
  }


  // Fetch the user's profile data when the component mounts
  useEffect(() => {
    let user = 'me';
    console.log("router.query: ", router.query);
    if (router.query.param) {
      console.log("router.query.param: ", router.query.param);
      if (router.query.param[0])
        user = router.query.param[0];
      // setUser(router.query.param[0]);
    }
    async function fetchProfile() {
      axios
        .get("/api/users/" + user + "/fullprofile")
        .then((response) => {
          const { username, avatar, tfaEnabled } = response.data;
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
      <div className="card m-2">
        <div className="avatar">
          <img src={profile.avatar} alt={profile.username} />
        </div>
        <h1><b>{profile.username}</b></h1>

        <>

          {/* EDIT button and modal*/}
          <React.Fragment>
            <Button className='m-2' onClick={toggleEditModal}>Edit</Button>
            <Modal show={enableEditmodal}
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
            <Modal show={enable2famodal}
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
                      <TextInput id="2faCodeValidForm" className='form-control' type="text" inputMode='numeric' id="2faCodeInput" placeholder="Code" maxLength={6} />
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
                        <TextInput id="2faCodeValidForm" className='form-control' type="text" inputMode='numeric' id="2faCodeInput" placeholder="Code" maxLength={6} />
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
      <div className="flex flex-col"> {/* part2 general div */}
        <div className="flex flex-row flex-wrap justify-center">
          <div className="flex-1 card m-2 min-w-[392px]">
            <h1><b>History</b></h1>
            <div className="overflow-auto max-h-[300px]">
              {[...Array(10)].map((e, i) =>
                <Table>
                  <Table.Body className="divide-y bg-white">
                    <Table.Row className="hover:bg-gray-100">
                      <Table.Cell className="">
                        <div className="flex flex-row justify-between">
                          <Avatar img={profile.avatar} />
                          <h2 className="font-bold m-auto ml-1 text-sm">{profile.username}</h2>
                          <h2 className="font-bold m-auto text-lg">15 - 15</h2>
                          <h2 className="font-bold m-auto mr-1 text-sm">{profile.username}</h2>
                          <Avatar img={profile.avatar} />
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  </Table.Body>
                </Table>
              )}
            </div>
          </div>
          <div className="flex-2 card m-2 min-w-[240px]">
            <h1><b>Achivements</b></h1>
            <div className="flex overflow-auto flex-row  max-h-[300px] max-w-[609px]">
              <div className="flex space-x-0 flex-wrap justify-center">
                <svg className="w-20 h-20 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 14l9-5-9-5-9 5 9 5z"></path><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path></svg>
                <svg className="w-20 h-20 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                <svg className="w-20 h-20 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
              </div>
            </div>
          </div>
          <div className="flex-1 card m-2">
            <h1><b>Friends</b></h1>
            <div className="flex flex-row flex-wrap overflow-auto max-h-[300px]">
              {[...Array(10)].map((e, i) =>
                <div className="relative m-2" style={{ width: 80 }} onClick={() => {
                  // router.push(`/`)
                  // router.replace(`/profile/mmeski`)
                  setUser('mmeski')
                }}>
                  <Avatar
                    alt="Nav Drop settings"
                    img={profile?.avatar}
                    rounded={false}
                    size="lg"
                    status="online"
                  />
                  <div className="font-bold aero w-full" >
                    {profile.username}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;