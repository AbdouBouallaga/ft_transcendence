import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, TextInput, Badge, Avatar } from "flowbite-react";
import ImageResize from 'image-resize';
import Router from "next/router";


var imageResize = new ImageResize({
    format: 'png',
    height: 160,
    width: 160
});

export default function welcome(props) {
    let profile = props.profile;
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
                            // Router.reload(); // reload l7za9 kaml
                            props.setR(props.r + 1)
                            // setReloadContent(editReloadContent + 1); // this reload the profile but not the navbar
                        }
                    })
                    .catch((error) => {
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
    return (
        <>
            <div id='verify2faloginDiv' className='container min-h-screen mx-auto px-4 grid place-items-center max-w-fit'  >
                <div className='aero login w-[350px] rounded-lg  min-h-[300px] shadow-lg p-2 grid place-items-center ' >
                    <h1 className='text-2xl font-bold text-center'>Welcome {profile.username}</h1>
                    <p className='text-center'>You can change your username and avatar here</p>
                    <img className="rounded-full" src={profile.avatar} alt={profile.username} />
                    <div className="form-group">
                        <label className="font-bold">Username</label>
                        <TextInput id="username" className='form-control' type="text" defaultValue={profile.username} />
                    </div>
                    <div className="form-group">
                        <label className="font-bold text-al">Avatar</label>
                        <input type="file" className="form-control-file" id="avatar" max-size="1" accept="image/*" />
                    </div>
                    <Button onClick={ProcessEdits} className='m-2 btn btn-primary'>Save</Button>
                </div>
            </div>

        </>
    )
}