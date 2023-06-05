"use client";

import React, { useState } from "react";
import Image from "next/image";

const page = () => {
    const [open, setOpen] = useState(false);

    return (
        <main className="relative">
            <div
                className={`relative w-screen h-screen z-20 flex justify-center items-center bg-[url('/first/bg.jpg')] bg-cover ${
                    open ? "-translate-y-[40vh]" : ""
                } transition duration-500 ease-in-out`}
            ></div>
            <button
                className={`absolute z-30 bottom-[30px] left-2/4 -translate-x-1/2 p-4 rounded-full w-20 h-20 ${open ? "bg-blue-200" : "bg-orange-200"}`}
                onClick={() => {
                    setOpen((prevstate) => !prevstate);
                }}
            >
                {open ? "Close" : "Open"}
            </button>
            <nav className={`absolute bottom-[140px] w-full z-10 transition duration-500 ${open ? "" : "translate-y-[100px] scale-90"}`}>
                <div className="flex justify-evenly overflow-auto ">
                    <div className=" w-[19vw] relative aspect-video hover:scale-105 hover:cursor-pointer transition bg-cover">
                        <Image src={"/first/1.jpeg"} alt="first" fill />
                    </div>

                    <div className=" w-[19vw] relative aspect-video hover:scale-105 hover:cursor-pointer transition bg-cover">
                        <Image src={"/first/2.jpeg"} alt="first" fill />
                    </div>
                    <div className=" w-[19vw] relative aspect-video hover:scale-105 hover:cursor-pointer transition bg-cover">
                        <Image src={"/first/3.jpeg"} alt="first" fill />
                    </div>
                    <div className=" w-[19vw] relative aspect-video hover:scale-105 hover:cursor-pointer transition bg-cover">
                        <Image src={"/first/4.jpeg"} alt="first" fill />
                    </div>
                    <div className=" w-[19vw] relative aspect-video hover:scale-105 hover:cursor-pointer transition bg-cover">
                        <Image src={"/first/5.jpeg"} alt="first" fill />
                    </div>
                </div>
            </nav>
        </main>
    );
};

export default page;
