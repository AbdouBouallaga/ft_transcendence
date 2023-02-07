import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, TextInput, Badge} from "flowbite-react";



export default function Login2fa() {
  const [qr2faCodeError, set2faCodeError] = useState(false);

  async function confirm2fa() {
    const TextInput = document.getElementById('code2faVerify') as HTMLInputElement;
    
    if (TextInput.value){
      set2faCodeError(false);
      axios({
        method: 'POST',
        url: '/api/auth/tfa/verify',
        data: {
          tfaCode: TextInput?.value
        },
      })
      .then((response) => {
        if (response.data.success) {
          window.location.href = '/'; 
        }
        })
        .catch((error) => {
          set2faCodeError(true);
        })
      }
      else {
        set2faCodeError(true);
      }
  }
    return (
      <>
       <div id='verify2faloginDiv' className='container min-h-screen mx-auto px-4 grid place-items-center '  >
       <div  className='login bg-gray-50 w-[350px] rounded-lg  min-h-[300px] shadow-lg p-2 grid place-items-center ' >
          <div>
            <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
              Verify 2FA
            </h2>
            <br />
            <div className="flex">
              <TextInput type="text" name="code" id="code2faVerify" placeholder="code" className="form-control" />
              <Button onClick={confirm2fa} id="verify2fa" className="btn btn-primary">Verify</Button>
            </div>
            {qr2faCodeError &&
            <Badge
            color="failure"
            size="L"
            >
            <strong>WRONG CODE !!!</strong>
            </Badge>
            }
       </div>
       </div>
        </div>

      </>
    )
  }