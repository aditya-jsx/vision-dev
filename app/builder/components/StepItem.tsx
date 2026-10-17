import { Step } from "@/app/lib/types";
import { Check, X } from "lucide-react";

export default function StepItem({ step }: { step: Step, index: number }){
    const badge = {
        pending: <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />,
        "in-progress": <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />,
        completed: <Check className="h-3 w-3" />,
        failed: <X className="h-3 w-3" />,
    }[step.status];

    const ring = {
        pending: "bg-white/[0.04] text-zinc-500",
        "in-progress": "bg-indigo-400/15 text-indigo-300",
        completed: "bg-emerald-400/15 text-emerald-300",
        failed: "bg-red-400/15 text-red-300",
    }[step.status];

    return (
        <div className="flex items-center gap-3 rounded-lg px-1 py-1">
            <span className={`grid h-5 w-5 flex-shrink-0 place-items-center rounded-full ${ring}`}>{badge}</span>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-200 truncate">{step.title}</p>
                {step.description && <p className="font-mono text-xs text-zinc-500 truncate">{step.description}</p>}
            </div>
        </div>
    );
};
