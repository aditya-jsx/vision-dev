// "use client"

// import { useEffect, useState } from "react";
// import AIChat from "./components/AIChat";
// import { BACKEND_URL } from "../config"
// import axios from "axios";
// import { Step } from "../lib/types";
// import { parseXml } from "../utils/parseXml";

// export default function Builder() {

//   const prompt = localStorage.getItem("prompt");
//   // const [prompts, uiPrompts] = useState();
//   const [steps, setSteps] = useState<Step[]>()

//   async function init(){
//     const response = await axios.post(`http://localhost:3000/api/skeleton`, {
//       prompt: prompt?.trim()
//     })
    
//     const { prompts, uiPrompts } = response?.data;

//     setSteps(parseXml(uiPrompts[0]).map((x: Step) => ({
//       ...x,
//       status: "pending"
//     })));

//     const stepsResponse = await axios.post(`http://localhost:3000/api/skeleton`, {
//       messages: [...prompts, prompt].map(content => ({
//         role: "user",
//         parts: [{text: content}]
//       }))
//     })

//     setSteps(s => [...s, ...parseXml(stepsResponse.data.response).map(x => ({
//       ...x,
//       status: "pending" as "pending"
//     }))]);
//   }

//   useEffect(()=>{
//     init();
//   }, [])

//   return (
//     <div className="h-screen w-full bg-zinc-950 flex flex-col items-center justify-center">

//        {/* Navbar */}
//        <div className="h-[7%] w-full border-b border-gray-700 flex items-center justify-end px-4">
//          <button
//           className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-600 transition-colors hover:cursor-pointer"
//         >

//         </button>
//       </div>

//       {/* Builder Area */}
//       <div className="h-[93%] w-full flex px-2 py-3 gap-2">

//         {/* Ai chat */}
//         <div className="h-full w-[30%] border border-gray-700 rounded-xl p-2">
//           <AIChat />
//         </div>

//         {/* Code And Preview */}
//         <div className="h-full w-[70%] flex border border-gray-700 rounded-xl overflow-hidden">
          
//         </div>

//       </div>

//     </div>
//   )
// }






































// "use client"

// import React, { useEffect, useState } from "react";
// import axios from "axios";

// // The BACKEND_URL is defined directly here.
// const BACKEND_URL = "http://localhost:3000";

// // --- Type Definitions ---
// // These types are now aligned with your actual parseXml function's output.
// const StepType = {
//     CreateFolder: 'CreateFolder',
//     CreateFile: 'CreateFile',
//     RunScript: 'RunScript',
// };

// type StepStatus = "pending" | "in-progress" | "completed" | "failed";

// interface AppStep {
//     id: number;
//     title: string;
//     description: string;
//     type: string; 
//     status: StepStatus;
//     code?: string;
//     path?: string;
// }


// // --- Helper Functions ---

// // This is your actual parseXml function, integrated directly into the component file.
// function parseXml(response: string): Omit<AppStep, 'status'>[] {
//     if (!response) return [];
 
//     // Extract the XML content between <visionArtifact> tags
//     const xmlMatch = response.match(/<visionArtifact[^>]*>([\s\S]*?)<\/visionArtifact>/);
    
//     if (!xmlMatch) {
//       return [];
//     }
 
//     const xmlContent = xmlMatch[1];
//     const steps: Omit<AppStep, 'status'>[] = [];
//     let stepId = 1;
 
//     // Extract artifact title
//     const titleMatch = response.match(/title="([^"]*)"/);
//     const artifactTitle = titleMatch ? titleMatch[1] : 'Project Files';
 
//     // Add initial artifact step
//     steps.push({
//       id: stepId++,
//       title: artifactTitle,
//       description: 'Project folder setup',
//       type: StepType.CreateFolder
//     });
 
//     // Regular expression to find visionAction elements
//     const actionRegex = /<visionAction\s+type="([^"]*)"(?:\s+filePath="([^"]*)")?>([\s\S]*?)<\/visionAction>/g;
    
//     let match;
//     while ((match = actionRegex.exec(xmlContent)) !== null) {
//       const [, type, filePath, content] = match;
 
