"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Box,
  Check,
  Code2,
  Database,
  Download,
  Eye,
  File,
  FolderTree,
  GitBranch,
  History,
  ImageIcon,
  Layers,
  Lock,
  MessageSquare,
  MousePointerClick,
  Rocket,
  Sparkles,
  Terminal,
  Users,
  Wand2,
  Workflow,
  Zap,
} from "lucide-react";
import AuthModal from "./components/AuthModal";

const SUGGESTIONS = [
  "A kanban board with drag & drop",
  "Expense tracker with charts",
  "REST API with Express and JWT auth",
  "Portfolio site with dark mode",
];

const STEPS = [
  {
    label: "Describe",
    title: "Say it in plain English.",
    body: "Type what you want to build. Vision classifies your idea, picks the right stack (React or Node) and drafts a project skeleton in seconds.",
  },
  {
    label: "Plan",
    title: "Watch the plan unfold.",
    body: "The AI breaks your idea into concrete steps — files to create, folders to scaffold and commands to run — so you always know what it's doing.",
  },
  {
    label: "Build",
    title: "Real code, real runtime.",
    body: "Every file is written into a full Node.js environment running inside your browser. Edit in a Monaco-powered IDE with autosave and a live terminal.",
  },
  {
    label: "Ship",
    title: "Preview, iterate, export.",
    body: "See the running app instantly, ask for changes in chat, then export a clean, Prettier-formatted ZIP that's ready for any repo.",
  },
];

const CAPABILITIES = [
  { icon: Sparkles, title: "Prompt to full-stack app", body: "One sentence becomes a complete, runnable project with structure, styling and logic.", span: "md:col-span-2" },
  { icon: Box, title: "In-browser runtime", body: "WebContainers boot Node.js right in your tab. No servers, no setup.", span: "" },
  { icon: Code2, title: "Pro code editor", body: "Monaco with TypeScript intellisense, formatting and debounced autosave.", span: "" },
  { icon: Eye, title: "Live preview", body: "Your app runs the moment files land. Reload, tweak, repeat.", span: "" },
  { icon: Terminal, title: "Integrated terminal", body: "A real shell for npm installs, scripts and dev servers.", span: "" },
  { icon: MessageSquare, title: "Iterate by chat", body: "Ask for a feature, a fix or a redesign. Vision keeps the whole conversation in context.", span: "md:col-span-2" },
  { icon: Layers, title: "React & Node stacks", body: "Frontend apps or backend APIs — the right template, every time.", span: "" },
  { icon: Download, title: "One-click export", body: "Download a formatted ZIP and own every line.", span: "" },
  { icon: Lock, title: "Projects & auth", body: "Sign in with Google or GitHub and keep your projects in one place.", span: "" },
];

const BUILDS = [
  "SaaS dashboard", "Kanban board", "Portfolio site", "REST API", "Chat UI", "Landing page",
  "Weather app", "Blog engine", "Expense tracker", "Pomodoro timer", "Markdown editor", "Todo app",
];

const ROADMAP = [
  { icon: Database, tag: "Foundation", title: "Persistent projects", body: "Save every generated file and the full chat history to the database, so reopening a project restores it instantly instead of regenerating it." },
  { icon: Zap, tag: "Foundation", title: "Real-time streaming", body: "Stream tokens to the client as they're generated. Files appear and fill in live, so the first result shows up in seconds." },
  { icon: Wand2, tag: "Foundation", title: "Self-healing builds", body: "Catch install, compile and runtime errors from the terminal and preview, send them back to the AI and apply the fix automatically." },
  { icon: Rocket, tag: "Ship", title: "One-click deploy & share", body: "Deploy to a live URL with real server backends, and share a link anyone can open — no WebContainer browser limits." },
  { icon: Workflow, tag: "Intelligence", title: "Multi-model engine", body: "Choose between Gemini and Claude, fall back automatically when one fails, or compare outputs side by side." },
  { icon: History, tag: "Ship", title: "Version history & checkpoints", body: "Every AI change becomes a checkpoint. Diff, restore or branch from any point without fear of breaking things." },
  { icon: GitBranch, tag: "Ship", title: "GitHub sync", body: "Push projects to a new or existing repo and keep pulling changes in both directions." },
  { icon: MousePointerClick, tag: "Intelligence", title: "Visual editing", body: "Click any element in the preview and describe the change — Vision edits exactly that component." },
  { icon: ImageIcon, tag: "Intelligence", title: "Screenshot & Figma to app", body: "Drop in a screenshot or a design and get a pixel-close, working implementation." },
  { icon: Users, tag: "Scale", title: "Teams & collaboration", body: "Shared workspaces, live cursors, comments and usage-based plans for teams." },
];

