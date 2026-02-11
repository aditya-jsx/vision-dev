import { Step } from "@/app/lib/types";

export default function StepItem({ step, index }: { step: Step, index: number }){
    const statusStyles = {
        pending: "text-slate-500",
        "in-progress": "text-blue-400 animate-pulse",
        completed: "text-green-400",
        failed: "text-red-400",
    };

    const SvgDot = ({ className }: { className: string }) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`flex-shrink-0 ${className}`}>
            <circle cx="12" cy="12" r="4" fill="currentColor"/>
        </svg>
    );


    return (
        <div className={`transition-all duration-300 ${statusStyles[step.status]}`}>
            <div className="flex items-center">
                <div className={`flex items-center justify-center pl-0 text-xs font-mono flex-shrink-0 ${statusStyles[step.status]}`}>
                    <SvgDot className={statusStyles[step.status]} />
                </div>
                <div className="flex-1 min-w-0 ml-2">
                    <p className="font-semibold text-zinc-200 truncate">{step.title}</p>
                    <p className="text-sm text-zinc-400 truncate">{step.description}</p>
                </div>
            </div>
        </div>
    );
};