//       if (type === 'file') {
//         // File creation step
//         steps.push({
//           id: stepId++,
//           title: `Create ${filePath || 'file'}`,
//           description: filePath || 'A new file will be created.',
//           type: StepType.CreateFile,
//           code: content.trim(),
//           path: filePath
//         });
//       } else if (type === 'shell') {
//         // Shell command step
//         steps.push({
//           id: stepId++,
//           title: 'Run command',
//           description: `Execute: ${content.trim()}`,
//           type: StepType.RunScript,
//           code: content.trim()
//         });
//       }
//     }
 
//     return steps;
// }


// // --- Sub-Components ---

// const LoadingSpinner = () => (
//     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//     </svg>
// );

// // Updated to display `title` and `description` from the new AppStep type.
// const StepItem = ({ step, index }: { step: AppStep, index: number }) => {
//     const statusStyles = {
//         pending: "bg-zinc-800 border-zinc-700",
//         "in-progress": "bg-blue-900/50 border-blue-700 animate-pulse",
//         completed: "bg-green-900/50 border-green-700",
//         failed: "bg-red-900/50 border-red-700",
//     };

//     return (
//         <div className={`p-3 rounded-lg border ${statusStyles[step.status]} transition-all duration-300`}>
//             <div className="flex items-center">
//                 <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 text-xs font-mono flex-shrink-0 ${statusStyles[step.status]}`}>
//                     {index + 1}
//                 </div>
//                 <div className="flex-1">
//                     <p className="font-semibold text-white truncate">{step.title}</p>
//                     <p className="text-sm text-zinc-400 truncate">{step.description}</p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// function AIChat({ steps, isLoading }: { steps: AppStep[], isLoading: boolean }) {
//     return (
//         <div className="h-full w-full text-white flex flex-col overflow-hidden bg-zinc-900 rounded-xl">
//             <style>{`
//                 .no-scrollbar::-webkit-scrollbar { display: none; }
//                 .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
//             `}</style>

//             <div className="w-full text-white p-3 border-b border-zinc-700 flex-shrink-0">
//                 <h3 className="font-semibold text-lg">Generation Steps</h3>
//             </div>

//             <div className="flex-1 w-full p-2 overflow-y-auto no-scrollbar space-y-2">
//                 {isLoading && steps.length === 0 && (
//                     <div className="flex items-center justify-center p-4 text-zinc-400 h-full">
//                         <LoadingSpinner />
//                         <span>Generating initial plan...</span>
//                     </div>
//                 )}
//                 {steps.length === 0 && !isLoading && (
//                     <div className="text-center text-zinc-500 pt-8 px-2">Enter a prompt and click Generate to see the steps here.</div>
//                 )}
//                 {steps.map((step, index) => (
//                     <StepItem key={step.id} step={step} index={index} />
//                 ))}
//                  {isLoading && steps.length > 0 && (
//                     <div className="flex items-center justify-center p-4 text-zinc-400">
//                         <LoadingSpinner />
//                         <span>Generating next steps...</span>
//                     </div>
//                 )}
//             </div>
//         </div>
//     )
// }

// // --- Main Builder Component ---

// export default function Builder() {
//     const [steps, setSteps] = useState<AppStep[]>([]);
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);
//     const [prompt, setPrompt] = useState("");

//     useEffect(() => {
//       // if (savedPrompt) {
//         //   setPrompt(savedPrompt);
//         // }

//       init();
//       }, []);
      
//       async function init(){
//         const prompt = localStorage.getItem("prompt");
//         // localStorage.setItem("prompt", prompt);

//         if (!prompt || prompt.trim() === "") {
//             setError("Please enter a prompt to begin.");
//             return;
//         }

//         setIsLoading(true);
//         setError(null);
//         setSteps([]); 

//         try {
//             // --- First API Call for Skeleton ---
//             const skeletonResponse = await axios.post(`${BACKEND_URL}/api/skeleton`, {
//                 prompt: prompt.trim()
//             });

//             const { prompts, uiPrompt } = skeletonResponse.data;

//             if (!prompts || !uiPrompt || !uiPrompt[0]) {
//                 throw new Error("Invalid response from skeleton API.");
//             }

//             const initialSteps = parseXml(uiPrompt[0]).map((x) => ({
//                 ...x,
//                 status: "pending" as StepStatus
//             }));
//             setSteps(initialSteps);

//             // --- Second API Call for Detailed Steps ---
//             const messages = [...prompts, prompt].map(content => ({
//                 role: "user",
//                 parts: [{ text: content }]
//             }));

//             const stepsResponse = await axios.post(`${BACKEND_URL}/api/skeleton`, {
//                 messages
//             });
            