const TAG_COLORS: Record<string, string> = {
  Foundation: "text-cyan-300 bg-cyan-400/10 ring-cyan-400/20",
  Ship: "text-emerald-300 bg-emerald-400/10 ring-emerald-400/20",
  Intelligence: "text-violet-300 bg-violet-400/10 ring-violet-400/20",
  Scale: "text-amber-300 bg-amber-400/10 ring-amber-400/20",
};

function Logo() {
  return (
    <span className="flex items-center gap-2">
      <span className="relative grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-indigo-400 to-cyan-300 shadow-[0_0_24px_-4px_rgba(99,102,241,0.8)]">
        <Eye className="h-4 w-4 text-[#05060a]" strokeWidth={2.5} />
      </span>
      <span className="text-lg font-semibold tracking-tight text-white">Vision</span>
    </span>
  );
}

function WindowChrome({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d14]/90 shadow-2xl shadow-indigo-950/40 backdrop-blur-xl ${className}`}>
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-white/10" />
        <span className="h-3 w-3 rounded-full bg-white/10" />
        <span className="h-3 w-3 rounded-full bg-white/10" />
        <span className="ml-3 truncate font-mono text-xs text-zinc-500">{title}</span>
      </div>
      {children}
    </div>
  );
}

function StepVisual({ index }: { index: number }) {
  const panels = [
    <div key="describe" className="space-y-4 p-6">
      <p className="text-xs uppercase tracking-widest text-zinc-500">Your prompt</p>
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 font-mono text-sm text-zinc-200">
        <span className="caret">Build a habit tracker with streaks and a weekly chart</span>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-indigo-400/10 px-3 py-1 text-indigo-300 ring-1 ring-indigo-400/20">Stack: React + Vite</span>
        <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-cyan-300 ring-1 ring-cyan-400/20">Template ready</span>
      </div>
    </div>,
    <div key="plan" className="space-y-3 p-6">
      {["Create package.json", "Scaffold src/components", "Write HabitCard.tsx", "Write WeeklyChart.tsx", "Run npm install"].map((s, i) => (
        <div key={s} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5 text-sm" style={{ animation: `float 6s ease-in-out ${i * 0.3}s infinite` }}>
          <span className={`grid h-5 w-5 place-items-center rounded-full ${i < 3 ? "bg-emerald-400/15 text-emerald-300" : i === 3 ? "bg-indigo-400/15 text-indigo-300" : "bg-white/5 text-zinc-500"}`}>
            {i < 3 ? <Check className="h-3 w-3" /> : <span className={`h-1.5 w-1.5 rounded-full bg-current ${i === 3 ? "animate-pulse" : ""}`} />}
          </span>
          <span className={i < 4 ? "text-zinc-200" : "text-zinc-500"}>{s}</span>
        </div>
      ))}
    </div>,
    <div key="build" className="grid grid-cols-[140px_1fr] text-sm">
      <div className="space-y-1.5 border-r border-white/5 p-4 text-zinc-400">
        <p className="flex items-center gap-2"><FolderTree className="h-3.5 w-3.5 text-indigo-300" /> src</p>
        <p className="flex items-center gap-2 pl-4"><File className="h-3.5 w-3.5" /> App.tsx</p>
        <p className="flex items-center gap-2 rounded bg-white/5 pl-4 text-white"><File className="h-3.5 w-3.5" /> Habit.tsx</p>
        <p className="flex items-center gap-2 pl-4"><File className="h-3.5 w-3.5" /> index.css</p>
      </div>
      <pre className="overflow-hidden p-4 font-mono text-[12px] leading-6 text-zinc-400">
        <span className="text-violet-300">export function</span> <span className="text-cyan-300">Habit</span>{"({ name, streak }) {\n"}
        {"  "}<span className="text-violet-300">return</span>{" (\n"}
        {"    <"}<span className="text-indigo-300">div</span> <span className="text-emerald-300">className</span>{"=\"card\">\n"}
        {"      <"}<span className="text-indigo-300">h3</span>{">{name}</h3>\n"}
        {"      <"}<span className="text-indigo-300">Flame</span>{" /> {streak} days\n"}
        {"    </div>\n  );\n}"}
      </pre>
    </div>,
    <div key="ship" className="p-6">
      <div className="rounded-xl bg-gradient-to-br from-indigo-500/20 via-transparent to-cyan-400/10 p-5 ring-1 ring-white/10">
        <p className="text-sm font-semibold text-white">Habits</p>
        <div className="mt-4 grid grid-cols-7 items-end gap-2">
          {[40, 65, 50, 80, 72, 95, 60].map((h, i) => (
            <div key={i} className="rounded-md bg-gradient-to-t from-indigo-500 to-cyan-300" style={{ height: `${h}px` }} />
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="flex items-center gap-2 text-emerald-300"><span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px] shadow-emerald-400" /> Running on localhost:5173</span>
        <span className="flex items-center gap-1 text-zinc-400"><Download className="h-3.5 w-3.5" /> habit-tracker.zip</span>
      </div>
    </div>,
  ];

  return (
    <div className="relative h-[340px]">
      {panels.map((p, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            opacity: i === index ? 1 : 0,
            transform: `translateY(${(i - index) * 24}px) scale(${i === index ? 1 : 0.96})`,
            pointerEvents: i === index ? "auto" : "none",
          }}
        >
          {p}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [roadmapProgress, setRoadmapProgress] = useState(0);
  const stepsRef = useRef<HTMLElement>(null);
  const roadmapRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Scroll-driven parallax + section progress
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        document.documentElement.style.setProperty("--scroll", String(window.scrollY));

        const steps = stepsRef.current?.getBoundingClientRect();
        if (steps) {
          const p = Math.min(Math.max(-steps.top / (steps.height - window.innerHeight), 0), 0.999);
          setActiveStep(Math.floor(p * STEPS.length));
        }

        const road = roadmapRef.current?.getBoundingClientRect();
        if (road) {
          const p = (window.innerHeight * 0.6 - road.top) / road.height;
          setRoadmapProgress(Math.min(Math.max(p, 0), 1));
        }
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.documentElement.style.removeProperty("--scroll");
    };
  }, []);

  // Reveal-on-scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          observer.unobserve(e.target);
        }
      }),
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleGenerate = () => {
    if (status === "unauthenticated") {
      setIsAuthModalOpen(true);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#05060a] text-white selection:bg-indigo-500/40">
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Navigation */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#05060a]/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
            <a href="#how" className="transition-colors hover:text-white">How it works</a>
            <a href="#features" className="transition-colors hover:text-white">Features</a>
            <a href="#roadmap" className="transition-colors hover:text-white">Roadmap</a>
          </div>
          {status === "authenticated" ? (
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="text-sm text-zinc-300 transition-colors hover:text-white">
                Dashboard
              </Link>
              <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 text-sm font-semibold">
                {session?.user?.name?.[0]?.toUpperCase() || "U"}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="cursor-pointer rounded-full bg-white px-4 py-1.5 text-sm font-medium text-black transition-all hover:bg-zinc-200 active:scale-95"
            >
              Sign in
            </button>
          )}
        </div>
      </nav>

      {/* ---------- Hero ---------- */}
      <section className="relative px-4 pb-24 pt-36 sm:px-6 md:pt-44">
        {/* Parallax background */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="grid-bg parallax absolute inset-0" style={{ "--speed": 0.4 } as React.CSSProperties} />
          <div className="parallax absolute left-1/2 top-[-10%] h-[600px] w-[900px] -translate-x-1/2" style={{ "--speed": 0.25 } as React.CSSProperties}>
            <div className="h-full w-full rounded-full bg-indigo-600/25 blur-[120px]" />
          </div>
          <div className="parallax absolute right-[-10%] top-[30%] h-[400px] w-[400px]" style={{ "--speed": -0.15 } as React.CSSProperties}>
            <div className="h-full w-full rounded-full bg-cyan-500/15 blur-[100px]" />
          </div>
          <div className="parallax absolute left-[-10%] top-[55%] h-[360px] w-[360px]" style={{ "--speed": 0.1 } as React.CSSProperties}>
            <div className="h-full w-full rounded-full bg-violet-600/20 blur-[100px]" />
          </div>
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="reveal mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs text-zinc-300 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px] shadow-emerald-400" />
            AI app builder with a full runtime in your browser
          </div>

          <h1 className="reveal text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl md:text-8xl" style={{ "--delay": "80ms" } as React.CSSProperties}>
            Turn ideas into <br className="hidden sm:block" />
            <span className="text-shine">running apps.</span>
          </h1>

          <p className="reveal mx-auto mt-6 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg" style={{ "--delay": "160ms" } as React.CSSProperties}>
            Describe what you want. Vision plans it, writes the code, boots it in a live sandbox and hands you a project you can ship.
          </p>

          {/* Prompt */}
          <div className="reveal mx-auto mt-10 max-w-2xl" style={{ "--delay": "240ms" } as React.CSSProperties}>
            <div className="glow-border rounded-2xl bg-white/[0.04] p-2 shadow-[0_0_80px_-20px_rgba(99,102,241,0.6)] backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <Sparkles className="ml-3 h-5 w-5 shrink-0 text-indigo-300" />
                <input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                  placeholder="Create a todo app with React and TypeScript"
                  aria-label="Describe your app"
                  className="min-w-0 flex-1 bg-transparent py-3 text-base text-white placeholder-zinc-500 outline-none sm:text-lg"
                />
                <button
                  onClick={handleGenerate}
                  className="group flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition-all hover:bg-zinc-200 active:scale-95"
                >
                  <span className="hidden sm:inline">Generate</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setPrompt(s)}
                  className="cursor-pointer rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 text-xs text-zinc-400 transition-colors hover:border-white/20 hover:text-white"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hero product shot: tilts flat as you scroll */}
        <div
          className="reveal relative mx-auto mt-20 max-w-5xl"
          style={{
            "--delay": "320ms",
            perspective: "1400px",
          } as React.CSSProperties}
        >
          <div
            className="origin-top"
            style={{ transform: "rotateX(calc(max(0, 18 - var(--scroll) * 0.045) * 1deg)) scale(calc(min(1, 0.92 + var(--scroll) * 0.0002)))" }}
          >
            <WindowChrome title="vision.dev/builder — habit-tracker">
              <div className="grid min-h-[320px] grid-cols-1 md:grid-cols-[260px_1fr]">
                <div className="hidden space-y-4 border-r border-white/5 p-4 md:block">
                  <div className="ml-auto max-w-[85%] rounded-xl rounded-tr-sm bg-indigo-500/90 px-3 py-2 text-xs">Build a habit tracker with streaks</div>
                  <div className="max-w-[90%] space-y-2 rounded-xl rounded-tl-sm bg-white/[0.04] p-3 text-xs text-zinc-300">
                    <p>On it — scaffolding 8 files:</p>
                    {["package.json", "src/App.tsx", "src/Habit.tsx"].map((f) => (
                      <p key={f} className="flex items-center gap-2 text-zinc-400"><Check className="h-3 w-3 text-emerald-400" />{f}</p>
                    ))}
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-4 flex gap-2 text-xs">
                    <span className="rounded-md bg-white/5 px-3 py-1.5 text-zinc-400">Code</span>
                    <span className="rounded-md bg-white/10 px-3 py-1.5 text-white">Preview</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {["Read 20 pages", "Meditate", "Run 5k"].map((h, i) => (
                      <div key={h} className="rounded-xl border border-white/5 bg-gradient-to-b from-white/[0.05] to-transparent p-4">
                        <p className="text-sm text-white">{h}</p>
                        <p className="mt-6 text-3xl font-semibold">{[12, 31, 7][i]}<span className="ml-1 text-xs text-zinc-500">day streak</span></p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </WindowChrome>
          </div>
        </div>
      </section>

      {/* ---------- How it works (pinned scroll story) ---------- */}
      <section id="how" ref={stepsRef} className="relative" style={{ height: `${STEPS.length * 90}vh` }}>
        <div className="sticky top-0 flex h-screen items-center px-4 sm:px-6">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-10 md:grid-cols-2 md:gap-16">
            <div>
              <p className="mb-6 text-sm font-medium uppercase tracking-[0.2em] text-indigo-300">How it works</p>
              <div className="mb-8 flex gap-2">
                {STEPS.map((s, i) => (
                  <div key={s.label} className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-cyan-300 transition-all duration-500" style={{ width: i <= activeStep ? "100%" : "0%" }} />
                  </div>
                ))}
              </div>
              <div className="relative min-h-[220px]">
                {STEPS.map((s, i) => (
                  <div
                    key={s.label}
                    className="absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{
                      opacity: i === activeStep ? 1 : 0,
                      transform: `translateY(${(i - activeStep) * 30}px)`,
                      filter: i === activeStep ? "none" : "blur(6px)",
                    }}
                    aria-hidden={i !== activeStep}
                  >
                    <p className="font-mono text-sm text-zinc-500">0{i + 1} — {s.label}</p>
                    <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">{s.title}</h2>
                    <p className="mt-5 max-w-md text-zinc-400">{s.body}</p>
                  </div>
                ))}
              </div>
            </div>
            <WindowChrome title={`step ${activeStep + 1} of ${STEPS.length}`}>
              <StepVisual index={activeStep} />
            </WindowChrome>
          </div>
        </div>
      </section>

      {/* ---------- Capabilities bento ---------- */}
      <section id="features" className="relative px-4 py-32 sm:px-6">
        <div aria-hidden className="parallax pointer-events-none absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-indigo-700/10 blur-[120px]" style={{ "--speed": -0.08 } as React.CSSProperties} />
        <div className="relative mx-auto max-w-6xl">
          <div className="reveal max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-300">Everything in one tab</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">An entire dev environment, generated.</h2>
          </div>
          <div className="mt-16 grid gap-4 md:grid-cols-4">
            {CAPABILITIES.map(({ icon: Icon, title, body, span }, i) => (
              <div
                key={title}
                className={`reveal group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 transition-colors hover:border-white/15 hover:bg-white/[0.04] ${span}`}
                style={{ "--delay": `${(i % 4) * 80}ms` } as React.CSSProperties}
              >
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/0 blur-2xl transition-colors duration-500 group-hover:bg-indigo-500/20" />
                <div className="mb-10 grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5">
                  <Icon className="h-5 w-5 text-indigo-200" />
                </div>
                <h3 className="font-medium text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- What you can build (marquee) ---------- */}
      <section className="border-y border-white/5 py-14">
        <p className="reveal mb-8 text-center text-sm text-zinc-500">What people build with Vision</p>
        <div className="flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]">
          <div className="animate-marquee flex shrink-0 gap-4 pr-4">
            {[...BUILDS, ...BUILDS].map((b, i) => (
              <span key={i} className="whitespace-nowrap rounded-full border border-white/10 bg-white/[0.02] px-5 py-2 text-sm text-zinc-300">
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Roadmap ---------- */}
      <section id="roadmap" className="relative px-4 py-32 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="reveal mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-300">Roadmap</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">From project to product.</h2>
            <p className="mt-5 text-zinc-400">What we&apos;re building next to take Vision from a prototype generator to a platform you ship real products on.</p>
          </div>

          <div ref={roadmapRef} className="relative mt-20">
            {/* Timeline rail that fills as you scroll */}
            <div className="absolute bottom-0 left-5 top-0 w-px bg-white/10 md:left-1/2">
              <div className="w-full origin-top bg-gradient-to-b from-indigo-400 via-cyan-300 to-violet-400" style={{ height: "100%", transform: `scaleY(${roadmapProgress})` }} />
            </div>

            <div className="space-y-10 md:space-y-16">
              {ROADMAP.map(({ icon: Icon, tag, title, body }, i) => {
                const left = i % 2 === 0;
                return (
                  <div key={title} className="relative grid md:grid-cols-2 md:gap-16">
                    <div className={`absolute left-5 top-6 z-10 grid h-3 w-3 -translate-x-1/2 place-items-center rounded-full ring-4 ring-[#05060a] transition-colors duration-500 md:left-1/2 ${roadmapProgress * ROADMAP.length > i ? "bg-cyan-300 shadow-[0_0_14px] shadow-cyan-300" : "bg-zinc-700"}`} />
                    <div
                      className={`reveal ml-12 md:ml-0 ${left ? "md:col-start-1 md:text-right" : "md:col-start-2"}`}
                      style={{ "--delay": "60ms" } as React.CSSProperties}
                    >
                      <div className={`group inline-block w-full rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 text-left transition-all hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.04]`}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-400/10 ring-1 ring-white/10">
                            <Icon className="h-5 w-5 text-cyan-200" />
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${TAG_COLORS[tag]}`}>{tag}</span>
                        </div>
                        <p className="mt-5 font-mono text-xs text-zinc-500">{String(i + 1).padStart(2, "0")}</p>
                        <h3 className="mt-1 text-lg font-medium text-white">{title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-zinc-400">{body}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="relative px-4 pb-32 sm:px-6">
        <div className="reveal relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-indigo-500/15 to-transparent px-6 py-20 text-center">
          <div aria-hidden className="grid-bg absolute inset-0 opacity-60" />
          <div className="relative">
            <h2 className="text-4xl font-semibold tracking-tight md:text-6xl">Your next app is one sentence away.</h2>
            <p className="mx-auto mt-5 max-w-lg text-zinc-400">No setup, no boilerplate. Open Vision, describe it, and watch it run.</p>
            <button
              onClick={() => (status === "authenticated" ? router.push("/dashboard") : setIsAuthModalOpen(true))}
              className="group mt-10 inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-zinc-200 active:scale-95"
            >
              Start building free
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-zinc-500 sm:flex-row">
          <Logo />
          <p>© {new Date().getFullYear()} Vision. Built with Next.js & WebContainers.</p>
        </div>
      </footer>
    </div>
  );
}
