// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useSession, signOut } from "next-auth/react";
// import AuthModal from "./components/AuthModal";

// export default function Home() {
//   const [prompt, setPrompt] = useState("");
//   const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
//   const router = useRouter();
//   const { data: session, status } = useSession();

//   const handleGenerate = () => {
//     if (status === "unauthenticated") {
//       setIsAuthModalOpen(true);
//       return;
//     }

//     localStorage.setItem("prompt", prompt);
//     if (prompt.trim()) {
//       router.push(`/builder`);
//     }
//   };

//   return (
//     <div className="min-h-screen relative overflow-hidden">
//       <AuthModal 
//         isOpen={isAuthModalOpen} 
//         onClose={() => setIsAuthModalOpen(false)} 
//       />

//       <div className="min-h-screen w-full relative bg-black">
//         {/* Background Gradients */}
//         <div
//           className="absolute inset-0 z-0"
//           style={{
//             background:
//               "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(120, 180, 255, 0.25), transparent 70%), #000000",
//           }}
//         />

//         {/* Navigation */}
//         <nav className="relative z-10 p-6">
//           <div className="max-w-7xl mx-auto flex items-center justify-between">
//             <div className="flex items-center space-x-2">
//               <span className="text-2xl font-bold bg-gradient-to-r from-[#354a64] to-[#8191a9] bg-clip-text text-transparent">
//                 Vision
//               </span>
//             </div>
//             <div className="hidden md:flex items-center space-x-8">
//               <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
//               <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
              
//               {status === "authenticated" ? (
//                 <div className="flex items-center gap-4">
//                   <span className="text-zinc-400 text-sm">Hi, {session?.user?.name?.split(' ')[0]}</span>
//                   <button 
//                     onClick={() => signOut()}
//                     className="border-[#354a64] text-[#354a64] hover:bg-[#020b17] hover:border-white hover:text-white bg-white rounded-lg p-2 px-4 transition-all duration-500 ease-in-out"
//                   >
//                     Sign Out
//                   </button>
//                 </div>
//               ) : (
//                 <button 
//                   onClick={() => setIsAuthModalOpen(true)}
//                   className="border-[#354a64] text-[#354a64] hover:bg-[#020b17] hover:border-white hover:text-white bg-white rounded-lg p-2 px-4 hover:cursor-pointer transition-all duration-500 ease-in-out"
//                 >
//                   Sign In
//                 </button>
//               )}
//             </div>
//           </div>
//         </nav>

//         {/* Hero Section */}
//         <main className="relative z-10 mt-20">
//           <div className="max-w-7xl mx-auto px-6 text-center">
//             <div className="max-w-4xl mx-auto flex flex-col items-center">
//               <h1 className="max-w-3xl text-6xl md:text-7xl lg:text-7xl font-bold mb-2 bg-gradient-to-r from-white via-[#587190] to-[#1f2c3c83] bg-clip-text text-transparent leading-tight">
//                 Generate Web Apps with Vision
//               </h1>
//               <div className="max-w-xl">
//                 <p className="text-xl md:text-2xl lg:text-lg text-gray-300 mb-12 leading-relaxed">
//                   Transform your ideas into production-ready code instantly.
//                   Describe what you want to build, and watch Vision create it
//                   for you.
//                 </p>
//               </div>

//               {/* Prompt Section */}
//               <div className="w-full mx-auto mb-16 flex flex-col items-center">
//                 <div className="relative lg:w-[43rem]">
//                   <div className="absolute inset-0 bg-gradient-to-r from-white via-[#354a64] to-[#354a6483] rounded-2xl blur opacity-20"></div>
//                   <div className="flex items-center space-x-4">
//                     <input
//                       onChange={(e) => setPrompt(e.target.value)}
//                       placeholder="Eg: Create a todo app with React and TypeScript"
//                       className="flex-1 border-none text-white placeholder-gray-400 text-lg bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl py-4 px-4"
//                     />
//                     <button
//                       onClick={handleGenerate}
//                       className="bg-[#020b17] absolute right-8 border-black border hover:cursor-pointer hover:bg-white hover:text-[#020b17] text-white px-4 py-2 rounded-xl font-semibold transition-all duration-200"
//                     >
//                       Generate
//                     </button>
//                   </div>
//                 </div>
//                 <p className="text-sm text-gray-400 mt-4">
//                   ✨ AI will analyze your request and generate complete,
//                   production-ready code
//                 </p>
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }





















// added project creation throught dashboard

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AuthModal from "./components/AuthModal";
import Link from "next/link";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  const handleGenerate = () => {
    if (status === "unauthenticated") {
      setIsAuthModalOpen(true);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      <div className="min-h-screen w-full relative bg-black">
        {/* Background Gradients */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(120, 180, 255, 0.25), transparent 70%), #000000",
          }}
        />

        {/* Navigation */}
        <nav className="relative z-10 p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-[#354a64] to-[#8191a9] bg-clip-text text-transparent">
                Vision
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
              
              {status === "authenticated" ? (
                <div className="flex items-center gap-4">
                  <Link 
                    href="/dashboard"
                    className="text-zinc-300 hover:text-white transition-colors"
                  >
                    Dashboard
                  </Link>
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                    {session?.user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="border-[#354a64] text-[#354a64] hover:bg-[#020b17] hover:border-white hover:text-white bg-white rounded-lg p-2 px-4 hover:cursor-pointer transition-all duration-500 ease-in-out"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="relative z-10 mt-20">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="max-w-4xl mx-auto flex flex-col items-center">
              <h1 className="max-w-3xl text-6xl md:text-7xl lg:text-7xl font-bold mb-2 bg-gradient-to-r from-white via-[#587190] to-[#1f2c3c83] bg-clip-text text-transparent leading-tight">
                Generate Web Apps with Vision
              </h1>
              <div className="max-w-xl">
                <p className="text-xl md:text-2xl lg:text-lg text-gray-300 mb-12 leading-relaxed">
                  Transform your ideas into production-ready code instantly.
                  Describe what you want to build, and watch Vision create it
                  for you.
                </p>
              </div>

              {/* Prompt Section */}
              <div className="w-full mx-auto mb-16 flex flex-col items-center">
                <div className="relative lg:w-[43rem]">
                  <div className="absolute inset-0 bg-gradient-to-r from-white via-[#354a64] to-[#354a6483] rounded-2xl blur opacity-20"></div>
                  <div className="flex items-center space-x-4">
                    <input
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Eg: Create a todo app with React and TypeScript"
                      className="flex-1 border-none text-white placeholder-gray-400 text-lg bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl py-4 px-4"
                    />
                    <button
                      onClick={handleGenerate}
                      className="bg-[#020b17] absolute right-8 border-black border hover:cursor-pointer hover:bg-white hover:text-[#020b17] text-white px-4 py-2 rounded-xl font-semibold transition-all duration-200"
                    >
                      Generate
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-4">
                  ✨ AI will analyze your request and generate complete,
                  production-ready code
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}