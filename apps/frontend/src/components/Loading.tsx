import React, { useState, useEffect } from "react";
import { TestTube, Binary, DraftingCompass, Cog } from "lucide-react"; // Import the icons

const Loading = () => {
  const [iconIndex, setIconIndex] = useState(0);
  const icons = [
    <TestTube className="w-12 h-12 text-blue-600 animate-spin" />,
    <Binary className="w-12 h-12 text-green-600 animate-spin" />,
    <DraftingCompass className="w-12 h-12 text-purple-600 animate-spin" />,
    <Cog className="w-12 h-12 text-red-600 animate-spin" />,
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIconIndex((prevIndex) => (prevIndex + 1) % icons.length); 
    }, 500); 

    return () => clearInterval(interval); 
  }, [icons.length]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 opacity-50">
      <div className="relative">
        <div className="mb-4">{icons[iconIndex]}</div> 
      </div>
    </div>
  );
};

export default Loading;
