"use client";
import React, { useState, useEffect } from "react";
import NoResultFound from "@/public/NoResultFound.json";

const NoDataFound = ({ message }) => {
  const [Lottie, setLottie] = useState(null);

  useEffect(() => {
    // Dynamically import Lottie on client side only
    import('lottie-react').then((module) => {
      setLottie(() => module.default);
    });
  }, []);

  return (
    <div className="flex flex-col justify-center items-center">
      {Lottie ? (
        <Lottie
          animationData={NoResultFound}
          loop={true}
          className="w-8/12 h-96"
        />
      ) : (
        <div className="w-8/12 h-96 bg-gray-200 rounded animate-pulse flex justify-center items-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      )}
      <p className="font-bold text-xl">{message || "No result found!"} </p>
    </div>
  );
};

export default NoDataFound;
