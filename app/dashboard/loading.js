"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import loadingSpiner from "@/public/loadingSpiner.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div className="flex justify-center items-center m-auto h-screen">
      <Lottie
        animationData={loadingSpiner}
        loop={true}
        className="h-60 w-60 lg:h-96 lg:w-96  justify-center items-center"
      />
    </div>
  );
}
