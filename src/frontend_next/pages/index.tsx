import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";
import { Stream } from "stream";
import pongLottie from "../components/icons/pong.json";
import loaddingPong from "../components/icons/start.json";
import { Button } from "flowbite-react";
import { Arrow } from "../components/icons";
import { useRouter } from "next/router";

const Index = (props: any) => {
  const router = useRouter();

  return (
    <>
      <div className="fixed bottom-0 right-0">
        <Arrow />
      </div>
      <div className="z-10 flex flex-col justify-center mx-auto  mt-28">
        <h1 className="text-gray-400 text-5xl">
          Keep the ball in play with Pong.
        </h1>
        <div className="text-gray-100 text-2xl  max-w-[700px] w-[90%] mx-auto">
          Get ready for a classic arcade experience with Pong! Two players
          control paddles on either side of the screen to hit a ball back and
          forth. The goal is to score points by making the ball pass the
          opponents paddle and not allowing it to touch the sides of the screen.
          Use the UP and DOWN arrow keys to control the movement of your paddle
          and challenge your friends for hours of fun. With fast-paced gameplay
          and the option for increased ball speed, power-ups, and obstacles,
          Pong is a game that will keep you on your toes. Who will come out on
          top as the Pong champion?
        </div>

        <button
          onClick={() => router.push("/game")}
          className="mx-auto mt-14 flex align-center justify-center"
          // outline={true}
        >
          <div className=" w-[190px] h-[50px]">
            <Lottie animationData={loaddingPong} />
          </div>
        </button>
      </div>
    </>
  );
};

export default Index;
