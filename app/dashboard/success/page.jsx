"use client";
import React, { useContext, useEffect, useState } from "react";
// import Lottie from "lottie-react";
// import PaymentSuccefull from "@/public/PaymentSuccefull.json";
// import PaymentCheck from "@/public/PaymentCheck.json";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MatchUserPaymentSecretKey,
  RemoveUserPaymentSecretKey,
  // updateCreditsAndTotalSpent, // Commented out for unlimited credits
} from "@/app/_Serveractions";
import { useUser } from "@/lib/simpleAuth";
import { UserInfoContext } from "@/context/UserInfoContext";

const SuccessPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentkeyQueryParam = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [Lottie, setLottie] = useState(null);
  const [PaymentSuccefull, setPaymentSuccefull] = useState(null);
  const [PaymentCheck, setPaymentCheck] = useState(null);
  const { userInfo, setUserInfo } = useContext(UserInfoContext);
  const { user } = useUser();

  useEffect(() => {
    // Dynamically import Lottie and animation data on client side
    import('lottie-react').then((module) => {
      setLottie(() => module.default);
    });
    import('@/public/PaymentSuccefull.json').then((module) => {
      setPaymentSuccefull(module.default);
    });
    import('@/public/PaymentCheck.json').then((module) => {
      setPaymentCheck(module.default);
    });
  }, []);

  useEffect(() => {
    if (paymentkeyQueryParam && userInfo) {
      console.log("Payment key ✅✅✅", paymentkeyQueryParam);
      console.log("user Info 🤑🤑🤑: ", userInfo);
      const makebackendcall = async () => {
        userInfo && (await Matchpaymentsecretkey());
      };

      makebackendcall();
    }
  }, [userInfo, paymentkeyQueryParam]);

  const Matchpaymentsecretkey = async () => {
    try {
      const result = await MatchUserPaymentSecretKey(
        user?.email,
        paymentkeyQueryParam
      );
      if (result) {
        console.log("User payment secret key matched 🚀", result);

        await DeletePaymentSecretKeyFromDB();
      } else {
        console.log("User payment secret key not matched 🚀", result);
      }
    } catch (error) {
      console.error("Error matching user payment secret key", error);
    }
  };

  const DeletePaymentSecretKeyFromDB = async () => {
    try {
      const result = await RemoveUserPaymentSecretKey(
        user?.email
      );
      if (result) {
        console.log("User payment secret key deleted 🚀", result);
        // await AddCreditsOnUserAccount(); // Commented out for unlimited credits
      } else {
        console.log("User payment secret key not deleted 🚀", result);
      }
    } catch (error) {
      console.error("Error deleting user payment secret key", error);
    }
  };

  // const AddCreditsOnUserAccount = async () => {
  //   try {
  //     const currentCredits = userInfo?.credits || 0;
  //     const newCredits = currentCredits + 12;
  //     const email = user?.email;
  //     let newTotalSpent = userInfo?.totalSpent || 0;
  //     newTotalSpent += 1;

  //     // if (!isNaN(newTotalSpent) && typeof newTotalSpent === "number") {
  //     //   newTotalSpent += 1;
  //     // }

  //     if (!isNaN(newCredits) && typeof newCredits === "number") {
  //       const creditsUpdated = await updateCreditsAndTotalSpent(
  //         email,
  //         newCredits,
  //         newTotalSpent
  //       );
  //       if (creditsUpdated) {
  //         // setUserInfo((prevUserInfo) => ({
  //         //   ...prevUserInfo,
  //         //   credits: newCredits,
  //         //   totalSpent: newTotalSpent,
  //         // }));
  //         console.log("User credits updated: 🎉🎉🎉", newCredits);
  //       }
  //     } else {
  //       console.log("Invalid credits value:", newCredits);
  //     }
  //   } catch (error) {
  //     console.error("Error updating user credits", error);
  //   }
  // };

  return (
    <>
      <div className="flex justify-start -mx-32 mt-3">
        <Button
          onClick={() => router.replace("/dashboard")}
          className="flex justify-center items-center gap-1 rounded-3xl cursor-pointer"
        >
          <ArrowLeft /> Go back
        </Button>
      </div>
      <div className="flex flex-col p-0">
        <div className="flex flex-col justify-center items-center -mt-12">
          {Lottie && PaymentSuccefull ? (
            <Lottie
              animationData={PaymentSuccefull}
              loop={true}
              className="h-screen -mt-32 justify-center items-center"
            />
          ) : (
            <div className="h-screen w-screen bg-gray-200 rounded animate-pulse -mt-32"></div>
          )}

          {Lottie && PaymentCheck ? (
            <Lottie
              animationData={PaymentCheck}
              loop={true}
              className=" flex h-52 justify-center items-center -mt-52"
            />
          ) : (
            <div className="h-52 w-52 bg-gray-200 rounded animate-pulse -mt-52"></div>
          )}

          <h2 className="font-bold text-2xl text-indigo-700">
            ⚡ Payment Succefull ⚡
          </h2>
          <h2 className="font-bold text-2xl">
            Thanks for buying Credits for NeuroSync Mock Interviews
          </h2>
        </div>
      </div>
    </>
  );
};

export default SuccessPage;

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';
