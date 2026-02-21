import AreanaLogo from "@/shared/components/ui/AreanaLogo";
import Image from "next/image";

export default function RegisterAside() {
  return (
    <aside className="hidden lg:flex flex-1 bg-gradient-to-br from-[#02BA4C] via-[#029E40] to-[#016B2C] text-white py-10 px-4 relative overflow-hidden">
      {/* Decorative background overlay (Optional but adds depth) */}
      <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>

      <div className="z-10 flex flex-col justify-between w-full h-full">
        {/* Arena Logo */}
        <div className="shrink-0">
          <AreanaLogo />
        </div>

        {/* Content Section (Center) */}
        <div className="flex flex-col items-center justify-center flex-grow py-8 text-center">
          <div className="relative w-full flex justify-center mb-8">
            <Image
              className="w-3/4 rounded-2xl shadow-accent-glow border border-white/20 transform -rotate-2 hover:rotate-0 transition-transform duration-500"
              src="/registerAsideImage.png"
              alt="Register Illustration"
              width={400} // width এবং height প্রপারলি দিন যাতে Aspect Ratio ঠিক থাকে
              height={300}
              priority
            />
          </div>

          <div className="max-w-md">
            <h1 className="text-3xl xl:text-4xl font-extrabold leading-tight mb-4 font-display">
              Join the Elite <br /> Developer Community
            </h1>
            <p className="text-base xl:text-lg opacity-80 font-mono leading-relaxed">
              Level up your skills, compete in global challenges, and build your
              professional portfolio with CodeArena.
            </p>
          </div>
        </div>

        {/* Stats Section (Bottom) */}
        <div className="grid grid-cols-3 gap-4 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
          <div className="text-center">
            <p className="text-2xl xl:text-3xl font-bold">50k+</p>
            <p className="uppercase tracking-widest text-[9px] font-bold opacity-70">
              Active Users
            </p>
          </div>
          <div className="text-center border-x border-white/10">
            <p className="text-2xl xl:text-3xl font-bold">2.5k+</p>
            <p className="uppercase tracking-widest text-[9px] font-bold opacity-70">
              Problems
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl xl:text-3xl font-bold">300+</p>
            <p className="uppercase tracking-widest text-[9px] font-bold opacity-70">
              Contests
            </p>
          </div>
        </div>
      </div>

      {/* Background Decorative Blur Circles */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
    </aside>
  );
}
