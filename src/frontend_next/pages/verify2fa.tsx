import React, { useState, useEffect } from "react";
import axios from "axios";



export default function Login2fa() {
  const [qr2faCodeError, set2faCodeError] = useState(false);

  async function confirm2fa() {
    const input = document.getElementById('code2faVerify') as HTMLInputElement;
    console.log(input.value);
    if (input.value){
      set2faCodeError(false);
      axios({
        method: 'POST',
        url: '/api/auth/tfa/verify',
        data: {
          tfaCode: input?.value
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
            <input type="text" name="code" id="code2faVerify" placeholder="code" />
            {qr2faCodeError &&
            <div id='enabled' className='alert alert-danger text-center'>
            <strong >Wrong Code !!</strong>
            </div>
            }
            <button onClick={confirm2fa} id="verify2fa" className="btn btn-primary">Verify</button>
       </div>
       </div>
        </div>

      </>
    )
  }