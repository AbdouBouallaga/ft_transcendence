import "../styles/globals.css";
import "../styles/gameStyle.css";

import Head from "next/head";
import type { AppProps } from "next/app";
import Router, { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import axios from "axios";

export default function App({ Component, pageProps, ...AppProps }: AppProps) {
  const [Nav_active, setNav_active] = useState(false);
  const [appReady, setappReady] = useState(false);
  const [data, setData] = useState({});
  const [profile, setProfile] = useState({
    login42: "",
    username: "",
    avatar: "",
    auth: "",
    tfaEnabled: false,
    friends: [],
    games: [],
  });

  async function routeMo(
    uri: any,
    nav: boolean,
    app: boolean,
    isError: boolean = false
  ) {
    //route and display content
    const apply = () => {
      setNav_active(nav);
      setappReady(app);
    };
    if (AppProps.router.route !== "/login" && !isError)
      uri = AppProps.router.route;
    console.log("uri", uri);
    console.log("query", Router.query);
    Router.replace({
      pathname: uri,
      query: Router.query,
    });
    Router.events.on("routeChangeComplete", apply); /// this is the key
  }

  useEffect(() => {
    if (AppProps.router.route == "/verify2fa") {
      routeMo("/verify2fa", false, true);
    } else {
      const fetchData = async () => {
        // let appRootContainer = document.getElementById('appRootContainer');
        axios
          .get("/api/users/me/fullprofile")
          .then((response) => {
            // console.log(response);
            console.log(response.data);
            const { login42, username, avatar, tfaEnabled, friends } = response.data;
            setProfile({
              login42,
              username,
              avatar,
              tfaEnabled,
              friends,
            });
            setData(response.data);
            if (response.data.login42) {
              routeMo("/", true, true);
            }
          })
          .catch((e) => {
            console.log("error");
            routeMo("/login", false, true, true);
          });
      };
      fetchData();
    }
  }, []);
  return (
    <>
      <Head>
        <title>Transcendence</title>
        <meta name="description" content="Ping Pong game." />
        <meta
          name="viewport"
          content="initial-scale=1.0, maximum-scale=1.0,user-scalable=0"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {appReady && (
        <div id="appRoot" className="h-screen flex flex-col">
          {Nav_active && <Navbar profile={profile} />}
          {/* <div className=""> */}
          <Component {...pageProps} profile={profile} />
          {/* </div> */}
        </div>
      )}
    </>
  );
}
