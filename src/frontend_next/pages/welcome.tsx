import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, TextInput, Badge, Avatar } from "flowbite-react";
import ImageResize from 'image-resize';
import Router from "next/router";


var imageResize = new ImageResize({
    format: 'png',
    height: 90,
    width: 90
});

export default function Welcome(props: any) {

    let [img, setImg] = useState(props.profile.avatar);
    let profile = props.profile;
    async function PushEdits(Username: string, imgInput: File) {
        props.gameSocket.emit("initUser", Username);
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
                            props.gameSocket.emit("initUser", response.data.username);
                            // Router.reload(); // reload l7za9 kaml
                            // setTimeout(() => {
                            //     props.setR(props.r + 1)
                            setTimeout(() => {
                                Router.push("/");
                                Router.events.on("routeChangeComplete", () => { props.setR(props.r + 1) });
                            }, 150);
                            // }, 250);
                            // setReloadContent(editReloadContent + 1); // this reload the profile but not the navbar
                        }
                    })
                    .catch((error) => {
                        Router.replace("/");
                    })
            }
            ).catch((error) => {
            })
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
    return (
        <>
            <div className='container min-h-screen mx-auto px-4 grid place-items-center min-w-fit'  >
                <div className='aero login w-auto rounded-lg  min-h-[300px] shadow-lg m-2 p-2 grid place-items-center ' >
                    <h1 className='text-2xl font-bold text-center'>Welcome {profile.username}</h1>
                    <p className='text-center'>You can change your username and avatar here</p>
                    {/* <img className="rounded-full" height={160} width={160} src={img} alt={profile.username} /> */}
                    <Avatar img={img} size="xl" />
                    <div className="form-group  space-y-1 flex flex-col">
                        <label className="font-bold">Username</label>
                        <TextInput id="username" className='form-control' type="text" defaultValue={profile.username} />
                    </div>
                    <div className="form-group space-y-1 flex flex-col justify-center">
                        <label className="font-bold text-al m-1">Avatar</label>
                        <input onChange={preview} type="file" className="form-control-file" id="avatar" max-size="1" accept="image/*" />
                    </div>
                    <Button onClick={ProcessEdits} className='m-2 btn btn-primary'>Save</Button>
                </div>
            </div>

        </>
    )
}