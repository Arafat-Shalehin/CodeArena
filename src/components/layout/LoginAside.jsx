import AreanaLogo from "@/shared/components/ui/AreanaLogo";
import {
  BracesIcon,
  ChartNoAxesCombined,
  Code,
  Code2,
  FileBraces,
  KanbanIcon,
  KanbanSquare,
  Rocket,
  ServerCog,
  TrophyIcon,
  User,
} from "lucide-react";
import React, { useState } from "react";

const LoginAside = () => {
  return (
    <aside className="hidden lg:flex flex-col flex-1 bg-gradient-to-br from-[#02BA4C] via-[#029E40] to-[#016B2C] text-white py-10 px-4 relative overflow-hidden">
      {/* logo container */}
      <div className="shrink-0">
        <AreanaLogo />
      </div>
      {/* box  */}
      <div className="flex justify-center items-center py-8">
        <div className="relative bg-gradient-to-br w-3/2 from-[#02BA4C] via-[#029E40] to-[#016B2C] shadow-2xl w-3/4 rounded-2xl shadow-[--shadow-accent-glow] border border-white/20 transform -rotate-2 hover:rotate-0 transition-transform duration-500 ">
          {/* icons container */}
          <div className="grid grid-cols-3 px-10 gap-5 py-25 ">
            <Code
              size={50}
              className="text-[var(--color-success-light)]"
            ></Code>
            <FileBraces
              size={50}
              className="text-[var(--color-accent)]"
            ></FileBraces>
            <TrophyIcon
              size={50}
              className="text-[var(--color-success-light)]"
            ></TrophyIcon>
            <BracesIcon
              size={50}
              className="text-[var(--color-accent)]"
            ></BracesIcon>
            <ServerCog
              size={50}
              className="text-[var(--color-success-light)]"
            ></ServerCog>
            <Rocket size={50} className="text-[var(--color-accent)]"></Rocket>
          </div>
          <ChartNoAxesCombined
            className="absolute font font-extrabold right-[-25] bottom-[-25] rotate-[25deg] bg-green-700 p-5 shadow-2xl"
            size={100}
          ></ChartNoAxesCombined>
        </div>
      </div>
      {/* buttom content */}
      <div className="absolute bottom-5">
        <h2 className="font-sans text-3xl font-bold text-text-primary mb-3">
          Master the art of codding
        </h2>
        <p className="flex text-text-inverse  gap-2.5">
          <User className="bg-success-light text-text-secondary px-0.5 py-1 rounded-[10px]"></User>
          Join 5000+ programmers mastering their skills
        </p>
      </div>
    </aside>
  );
};

export default LoginAside;
