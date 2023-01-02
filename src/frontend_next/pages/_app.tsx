import '../styles/globals.css'
import Head from 'next/head'
import type { AppProps } from 'next/app'
import Router, {useRouter} from 'next/router';
import { useEffect, useState } from 'react'
import Navbar from '../components/navbar';
import axios from 'axios';
import { waitForDebugger } from 'inspector';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default function App({ Component, pageProps , ...AppProps }: AppProps) {
  
  const [Nav_active, setNav_active] = useState(false)
  const [appReady, setappReady] = useState(false)
  const [data,setData] = useState({})

  async function routeMo(uri:any, nav:boolean, app:boolean, isError:boolean = false){
    if (AppProps.router.route !== '/login' && !isError)
      uri = AppProps.router.route;
    Router.push(uri);
    await sleep(150);
    setNav_active(nav);
    setappReady(app);
  }
  useEffect(()=>{
    const fetchData = async () => {
        let appRootContainer = document.getElementById('appRootContainer');
        axios.get('http://127.0.0.1.nip.io/api/users/me')
        .then((response) => {
          // console.log(response);
          setData(response.data);
          if (response.data.login42){
            routeMo('/', true, true);
          }
        })
        .catch((e) => {
          console.log("error");
          routeMo('/login', false, true, true);
        });
      }
      fetchData()
  },[])
    return (
    <>
    <Head>
        <title>Transcendence</title>
        <meta name="description" content="Ping Pong game." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
    </Head>
    {appReady && 
     <div id='appRoot' className="min-h-screen flex">
        <div id='appNav' className=''>
          {Nav_active && <Navbar />}
        </div>
        <div id='appRootContainer' className="flex-1 h-screen ">
          <Component {...pageProps} />  
        </div>
      </div>
    }
    </>
    )
}