//             // **FIXED**: Accessing `output` instead of `response`.
//             const detailedStepsXml = stepsResponse.data.output;
//             if (!detailedStepsXml) {
//                  throw new Error("Invalid response from detailed steps API.");
//             }

//             const detailedSteps = parseXml(detailedStepsXml).map(x => ({
//                 ...x,
//                 status: "pending" as StepStatus
//             }));

//             setSteps(currentSteps => [...currentSteps, ...detailedSteps]);

//         } catch (err: any) {
//             console.error("Failed to initialize builder:", err);
//             setError(err.message || "An error occurred while generating the steps. Please try again.");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <div className="h-screen w-full bg-zinc-950 flex flex-col items-center justify-center">
//             <div className="h-[7%] w-full border-b border-gray-700 flex items-center justify-end px-4 flex-shrink-0">
//                 <button className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-600 transition-colors">
//                     Export Code
//                 </button>
//             </div>

//             <div className="h-[93%] w-full flex px-2 py-3 gap-2">
//                 <div className="h-full w-[30%]">
//                     <AIChat steps={steps} isLoading={isLoading} />
//                 </div>

//             </div>
//         </div>
//     );
// }


















// --------------------------------------------------------------------------------------------------------------------------------------------------

// --- Type Definitions ---
// Types are now defined locally to resolve import errors.
// const StepType = {
//     CreateFolder: 'CreateFolder',
//     CreateFile: 'CreateFile',
//     RunScript: 'RunScript',
// };

// type StepStatus = "pending" | "in-progress" | "completed" | "failed";

// interface AppStep {
//     id: number;
//     title: string;
//     description: string;
//     type: string;
//     status: StepStatus;
//     code?: string;
//     path?: string;
// }

// --- Helper Functions ---
// The parseXml function is now included in this file.
// function parseXml(response: string): AppStep[] {
//     if (!response) return [];

//     const xmlMatch = response.match(/<visionArtifact[^>]*>([\s\S]*?)<\/visionArtifact>/);
//     if (!xmlMatch) {
//         return [];
//     }

//     const xmlContent = xmlMatch[1];
//     const steps: AppStep[] = [];
//     let stepId = 1;

//     const titleMatch = response.match(/title="([^"]*)"/);
//     const artifactTitle = titleMatch ? titleMatch[1] : 'Project Files';

//     steps.push({
//         id: stepId++,
//         title: artifactTitle,
//         description: 'Project folder setup',
//         type: StepType.CreateFolder,
//         status: 'pending'
//     });

//     const actionRegex = /<visionAction\s+type="([^"]*)"(?:\s+filePath="([^"]*)")?>([\s\S]*?)<\/visionAction>/g;
//     let match;
//     while ((match = actionRegex.exec(xmlContent)) !== null) {
//         const [, type, filePath, content] = match;

//         if (type === 'file') {
//             steps.push({
//                 id: stepId++,
//                 title: `Create ${filePath || 'file'}`,
//                 description: filePath || 'A new file will be created.',
//                 type: StepType.CreateFile,
//                 code: content.trim(),
//                 path: filePath,
//                 status: 'pending'
//             });
//         } else if (type === 'shell') {
//             steps.push({
//                 id: stepId++,
//                 title: 'Run command',
//                 description: `Execute: ${content.trim()}`,
//                 type: StepType.RunScript,
//                 code: content.trim(),
//                 status: 'pending'
//             });
//         }
//     }
//     return steps;
// }


// --- Sub-Components ---

// const LoadingSpinner = () => (
//     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//     </svg>
// );

// const StepItem = ({ step, index }: { step: AppStep, index: number }) => {
//     const statusStyles = {
//         pending: "bg-zinc-800 border-zinc-700",
//         "in-progress": "bg-blue-900/50 border-blue-700 animate-pulse",
//         completed: "bg-green-900/50 border-green-700",
//         failed: "bg-red-900/50 border-red-700",
//     };

//     return (
//         <div className={`p-3 rounded-lg border ${statusStyles[step.status]} transition-all duration-300`}>
//             <div className="flex items-center">
//                 <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 text-xs font-mono flex-shrink-0 ${statusStyles[step.status]}`}>
//                     {index + 1}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                     <p className="font-semibold text-white truncate">{step.title}</p>
//                     <p className="text-sm text-zinc-400 truncate">{step.description}</p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// function AIChat({ steps, isLoading }: { steps: AppStep[], isLoading: boolean }) {
//     return (
//         <div className="h-full w-full text-white flex flex-col overflow-hidden bg-zinc-900 rounded-xl">
//             <style>{`
//                 .no-scrollbar::-webkit-scrollbar { display: none; }
//                 .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
//             `}</style>

