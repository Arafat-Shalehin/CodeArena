import Link from "next/link";
import React from "react";

const AreanaLogo = () => {
  return (
    <Link href="/" className="flex items-center gap-2 group shrink-0">
      <div className="size-8 group-hover:scale-110 transition-transform">
        <img src="/logo.svg" alt="CodeArena Logo" className="w-full h-full" />
      </div>
      <span className="font-sans font-bold text-xl tracking-tight text-text-primary group-hover:text-accent transition-colors">
        CodeArena
      </span>
    </Link>
  );
};

export default AreanaLogo;
