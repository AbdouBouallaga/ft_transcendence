import { Button, TextInput, Label, Select, ToggleSwitch } from "flowbite-react";
import React, { useState } from "react";
import axios from "axios";

const CreateRoom = () => {
  const [data, setData] = useState({
    name: "",
    type: "PUBLIC",
    isProtected: false,
    password: "",
    login42: "mmeski",
  });

  const [error, setError] = useState(false);

  const { type, isProtected, password, name } = data;

  const handelSubmit = (e: any) => {
    e.preventDefault();
    console.log("data", data);
    const send = async () => {
      let res = await axios.post("/api/chat/createRoom", data);

      console.log("***********************res**********************", res);
    };
    send();

    //  need to add error handling unique name and other stuff
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
          onChange={(e) => setData((old) => ({ ...old, name: e.target.value }))}
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
          // color="failure"
          // className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