//             <div className="w-full text-white p-3 border-b border-zinc-700 flex-shrink-0">
//                 <h3 className="font-semibold text-lg">Generation Steps</h3>
//             </div>

//             <div className="flex-1 w-full p-2 overflow-y-auto no-scrollbar space-y-2">
//                 {isLoading && steps.length === 0 && (
//                     <div className="flex items-center justify-center p-4 text-zinc-400 h-full">
//                         <Loader />
//                         <span>Generating initial plan...</span>
//                     </div>
//                 )}
//                 {steps.length === 0 && !isLoading && (
//                     <div className="text-center text-zinc-500 pt-8 px-2">No prompt found in storage. Please set a prompt to begin.</div>
//                 )}
//                 {steps.map((step, index) => (
//                     <StepItem key={step.id} step={step} index={index} />
//                 ))}
//                 {isLoading && steps.length > 0 && (
//                     <div className="flex items-center justify-center p-4 text-zinc-400">
//                         <Loader />
//                         <span>Generating next steps...</span>
//                     </div>
//                 )}
//             </div>
//         </div>
//     )
// }



// --------------------------------------------------------------------------------------------------------------------------------------------------
















"use client"

import React, { useEffect, useState } from "react";
import axios from "axios";
import { parseXml } from "../utils/parseXml";
import { AppStep } from "../lib/types";
import AIChat from "./components/AIChat";
// import Loader from "../components/Loader";
// import StepItem from "./components/StepItem";

const BACKEND_URL = "http://localhost:3000";

export default function Builder() {
    const [steps, setSteps] = useState<AppStep[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        init();
    }, []);

    async function init() {
        const prompt = localStorage.getItem("prompt");

        if (!prompt || prompt.trim() === "") {
            setError("No prompt found in local storage. Cannot initialize.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSteps([]);

        try {
            const skeletonResponse = await axios.post(`${BACKEND_URL}/api/skeleton`, {
                prompt: prompt.trim()
            });

            const { prompts, uiPrompt } = skeletonResponse.data;

            if (!prompts || !uiPrompt || !uiPrompt[0]) {
                throw new Error("Invalid response from skeleton API.");
            }
            
            const initialSteps = parseXml(uiPrompt[0]);
            setSteps(initialSteps);

            const messages = [...prompts, prompt].map(content => ({
                role: "user",
                parts: [{ text: content }]
            }));
            
            console.log("Sending payload for detailed steps:", { messages });

            const stepsResponse = await axios.post(`${BACKEND_URL}/api/skeleton`, {
                messages
            });

            const detailedStepsXml = stepsResponse.data.output;
            if (!detailedStepsXml) {
                throw new Error("Invalid response from detailed steps API.");
            }

            const detailedSteps = parseXml(detailedStepsXml);

            // console.log(detailedSteps);

            setSteps(currentSteps => [...currentSteps, ...detailedSteps]);

        } catch (err: any) {
            console.error("Failed to initialize builder:", err);
            if (axios.isAxiosError(err) && err.response) {
                 setError(`Request failed: Server responded with status ${err.response.status}. Check the backend logs.`);
            } else {
                 setError(err.message || "An error occurred while generating steps.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen w-full bg-zinc-950 flex flex-col items-center justify-center">
            {/* Navbar */}
            <div className="h-[7%] w-full border-b border-gray-700 flex items-center justify-end px-4">
                <button
                    className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-600 hover:cursor-pointer transition-all duration-500"
                >
                    Preview
                </button>
            </div>

            {/* Builder Area */}
            <div className="h-[93%] w-full flex px-2 py-3 gap-2">
                {/* Ai chat */}
                <div className="h-full w-[30%] border border-gray-700 rounded-xl">
                    <AIChat steps={steps} isLoading={isLoading} />
                </div>

                {/* Code And Preview */}
                <div className="h-full w-[70%] flex flex-col items-center justify-center border border-gray-700 rounded-xl overflow-hidden p-4">
                     
                </div>
            </div>
        </div>
    );
}

