import Loader from "@/app/components/Loader";
import { Step } from "@/app/lib/types";
import StepItem from "./StepItem";

export default function AIChat({ steps, isLoading }: { steps: Step[], isLoading: boolean }) {
    return (
        <div className="h-full w-full text-white flex flex-col overflow-hidden  rounded-xl">
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            <div className="flex-1 w-full pt-2 overflow-y-auto no-scrollbar">
                {isLoading && steps.length === 0 && (
                    <div className="flex items-center justify-center p-4 text-zinc-400 h-full">
                        <Loader />
                        <span>Creating files....</span>
                    </div>
                )}
                {steps.length === 0 && !isLoading && (
                    <div className="text-center text-zinc-500 pt-8 px-2">No prompt found in storage. Please set a prompt to begin.</div>
                )}
                {steps.map((step, index) => (
                    <StepItem key={step.id} step={step} index={index} />
                ))}
                {isLoading && steps.length > 0 && (
                    <div className="flex items-center justify-center p-4 text-zinc-400">
                        <Loader />
                        <span>Generating next steps...</span>
                    </div>
                )}
            </div>
        </div>
    )
}