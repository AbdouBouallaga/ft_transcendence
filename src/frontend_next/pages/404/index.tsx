import { Button } from "flowbite-react";
import Lottie from "lottie-react";
import { useRouter } from "next/router";
import React from "react";
import error from "../../components/icons/error404.json";

const index = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const router = useRouter();
  return (
    <div>
      <h1 className="text-4xl font-bold text-center mt-16">Page Not Found</h1>
      <div className="w-[80%] mt-16 mx-auto">
        <Lottie animationData={error} />
      </div>
      <Button type="button" className="m-auto" onClick={() => router.push("/")}>
        Go To Home
      </Button>
    </div>
  );
};

export default index;
