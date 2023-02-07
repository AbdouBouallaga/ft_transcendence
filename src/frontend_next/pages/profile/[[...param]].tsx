import React, { useState, useEffect, useContext, useRef, MutableRefObject } from "react";
import Router, { useRouter } from 'next/router';
import axios from "axios";
import { Modal, Button, TextInput, Badge, Table, Dropdown, Avatar } from "flowbite-react";
import ImageResize from 'image-resize';
import { v4 as uuidv4 } from 'uuid';
import { Heart, Win_3, Win_5 } from "../../components/icons/achievement";
import { userAgentFromString } from "next/server";
import { GeneralContext } from "../_app";

var imageResize = new ImageResize({
  format: 'png',
  height: 90,
  width: 90
});

const Profile = (props: any) => {
  const Context: any = useContext(GeneralContext);
  const gameSocket: any = Context.Socket;
  let statustab = ["offline", "online", "busy"];
  // let users: { login42: string, socketId: string, status: number }[] = [];
  const router = useRouter();
  // State to store the user's profile data
  let [itsme, setItsme] = useState(true);
  let [r, setR] = useState(0);
  const [profile, setProfile] = useState<any>({
    login42: "",
    username: "",
    avatar: "",
    auth: "",
    tfaEnabled: false,
    friends: [],
    games: [],
  });
  // const [edit, setEdit] = useState(false);

  // // State to store the edit mode status
  // const [isEditing, setIsEditing] = useState(false);

  //2fa
  const [data2fa, set2fa] = useState<any>({});
  const [qrnextButton, setqrnextButton] = useState<boolean>(true);
  const [qrprevButton, setqrprevButton] = useState<boolean>(false);
  const [qr2faConfirm, set2faConfirm] = useState<boolean>(false);
  const [qr2faCodeError, set2faCodeError] = useState<boolean>(false);
  const [enabled2fa, set2faEnabled] = useState<Boolean>(false);
  const [editError, setEditError] = useState<boolean>(false);
  let [img, setImg] = useState(props.profile.avatar);
  let [users, setUsersStatus] = useState<any>(null);


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
        set2fa(response.data);
        toggle2faModal();
      })
      .catch((error) => {
        console.log(error);
      })
  }
  async function disable2fa() {
    axios({
      method: 'POST',
      url: '/api/auth/tfa/disable',
    })
      .then((response) => {
        if (response.data.success) {
          set2faEnabled(false);
        }

      })
      .catch((error) => {
        set2faCodeError(true);
      })
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
  function preview() {
    const FileInput = document.getElementById('avatar') as HTMLInputElement;
    if (FileInput.files) {
      let imgInput = FileInput.files[0];
      var imgResized = imageResize.play(imgInput)
        .then((resizedImage) => {
          setImg(resizedImage);
        }
        )
    }
  }
  async function PushEdits(Username: string, imgInput: File) {
    var imgResized = imageResize.play(imgInput)
      .then((resizedImage) => {
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
              setR(r + 1)
              toggleEditModal();
              // Router.reload(); // reload l7za9 kaml
              setTimeout(() => {
                props.setR(props.r + 1)
              }, 250);
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
    var imgInput: File = profile.avatar;
    if (FileInput.files && FileInput.files[0] && maxSize > inputSize) {
      imgInput = FileInput.files[0];
    }
    PushEdits(TextInput.value, imgInput);
    FileInput.value = "";
  }

  // Fetch the user's profile data when the component mounts
  let init = useRef<boolean>(false);
  useEffect(() => {
    console.log("init.current", init.current)
    if (!init.current) {
      init.current = true;
      props.gameSocket.on("updateUserStatus", (data: any) => {
        console.log("updateUserStatus", data);
        setUsersStatus(data);
      },);
    }
  }, [])
  useEffect(() => {

    let user = 'me';
    setItsme(true);
    if (router.query.param) {
      if (router.query.param[0])
        user = router.query.param[0];
      setItsme(false);
    }
    let init = false;
    async function fetchProfile() {
      axios
        .get("/api/users/" + user + "/fullprofile")
        .then((response) => {
          console.log(">>>>>>>>> ", response.data);
          console.log("APP ", props.profile);
          const { login42, username, avatar, tfaEnabled, friends, games, blocking, blocked } = response.data;
          setProfile({
            login42,
            username,
            avatar,
            tfaEnabled,
            friends,
            games,
            blocking,
            blocked
          });
          if (!init && gameSocket) {
            gameSocket.emit("getUsersStatus");
            init = true;
          }
          set2faEnabled(tfaEnabled);
        })
        .catch((error) => {
          console.log(error);
        });
    }
    fetchProfile();
  }, [enabled2fa, router.query, r]);


  // Function to toggle edit mode

  // Render the profile data in a card
  if (users !== null)
    return (
      <>
        <div className="card m-2">

          <Avatar img={profile.avatar}
            size="xl"
            rounded={false}
            status={users[profile.username] !== undefined ? statustab[users[profile.username].status] as any : 'offline'}
            statusPosition="bottom-right"
          />
          <h1><b> {profile.username}</b></h1>
          {!profile.blocked ? <>
            <div className="flex">
              {profile.login42 === props.profile.login42 && profile.login42 !== '' ?
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
                        <div className="form-group flex flex-col place-items-center">
                          {/* <img className="rounded-full" height={160} width={160} src={img} alt={profile.username} /> */}
                          <Avatar img={img} size="xl" />
                          <label>Username</label>
                          <TextInput id="username" className='form-control' type="text" defaultValue={profile.username} />
                        </div>
                        <div className="form-group">
                          <label>Avatar</label>
                          <input onChange={preview} type="file" className="form-control-file" id="avatar" max-size="1" accept="image/*" />
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
                    {profile.tfaEnabled ? <Button className='m-2' color="failure" onClick={disable2fa} >Disable 2fa</Button> : <Button className='m-2' onClick={enable2fa}>Enable 2fa</Button>}
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
                              <img className='m-auto' src={data2fa['otpAuthURL']} alt="qr" />
                            </div>
                          }
                          {qrprevButton &&
                            <div className='flex' id="2faConfirm">
                              <TextInput className='form-control' type="text" inputMode='numeric' id="2faCodeInput" placeholder="Code" maxLength={6} />
                              <Button className='btn btn btn-primary' onClick={confirm2fa}>Confirm</Button>
                            </div>
                          }
                          {qr2faCodeError &&
                            <Badge color="failure" size="L">
                              <strong >Wrong Code !!</strong>
                            </Badge>
                          }
                        </Modal.Body>
                      }
                      {profile.tfaEnabled &&
                        <Modal.Body>
                          {qr2faConfirm && // yeah yeah, profile.tfaEnabled logic
                            <Badge color="success" size="L">
                              <strong >2fa enabled successfully</strong>
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
                </> : <></>
              }
              {profile.login42 !== props.profile.login42 && profile.login42 !== '' ?
                <>
                  {!profile.blocking ? <>
                    {(props['profile']['friends'].findIndex((x: any) => x['login42'] === profile['login42']) === -1) ?
                      <Button className='m-2' onClick={() => {
                        axios({
                          method: 'POST',
                          url: '/api/users/follow/' + profile.username,
                        }).then((res) => {}).catch((err) => {})
                        // router.reload()
                        setTimeout(() => {
                          props.setR(props.r + 1)
                          setTimeout(() => {
                            setR(r + 1)
                          }, 250);
                        }, 250);
                      }}>Follow</Button>
                      :
                      <Button className='m-2 danger' onClick={() => {
                        axios({
                          method: 'POST',
                          url: '/api/users/unfollow/' + profile.username,
                        }).then((res) => {}).catch((err) => {})
                        // router.reload()
                        setTimeout(() => {
                          props.setR(props.r + 1)
                          setTimeout(() => {
                            setR(r + 1)
                          }, 250);
                        }, 250);
                      }}>UnFollow</Button>
                    }
                    <Button className='m-2' onClick={() => {
                      axios({
                        method: 'POST',
                        url: '/api/chat/createDM',
                        data: {
                          otherLogin42: profile.login42,
                        },
                      })
                        .then((response) => {
                          router.push("/chat/" + response.data.id);
                          console.log(response.data)
                        })
                        .catch((error) => {
                          console.log(error)
                        });
                    }}>Direct message</Button>
                    <Button className='m-2' onClick={() => {
                      let room = uuidv4();
                      setTimeout(() => {
                        if (gameSocket) {
                          gameSocket.emit('sendInviteToPlay', { 'from': props.profile.username, 'to': profile.username, 'room': room })
                          router.push("/game/" + room)
                        }
                      }, 250);
                    }}>Invite to play</Button>

                    <Button color="failure" className='m-2' onClick={() => {
                      axios({
                        method: 'POST',
                        url: '/api/users/block/' + profile.username,
                      }).then((res) => {}).catch((err) => {})
                      // router.reload()
                      setTimeout(() => {
                        props.setR(props.r + 1)
                        setTimeout(() => {
                          setR(r + 1)
                        }, 250);
                      }, 250);
                    }}>Block</Button>
                  </>
                    :
                    <Button color="success" className='m-2' onClick={() => {
                      axios({
                        method: 'POST',
                        url: '/api/users/unblock/' + profile.username,
                      }).then((res) => {}).catch((err) => {})
                      // router.reload()
                      setTimeout(() => {
                        props.setR(props.r + 1)
                        setTimeout(() => {
                          setR(r + 1)
                        }, 250);
                      }, 250);
                    }}>Unblock</Button>
                  }
                  <p>
                  </p>
                </> :
                <>

                </>}
            </div>
          </> : <></>}
        </div>
        {!profile.blocked ? <>
          <div className="flex flex-col"> {/* part2 general div */}
            <div className="flex flex-row flex-wrap justify-center">
              <div className="flex-1 card m-2 min-w-[392px]">
                <h1><b>History</b></h1>
                <div className="overflow-auto max-h-[300px]">
                  {profile.games.slice(0).reverse().map((e: any, i: number) =>
                    <Table key={i}>
                      <Table.Body className="divide-y bg-white">
                        <Table.Row className="hover:bg-gray-100">
                          <Table.Cell className="">
                            <div className="flex flex-row justify-between">
                              <div className="flex flex-row" onClick={() => {
                                router.replace(`/profile/` + e['winner']['username'])
                              }}>
                                <Avatar img={e['winner']['avatar']} />
                                <h2 className="font-bold m-auto ml-1 text-sm">{e['winner']['username']}</h2>
                              </div>
                              <h2 className="font-bold m-auto text-lg">{e['winnerScore'] + '-' + e['loserScore']}</h2>
                              <div className="flex flex-row" onClick={() => {
                                router.replace(`/profile/` + e['loser']['username'])
                              }}>
                                <h2 className="font-bold m-auto mr-1 text-sm">{e['loser']['username']}</h2>
                                <Avatar img={e['loser']['avatar']} />
                              </div>
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
                  <div className="flex space-x-0 flex-wrap justify-center p-1">
                    {profile.games.length > 0 &&
                      <Heart />
                    }
                    {profile.games.length > 2 &&
                      <Win_3 />
                    }
                    {profile.games.length > 4 &&
                      <Win_5 />
                    }
                  </div>
                </div>
              </div>
              <div className="flex-1 card m-2">
                <h1><b>Friends</b></h1>
                <div className="flex flex-row flex-wrap overflow-auto max-h-[300px]">
                  {profile.friends.map((e: any, i: number) =>
                    <div key={i} className="relative m-2" style={{ width: 80 }} onClick={() => {
                      router.push(`/profile/` + e['username'])
                    }}>
                      <Avatar
                        alt="Nav Drop settings"
                        img={e['avatar']}
                        rounded={false}
                        size="lg"
                        status={users[e['username']] !== undefined ? statustab[users[e['username']].status] as any : 'offline'}
                      />
                      <div className="font-bold aero w-full" >
                        {/* {statustab[users[e['login42']].status]} */}
                        {e['username']}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </> : <></>}
      </>
    );
};

export default Profile;