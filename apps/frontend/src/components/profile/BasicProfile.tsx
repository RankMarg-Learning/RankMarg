import React, { useMemo } from "react";
import Image from "next/image";
import { AtomIcon, Medal } from "lucide-react";

interface BasicProfileProps {
  basicProfile: {
    name: string;
    username: string;
    avatar: string;
    coins: number;
    createdAt: Date;
    isSelf: boolean;
  };
}

const BasicProfile: React.FC<BasicProfileProps> = ({ basicProfile }) => {
  const { name, username, avatar, coins, createdAt, isSelf } = basicProfile;

  const timeAgo = useMemo(() => {
    const now = new Date();
    const diffInMilliseconds = now.getTime() - new Date(createdAt).getTime();
    const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInYears > 0) return `Joined ${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
    if (diffInMonths > 0) return `Joined ${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
    if (diffInDays > 0) return `Joined ${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    if (diffInHours > 0) return `Joined ${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    if (diffInMinutes > 0) return `Joined ${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    return `Joined just now`;
  }, [createdAt]);

  return (
    <div className="p-3 w-full bg-white rounded-r-md border-r-2 border-b-2 md:rounded-none md:border-none">
      <div className="p-5 mb-5 h-[27.8px]">
        <span className="font-semibold">Basic Profile</span>
        {isSelf && (
          <button className="border-0 rounded-sm shadow-[0px_0px_0px_1px_inset_rgb(38_50_56_/_20%)] px-2 h-6 float-right cursor-pointer text-gray-700 bg-gray-50 text-xs">
            Edit Profile
          </button>
        )}
      </div>

      <hr />

      <div className="p-2">
        <div className="flex">
          <Image
            src={avatar || "/images/avatar.png"}
            width={80}
            height={80}
            alt="Profile"
            className="h-20 rounded-md"
          />

          <div className="flex flex-col ml-4 mr-1">
            <span className="font-semibold text-lg text-gray-700 whitespace-nowrap">
              {name || "Anonymous"}
            </span>
            <span className="text-xs rounded-md px-1 cursor-pointer">
              {`@${username}`}
            </span>
            <span className="mt-1 text-xs text-gray-500">{timeAgo}</span>
          </div>
        </div>
        <div className="flex mt-2">
          <div className="hidden items-center mx-2 gap-1">
            <Medal size={20} color="orange" />
            <span className="text-sm font-semibold text-gray-700">Topper</span>
          </div>
          <div className="flex items-center mx-2 gap-1">
            <AtomIcon size={20} color="orange" />
            <span className="text-sm font-semibold text-gray-700">{`${coins} points`}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicProfile;
