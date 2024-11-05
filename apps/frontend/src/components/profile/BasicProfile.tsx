import { AtomIcon, Medal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function BasicProfile() {
  return (
    <div className="  p-3 w-full bg-white   rounded-r-md border-r-2 border-b-2 md:rounded-none md:border-none">
      <div className="p-5 mb-5 h-[27.8px]">
        <span className="font-semibold">Basic Profile</span>
        <button className="border-0 rounded-sm shadow-[0px_0px_0px_1px_inset_rgb(38_50_56_/_20%)] px-2 h-6 float-right cursor-pointer text-gray-700 bg-gray-50 text-xs">
          Edit Profile
        </button>
      </div>

      <hr />

      <div className="p-2">
        <div className="flex">
          <Image
            src={"/Profile_image.png"}
            width={80}
            height={80}
            alt="Profile"
            className="h-20 rounded-md"
          />

          <div className="flex flex-col ml-4 mr-1">
            <span className="font-semibold text-lg text-gray-700 whitespace-nowrap">
              Aniket Sudke
            </span>
            <span
              
              className="text-xs rounded-md px-1 cursor-pointer bg-[#f2f3f4]"
            >
              @robbin_johnson
            </span>
            <span className="mt-1 text-xs text-gray-500">Joined 2 years ago</span>
            
          </div>
        </div>
        <div className="flex   mt-2 ">
            
            <div className="hidden  items-center mx-2 gap-1">
              <Medal size={20} color="orange" />
              <span className="text-sm font-semibold text-gray-700">Topper</span>
            </div>
           <div className="flex   items-center mx-2 gap-1">
              <AtomIcon size={20} color="orange" />
              <span className="text-sm font-semibold text-gray-700">10 points</span>
            </div>

           
        </div>
      </div>
    </div>
  );
}
