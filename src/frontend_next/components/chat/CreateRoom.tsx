import {
  Button,
  TextInput,
  Label,
  Select,
  ToggleSwitch,
  Alert,
  Toast,
} from "flowbite-react";
import React, { useState } from "react";
import axios from "axios";

const CreateRoom = ({ setCreateRoom }:any) => {
  const [data, setData] = useState({
    name: "",
    type: "PUBLIC",
    isProtected: false,
    password: "",
  });

  const [error, setError] = useState(false);

  const { type, isProtected, password, name } = data;

  const handelSubmit = (e: any) => {
    e.preventDefault();
    console.log("data", data);
    const send = async () => {
      try {
        let res = await axios.post("/api/chat/createRoom", data);
        const { status } = res;
        status === 201 &&
          (setCreateRoom(false),
          setData({
            name: "",
            type: "PUBLIC",
            isProtected: false,
            password: "",
          }));
      } catch (e) {
        setError(true);
      }
    };
    send();
  };

  const handleChangeName = (e: any) => {
    setData((old) => ({ ...old, name: e.target.value }));
    setError(false);
  };
  return (
    <form
      onSubmit={handelSubmit}
      className="space-y-6 px-6 pb-4 sm:pb-6 lg:px-8 xl:pb-8"
    >
      <h3 className="text-xl font-medium text-gray-900 ">Create a Room</h3>
      <div>
        <div className="mb-2 block">
          <Label
            htmlFor="name"
            color={error ? "failure" : "primary"}
            value="Name"
          />
        </div>
        <TextInput
          onChange={handleChangeName}
          value={name}
          id="name"
          placeholder="Name of the room"
          color={error ? "failure" : "primary"}
          required={true}
          helperText={
            <React.Fragment>
              {error && (
                <span className="font-medium">Oops! Room already taken!</span>
              )}
            </React.Fragment>
          }
        />
      </div>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="access" value="Access" />
          {/* select */}
        </div>
        <Select
          id="access"
          value={type}
          onChange={(e) => setData((old) => ({ ...old, type: e.target.value }))}
        >
          <option value="PUBLIC">Public</option>
          <option value="PRIVATE">Private</option>
        </Select>
      </div>
      {type !== "PRIVATE" && (
        <div className="flex items-center mb-4">
          <ToggleSwitch
            checked={isProtected}
            label="Protected"
            onChange={(e) =>
              setData((old) => ({ ...old, isProtected: !isProtected }))
            }
          />
        </div>
      )}
      {/* check box */}
      {isProtected && (
        <div>
          <div className="mb-2 block">
            <Label htmlFor="password" value="Your password" />
          </div>
          <TextInput
            value={password}
            onChange={(e) =>
              setData((old) => ({ ...old, password: e.target.value }))
            }
            id="password"
            type="password"
            required={true}
          />
        </div>
      )}

      <div className="w-full">
        <Button type="submit">Create</Button>
      </div>
    </form>
  );
};

export default CreateRoom;
