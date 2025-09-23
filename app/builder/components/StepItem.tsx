import { AppStep } from "@/app/lib/types";

export default function StepItem({ step, index }: { step: AppStep, index: number }){
    const statusStyles = {
        pending: "text-slate-500 border-zinc-700",
        "in-progress": "text-blue-900/50 border-blue-700 animate-pulse",
        completed: "text-green-900/50 border-green-700",
        failed: "font-red-900/50 border-red-700",
    };

    return (
        <div className={`p-[2px] ${statusStyles[step.status]} transition-all duration-300`}>
            <div className="flex items-center">
                <div className={`flex items-center justify-center pl-3 text-xs font-mono flex-shrink-0 ${statusStyles[step.status]}`}>
                    {/* {index + 1} */}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{step.title}</p>
                    <p className="text-sm text-zinc-400 truncate">{step.description}</p>
                </div>
            </div>
        </div>
    );
};