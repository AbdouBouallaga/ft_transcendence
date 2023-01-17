import '../styles/globals.css'
import '../styles/gameStyle.css';

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
  const [profile, setProfile] = useState({
    id: 0,
    username: '',
    avatar: '',}
  )

  async function routeMo(uri:any, nav:boolean, app:boolean, isError:boolean = false){ //route and display content
    const apply = () =>{
      setNav_active(nav);
      setappReady(app);
    }
    if (AppProps.router.route !== '/login' && !isError)
      uri = AppProps.router.route;
    if (AppProps.router.route == '/gameFull')
      nav = false;
    Router.push(uri);
    Router.events.on('routeChangeComplete', apply) /// this is the key
  }
  
  useEffect(()=>{
    if (AppProps.router.route == '/verify2fa'){
      routeMo('/verify2fa', false, true);
    }
    else {
    const fetchData = async () => {
        // let appRootContainer = document.getElementById('appRootContainer');
        axios.get('/api/users/me')
        .then((response) => {
          // console.log(response);
          // console.log(response.data)
          const {id, username, avatar} = response.data;
          setProfile({id, username, avatar})
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
    }
  },[])
    return (
    <>
    <Head>
        <title>Transcendence</title>
        <meta name="description" content="Ping Pong game." />
        {/* <meta name="viewport" content="width=device-width, initial-scale=1" /> */}
        <link rel="icon" href="/favicon.ico" />
    </Head>
    {appReady && 
      <div id='appRoot' className="h-screen flex flex-col">
        {Nav_active && <Navbar profile={profile} />}
        <Component {...pageProps} />  
      </div>
    }
    </>
    )
}
