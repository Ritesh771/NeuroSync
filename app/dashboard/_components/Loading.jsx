"use client";
import React, { useState, useEffect } from "react";
import skelotenloading2 from "@/public/skelotenloading2.json";

const Loading = () => {
  const [Lottie, setLottie] = useState(null);

  useEffect(() => {
    // Dynamically import Lottie on client side only
    import('lottie-react').then((module) => {
      setLottie(() => module.default);
    });
  }, []);

  return (
    <div className="flex justify-center items-center">
      {Lottie ? (
        <Lottie
          animationData={skelotenloading2}
          loop={true}
          speed={3.5}
          className="h-96 justify-center items-center"
        />
      ) : (
        <div className="h-96 w-96 bg-gray-200 rounded animate-pulse flex justify-center items-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      )}
      {/* <h2 className="text-2xl text-bold">Loading.........</h2> */}
    </div>
  );
};

export default Loading;
