import "../styles/globals.css";
import "../styles/gameStyle.css";

import Head from "next/head";
import type { AppProps } from "next/app";
import Router, { useRouter } from "next/router";
import { use, useEffect, useState } from "react";
import Navbar from "../components/navbar";
import axios from "axios";
import { io } from "socket.io-client";
import { Socket } from "dgram";

export default function App({ Component, pageProps, ...AppProps }: AppProps) {
  const [gameSocket, setGameSocket] = useState<any>(null);
  let initsocket: boolean = false;
  const [reloadApp, setReloadApp] = useState<number>(0);
  const [Nav_active, setNav_active] = useState<boolean>(false);
  const [appReady, setappReady] = useState<boolean>(false);
  const [profile, setProfile] = useState<any>({
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
    if (AppProps.router.route === "/welcome")
      nav = false;

    console.log("uri", uri);
    console.log("query", Router.query);
    Router.replace({
      pathname: uri,
      query: Router.query,
    });
    Router.events.on("routeChangeComplete", apply); /// this is the key
  }
  // let initUsersocket: boolean = false;
  useEffect(() => {
    if (!Router.isReady) return;
    if (!initsocket) {
      setGameSocket(io("/game"));
      initsocket = true;
    }
    console.log("app useEffect")
    if (AppProps.router.route == "/verify2fa") {
      routeMo("/verify2fa", false, true);
    } else {
      const fetchData = async () => {
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
      if (profile.login42 !== ''){
        gameSocket.emit("initUser", profile.login42);
        console.log("avalable", profile.login42)
      }
    }
  }, [reloadApp, profile.login42, Router.isReady]);
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
          {Nav_active && <Navbar {...pageProps} profile={profile} gameSocket={gameSocket} />}
          <Component {...pageProps} profile={profile} r={reloadApp} setR={setReloadApp} gameSocket={gameSocket} />
        </div>
      )}
    </>
  );
}
