import React from "react";
import { HiSparkles } from "react-icons/hi2";
import { IoChatboxEllipses } from "react-icons/io5";
import { GiBrain } from "react-icons/gi";
import { UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function LandingPage() {
  const { user, isSignedIn } = useUser();
  return (
    <div>
      {/* <Header /> */}
      <div className="flex justify-between p-2 shadow-sm">
        <div className="flex items-center justify-between ">
          <Image
            src="/logo2.png"
            width={160}
            height={100}
            objectFit="contain"
            alt="logo"
          />
        </div>

        {isSignedIn ? (
          <div className="flex justify-between items-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline" className="border-2 border-primary">
                Dashboard
              </Button>
            </Link>{" "}
            <UserButton />
          </div>
        ) : (
          <Link href="/dashboard">
            <Button>Get Started</Button>
          </Link>
        )}
      </div>
      <div>
        <img
          src={"/hexagrid3.jpg"}
          className="absolute z-[-10] w-full  md:block lg:hidden"
          width={1200}
          height={300}
        />
        {/* <Header/> */}
        <section className=" z-50">
          <div className="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-12">
            <a
              href="#"
              className="inline-flex justify-between items-center py-1 px-1 pr-4 mb-7 text-sm text-gray-700 bg-gray-100 rounded-full dark:bg-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
              role="alert"
            >
              <span className="text-xs bg-primary rounded-full text-white px-4 py-1.5 mr-3">
                New
              </span>{" "}
              <span className="text-sm font-medium">
                NeuroSync AI - AI Mock Interviewer
              </span>
              <svg
                className="ml-2 w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </a>
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
              Practice For Interview{" "}
              <span className="text-primary">With AI</span>{" "}
            </h1>
            <p className="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">
              Effortlessly Craft a Standout Mock Interview with Our AI-Powered
              Builder
            </p>
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
              <Link href="/dashboard">
                <Button variant="default">Get Started</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline">View Demo</Button>
              </Link>
            </div>
          </div>
        </section>
        <section className="py-8 bg-white z-50 px-4 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-12">
          <h2 className="font-bold text-3xl">How it Works?</h2>
          <h2 className="text-md text-gray-500">
            Give mock interview in just 3 simplar easy step
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* column 1 */}
            <a
              className="block rounded-xl border bg-white
         border-gray-200 p-8 shadow-xl transition
         hover:border-pink-500/10 hover:shadow-pink-500/10 cursor-default"
              href="#"
            >
              {/* <AtomIcon className="h-8 w-8" /> */}
              <GiBrain className="h-8 w-8 text-indigo-700" />

              <h2 className="mt-4 text-xl font-bold text-black">
                Create Interview with AI
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                You can create mock interviews with AI, by providing you job
                description. The AI will generate a series of questions based on
                your input.
              </p>
            </a>

            {/* column 2 */}
            <a
              className="block rounded-xl border bg-white border-gray-200 p-8 shadow-xl transition hover:border-pink-500/10 hover:shadow-pink-500/10 cursor-default"
              href="#"
            >
              {/* <Edit className="h-8 w-8" /> */}
              <IoChatboxEllipses className="h-8 w-8 text-indigo-700" />

              <h2 className="mt-4 text-xl font-bold text-black">
                Get FeedBacks after Interview
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                You'll be able to record your answers. At the end of the
                interview, you'll get a feedback along with the correct answer
                for each of the questions and your answer to compare it.
              </p>
            </a>

            {/* column 3 */}
            <a
              className="block rounded-xl border bg-white border-gray-200 p-8 shadow-xl transition hover:border-pink-500/10 hover:shadow-pink-500/10 cursor-default"
              href="#"
            >
              {/* <Share2 className="h-8 w-8" /> */}
              <HiSparkles className="h-8 w-8 text-indigo-700" />

              <h2 className="mt-4 text-xl font-bold text-black">
                Upgrade & Favourites
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                In the free Plan you will get 6 Credits to Generate your mock
                Interview with AI. You can also add it to your favourites lists.
              </p>
            </a>
          </div>

          <div className="mt-12 text-center">
            <a
              href="/dashboard"
              className="inline-block rounded bg-primary px-12 py-3 text-sm font-medium text-white transition hover:bg-pink-700 focus:outline-none focus:ring focus:ring-yellow-400"
            >
              Get Started Today
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LandingPage;
