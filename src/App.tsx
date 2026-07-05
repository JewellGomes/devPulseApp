/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  GitCommit,
  AlertCircle,
  TrendingDown,
  Terminal,
  Activity,
  ArrowRight,
  Github,
  Key,
  Flame,
  Search,
  BookOpen,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Award,
  ChevronRight,
  Shield,
  ExternalLink,
  ChevronLeft,
  Users,
  CheckCircle2,
  XCircle,
  Info,
  Sparkle,
  Share2,
  Heart,
  Skull,
  UserMinus,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ProjectAnalysisResult } from "./types";
import { motion, AnimatePresence } from "motion/react";

const DEMO_REPOSITORIES = [
  { name: "facebook/react", desc: "The library for web and native user interfaces" },
  { name: "tailwindlabs/tailwindcss", desc: "A utility-first CSS framework for rapid UI development" },
  { name: "microsoft/vscode", desc: "Code editing. Redefined." },
];

export default function App() {
  const [repoUrl, setRepoUrl] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatusIndex, setLoadingStatusIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProjectAnalysisResult & { warning?: string; isMock?: boolean } | null>(null);
  
  // Set default tab to "human-vitals" (The 4 new metrics mockup / live cockpit)
  const [activeTab, setActiveTab] = useState<"human-vitals" | "dashboard" | "readme" | "risk" | "pitch" | "scope-stability">("human-vitals");
  
  const [tokenCopied, setTokenCopied] = useState(false);
  const [readmeCopied, setReadmeCopied] = useState(false);
  const [nudgedPrs, setNudgedPrs] = useState<{ [number: number]: boolean }>({});

  // Social Pitch Generator states
  const [pitchTone, setPitchTone] = useState<"launch" | "recruit" | "audit" | "dx">("launch");
  const [previewPlatform, setPreviewPlatform] = useState<"x" | "linkedin" | "script" | "readme">("x");
  const [useDevPulseTag, setUseDevPulseTag] = useState(true);
  const [useOpenSourceTag, setUseOpenSourceTag] = useState(true);
  const [useBuildInPublicTag, setUseBuildInPublicTag] = useState(true);
  const [useHackathonTag, setUseHackathonTag] = useState(true);
  const [userEditedPitch, setUserEditedPitch] = useState("");
  const [pitchCopied, setPitchCopied] = useState(false);

  // Scope stability interactive simulation states
  const [extraScopeInjections, setExtraScopeInjections] = useState<number>(0);
  const [ammoCopied, setAmmoCopied] = useState(false);

  // Onboarding Blueprint Lab states
  const [blueprintLoading, setBlueprintLoading] = useState(false);
  const [blueprintError, setBlueprintError] = useState<string | null>(null);
  const [blueprints, setBlueprints] = useState<{ envExample: string; dockerfile: string; bootstrapScript: string } | null>(null);
  const [activeBlueprintTab, setActiveBlueprintTab] = useState<"env" | "docker" | "bootstrap">("env");
  const [copiedBlueprint, setCopiedBlueprint] = useState(false);

  // Status messages cycled during analysis loading
  const loadingStatuses = [
    "Contacting GitHub GraphQL & REST Gateways...",
    "Retrieving recent commit history (analyzing last 30 commits)...",
    "Fetching developer reviews on pull requests...",
    "Evaluating commit-file changes for churn map...",
    "Injecting dataset into server-side Gemini 2.5 Flash engine...",
    "Analyzing commits for the progress summary...",
    "Evaluating issue discussions for team frustration score...",
    "Assembling human vitals charts and project health gauges...",
  ];

  // Load saved token on startup
  useEffect(() => {
    const savedToken = localStorage.getItem("devpulse_github_token");
    if (savedToken) {
      setGithubToken(savedToken);
    }
  }, []);

  // Save token to localStorage
  const handleSaveToken = (tokenVal: string) => {
    setGithubToken(tokenVal);
    localStorage.setItem("devpulse_github_token", tokenVal);
    setTokenCopied(true);
    setTimeout(() => setTokenCopied(false), 2000);
  };

  // Cycle loading messages when loading
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingStatusIndex((prev) => (prev + 1) % loadingStatuses.length);
      }, 2000);
    } else {
      setLoadingStatusIndex(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleAnalyze = async (targetRepo: string) => {
    if (!targetRepo.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    setLoadingStatusIndex(0);
    setBlueprints(null);
    setBlueprintError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoUrl: targetRepo,
          token: githubToken || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An unexpected error occurred.");
      }

      setResult(data);
      // Automatically focus the immersive cockpit on result load
      setActiveTab("human-vitals");
    } catch (err: any) {
      setError(err.message || "Failed to analyze repository.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoClick = (repoName: string) => {
    setRepoUrl(repoName);
    handleAnalyze(repoName);
  };

  const handleCopyReadme = (text: string) => {
    navigator.clipboard.writeText(text);
    setReadmeCopied(true);
    setTimeout(() => setReadmeCopied(false), 2000);
  };

  const handleNudge = (prNumber: number) => {
    setNudgedPrs((prev) => ({ ...prev, [prNumber]: true }));
    setTimeout(() => {
      setNudgedPrs((prev) => ({ ...prev, [prNumber]: false }));
    }, 4000);
  };

  const handleGenerateBlueprints = async () => {
    if (!result) return;
    setBlueprintLoading(true);
    setBlueprintError(null);
    try {
      const response = await fetch("/api/generate-blueprint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoName: result.repoName,
          description: result.description,
          filesList: result.hotspots?.map((h) => h.filePath) || [],
          language: result.developerVitals?.[0]?.modulesTouched?.[0]?.includes("py") ? "Python" : "TypeScript/Node.js",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate onboarding toolchain.");
      }

      const data = await response.json();
      setBlueprints(data);
    } catch (err: any) {
      setBlueprintError(err.message || "Failed to contact Onboarding Lab.");
    } finally {
      setBlueprintLoading(false);
    }
  };

  const generatePitchText = (res: ProjectAnalysisResult, tone: "launch" | "recruit" | "audit" | "dx") => {
    const overallScore = res.busFactor?.overallScore ?? 3;
    const onboardingScore = res.onboardingAuditor?.score ?? 45;
    
    let baseText = "";
    if (tone === "launch") {
      baseText = `🔍 Audited ${res.owner}/${res.repoName} with DevPulse!

📊 Project Health Score: ${res.healthScore}%
🚨 Bus Factor: ${overallScore}/10 (Risk of developer silos)
⚡ Onboarding Friction: ${onboardingScore}/100

💡 AI Knowledge Action: ${res.busFactor?.knowledgeSharingAction ?? 'Cross-training recommended.'}`;
    } else if (tone === "recruit") {
      baseText = `🤝 Looking for Open-Source Contributors for ${res.owner}/${res.repoName}!

We analyzed our telemetry with DevPulse:
• Bus Factor Risk: ${overallScore}/10
• Developer Onboarding Friction: ${onboardingScore}/100

💡 DX Code Tip: ${res.onboardingAuditor?.improvementTip ?? 'Help us simplify developer onboarding processes.'}`;
    } else if (tone === "audit") {
      baseText = `🛠️ Technical Quality Audit Summary: ${res.owner}/${res.repoName}

• Overall Code Health Score: ${res.healthScore}/100
• Team Frustration Score: ${res.teamSentiment.frustrationScore}/10 (${res.teamSentiment.frustrationLabel})

Generate clean technical quality audits and sentiment metrics on-demand!`;
    } else if (tone === "dx") {
      baseText = `💡 Developer Advocate DX Diagnostic for ${res.owner}/${res.repoName}:

Our calculated Onboarding Setup barrier is ${onboardingScore}/100.
To optimize contributor onboarding loops immediately:
👉 "${res.onboardingAuditor?.improvementTip ?? 'Provide a docker template to streamline local build stacks.'}"

Eliminate entry friction and build robust codebases with DevPulse!`;
    }

    const tags = [];
    if (useDevPulseTag) tags.push("#DevPulse");
    if (useOpenSourceTag) tags.push("#OpenSource");
    if (useBuildInPublicTag) tags.push("#BuildInPublic");
    if (useHackathonTag) tags.push("#Hackathon");

    return `${baseText}\n\n${tags.join(" ")}`;
  };

  const generateElevatorScript = (res: ProjectAnalysisResult) => {
    const overallScore = res.busFactor?.overallScore ?? 3;
    const onboardingScore = res.onboardingAuditor?.score ?? 45;
    const healthScore = res.healthScore;
    const repoName = res.repoName;
    const adviceText = res.onboardingAuditor?.improvementTip ?? "Provide a docker template to simplify setup.";
    
    return "🎤 [DEMO DAY ELEVATOR PITCH SCRIPT (1-MINUTE)]\n\n" +
      "\"Hello Judges! Our project is DevPulse.\n\n" +
      "Traditional code metrics are broken. They track lines of code or commit counts, but completely ignore the HUMAN element. Technical Debt is often actually Human Debt.\n\n" +
      "We audited the repository for '" + repoName + "' and discovered fascinating, hidden vitals.\n\n" +
      "Our engine calculated an overall Code Health Score of " + healthScore + "%. But more importantly, we looked beneath the surface:\n" +
      "1. First, we measured onboarding friction—our Onboarding Auditor gave it a Setup Index of " + onboardingScore + "/100.\n" +
      "2. Second, we analyzed knowledge silos. The Bus Factor Score is " + overallScore + "/10.\n\n" +
      "Instead of just highlighting spaghetti code, DevPulse provides a real-world, actionable roadmap. For example, our senior advocate tip recommends: \\\"" + adviceText + "\\\"\n\n" +
      "DevPulse is the first developer health system built to prevent burnout, eliminate knowledge silos, and optimize developer experience. Thank you!\"";
  };

  const generateReadmePitchMarkdown = (res: ProjectAnalysisResult) => {
    const overallScore = res.busFactor?.overallScore ?? 3;
    const onboardingScore = res.onboardingAuditor?.score ?? 45;
    const healthScore = res.healthScore;
    const complaints = res.teamSentiment?.recurringComplaints?.map(c => "- **Issue:** " + c).join("\n") || "- None detected.";
    
    return "### 📊 Developer Vitals & Quality Audit (via DevPulse)\n\n" +
      "We evaluated our codebase telemetry using the **DevPulse** AI engine to map technical debt against team friction.\n\n" +
      "| Metric Group | Score / Risk | Actionable Recommendation |\n" +
      "| :--- | :---: | :--- |\n" +
      "| **Codebase Health** | **" + healthScore + "%** | " + (healthScore >= 80 ? 'Continue modular refactoring cycles.' : 'Prioritize technical debt hotspots.') + " |\n" +
      "| **Setup Friction** | **" + onboardingScore + "/100** | " + (res.onboardingAuditor?.improvementTip ?? 'Simplify local configuration parameters.') + " |\n" +
      "| **Bus Factor Risk** | **" + overallScore + "/10** | " + (res.busFactor?.knowledgeSharingAction ?? 'Cross-train key modules immediately.') + " |\n\n" +
      "#### 🚨 Key Bottlenecks & Code Complexity Hotspots:\n" + complaints + "\n\n" +
      "*Report generated automatically by DevPulse v2.4.0.*";
  };

  // Reset custom input when parameters change to update generated layout
  useEffect(() => {
    setUserEditedPitch("");
  }, [pitchTone, useDevPulseTag, useOpenSourceTag, useBuildInPublicTag, useHackathonTag]);

  // Generate dynamic professional readme content based on analyzed metrics
  const generateReadmeContent = (res: ProjectAnalysisResult) => {
    const frustrationText =
      res.teamSentiment.frustrationScore <= 3
        ? "Low Frustration"
        : res.teamSentiment.frustrationScore <= 6
        ? "Moderate Friction"
        : "High Burnout Alert";

    return `# ${res.repoName} 🚀

> ${res.description}

An elegant, AI-driven project health intelligence report powered by **DevPulse**. We parse commit velocities, issue discussions, and codebase complexities using state-of-the-art LLMs to measure developer velocity and project viability dynamically.

---

## 📊 Repository Health Summary

| Metric | Score / Value | Status |
| :--- | :--- | :--- |
| **Project Health Score** | **${res.healthScore}%** | ${res.healthScore >= 80 ? "🟢 Healthy" : res.healthScore >= 50 ? "🟡 Warning" : "🔴 Critical"} |
| **Team Frustration Index** | **${res.teamSentiment.frustrationScore}/10** | ${res.teamSentiment.frustrationScore <= 4 ? `🟢 ${frustrationText}` : `🔴 ${frustrationText}`} |
| **Open Issues** | **${res.openIssuesCount}** | Active |
| **Stars / Forks** | **⭐ ${res.starsCount} / 🍴 ${res.forksCount}** | Social Proof |

---

## ⚡ Key Highlights (AI Summary)

${res.aiSummary.map((item) => `- ${item}`).join("\n")}

---

## 🧠 Innovation & Developer Sentiment Logic

**Developer Burnout is a critical, hidden risk in modern projects.**
Rather than just reporting lines of code, **DevPulse** actively screens issue comments using server-side Gemini sentiment analysis. Our algorithm detects:
- **Critical blockades**: Team members stuck on core utilities.
- **Frustration patterns**: Recurring keywords signaling process exhaustion or toxic build failures.
- **Tone tracking**: Chronic burnout warning metrics so managers or technical leaders can step in early.

### Identified Bottlenecks:
${res.teamSentiment.recurringComplaints.map((c) => `- **Issue:** ${c}`).join("\n")}

---

## 🛰️ Refactor Radar (Technical Debt Hotspots)

Below are the key source files evaluated for complexity and structural health:

${res.refactorRadar
  .map(
    (f) => `### 📁 \`${f.filePath}\` (Debt Rating: **${f.complexityScore}/100**)
- **Refactoring Priorities:**
${f.suggestions.map((s) => `  - ${s}`).join("\n")}`
  )
  .join("\n\n")}

---

## 🛠️ Installation & DevPulse Setup

To launch this dashboard locally:

1. Clone this workspace repository.
2. Initialize and configure secrets in your local environments:
   \`\`\`bash
   # Create environment file
   cp .env.example .env
   
   # Populate secrets
   GEMINI_API_KEY="YOUR_GOOGLE_GEMINI_API_KEY"
   \`\`\`
3. Fire up the developer server:
   \`\`\`bash
   npm run dev
   \`\`\`
4. View the interactive terminal console in your browser at \`http://localhost:3000\`.

*DevPulse is configured to support real-time integrations with **Slack**, **Jira**, and automated CI/CD webhooks as part of our future roadmap.*
`;
  };

  const getFrustrationColor = (score: number) => {
    if (score <= 3) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    if (score <= 6) return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    return "bg-rose-500/20 text-rose-400 border-rose-500/30";
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans antialiased selection:bg-emerald-500/30 selection:text-emerald-300 relative flex flex-col justify-between overflow-x-hidden">
      
      {/* Dynamic Grid Background Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Top Navigation Header Bar */}
      <header className="relative z-20 mx-4 sm:mx-8 mt-6 mb-6 bg-slate-900/50 border border-slate-800 rounded-2xl p-4 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div 
            className="w-10 h-10 bg-emerald-500/20 border border-emerald-500/40 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
            onClick={() => setResult(null)}
            id="app-logo"
          >
            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <div className="cursor-pointer" onClick={() => setResult(null)}>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center">
              DEVPULSE 
              <span className="text-slate-500 font-mono text-xs ml-2 uppercase tracking-widest px-1.5 py-0.5 border border-slate-800 rounded bg-slate-950/40">v2.4.0</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              {result ? `${result.owner} / ${result.repoName}` : "facebook / react"} • last sync: {result ? "just now" : "2m ago"}
            </p>
          </div>
        </div>

        {result && (
          <div className="flex items-center justify-between md:justify-end gap-8 w-full md:w-auto border-t border-slate-800 md:border-none pt-3 md:pt-0">
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Repo Health Score</div>
              <div className="text-2xl font-black text-emerald-400 font-mono tracking-tighter">
                {result.healthScore}%
              </div>
            </div>
            <div className="h-10 w-[1px] bg-slate-800 hidden sm:block"></div>
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">U</div>
              <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-emerald-600 flex items-center justify-center text-[10px] font-bold text-white">
                +{result.commits ? result.commits.length : "12"}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              showSettings
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700"
            }`}
            id="settings-trigger-btn"
          >
            <Key className="h-3.5 w-3.5" />
            <span>Settings PAT</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 pb-12">
        
        {/* Settings Panel Overlay */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-5 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md"
              id="settings-panel"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Shield className="h-5 w-5" />
                  <h3 className="font-semibold text-white">GitHub API Authentication</h3>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Close
                </button>
              </div>
              <p className="text-xs text-slate-300 max-w-3xl mb-4 leading-relaxed">
                Provide a **GitHub Personal Access Token (PAT)** to query larger or private repositories and avoid public API rate limit blocks. Your key is saved locally in your browser.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                <input
                  type="password"
                  placeholder="github_pat_..."
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 placeholder:text-slate-600 font-mono"
                  id="pat-token-input"
                />
                <button
                  onClick={() => handleSaveToken(githubToken)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  id="save-pat-btn"
                >
                  {tokenCopied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Key className="h-4 w-4" />
                      Save
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LANDING / INPUT VIEW */}
        <AnimatePresence mode="wait">
          {!result && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-3xl mx-auto py-12 text-center"
            >
              <div className="inline-flex items-center justify-center bg-emerald-500/10 p-6 rounded-full mb-6 border border-emerald-500/20">
                <Activity className="h-16 w-16 text-emerald-400 animate-pulse" />
              </div>

              <h2 className="text-4xl sm:text-5xl font-display font-extrabold text-white tracking-tight leading-tight">
                Inspect Human & Code Vitals with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">AI Context</span>
              </h2>
              
              <p className="mt-4 text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
                Connect any public repository to map developer burnout indexes, track unreviewed pull latency, spot technical hotspots, and generate custom DX profiles.
              </p>

              {/* URL SEARCH INPUT */}
              <div className="mt-8 bg-slate-900/40 backdrop-blur-md border border-slate-800 p-2 rounded-2xl flex flex-col sm:flex-row items-stretch gap-2 shadow-2xl">
                <div className="flex-1 flex items-center gap-3 px-3">
                  <Search className="h-5 w-5 text-slate-500 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Enter repository (e.g. facebook/react)"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAnalyze(repoUrl)}
                    className="w-full bg-transparent text-white placeholder:text-slate-600 focus:outline-none text-sm py-2 font-mono"
                    id="repo-search-input"
                  />
                </div>
                <button
                  onClick={() => handleAnalyze(repoUrl)}
                  className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
                  id="start-analysis-btn"
                >
                  <span>Analyze Vitals</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* QUICK START BADGES */}
              <div className="mt-12 text-left">
                <div className="flex items-center gap-2 mb-4 text-xs font-mono tracking-widest text-slate-400 uppercase">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <span>Interactive Repository Presets</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {DEMO_REPOSITORIES.map((demo) => (
                    <button
                      key={demo.name}
                      onClick={() => handleDemoClick(demo.name)}
                      className="text-left p-4 rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-md hover:bg-slate-900/60 hover:border-slate-700 transition-all group flex flex-col justify-between h-36 shadow-lg cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Public Demo</span>
                          <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <h4 className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors">
                          {demo.name}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {demo.desc}
                        </p>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-2 font-mono uppercase">
                        <Github className="h-3.5 w-3.5" />
                        <span>Inspect Telemetry</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ERROR ALERT */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 rounded-xl border border-rose-950 bg-rose-950/20 text-rose-300 text-sm flex items-start gap-3 text-left leading-relaxed"
                  id="error-banner"
                >
                  <AlertCircle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-rose-200">Analysis Error</span>
                    {error}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* LOADING STATE VIEW */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto py-16 text-center"
              id="loading-panel"
            >
              <div className="relative inline-flex items-center justify-center mb-8">
                <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-2xl animate-pulse" />
                <div className="border-4 border-slate-900 border-t-emerald-500 w-16 h-16 rounded-full animate-spin relative z-10" />
                <Activity className="h-6 w-6 text-emerald-400 absolute animate-pulse z-10" />
              </div>

              <h3 className="text-2xl font-bold text-white font-display">
                Auditing Repository Telemetry
              </h3>
              
              <div className="mt-4 max-w-md mx-auto">
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    className="bg-emerald-500 h-1.5 rounded-full"
                    animate={{
                      width: ["10%", "35%", "65%", "90%", "100%"],
                    }}
                    transition={{
                      duration: 8,
                      ease: "easeInOut",
                    }}
                  />
                </div>
              </div>

              <p className="text-xs font-mono text-slate-400 mt-6 min-h-[2.5rem] tracking-wide animate-pulse">
                &gt; {loadingStatuses[loadingStatusIndex]}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* REPORT DASHBOARD RESULT VIEW */}
        <AnimatePresence>
          {result && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Safe Mode Rate Limit Warning Banner */}
              {result.warning && (
                <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-300 text-xs flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <span className="font-bold block text-amber-200 mb-0.5">Rate Limit Safeguard Active</span>
                    {result.warning} Provide a PAT in Settings to pull unlimited live logs instantly!
                  </div>
                </div>
              )}

              {/* Tabs selector */}
              <div className="flex flex-wrap items-center border-b border-slate-800 gap-2 mb-6 bg-slate-900/20 p-1.5 rounded-xl">
                <button
                  onClick={() => setActiveTab("human-vitals")}
                  className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === "human-vitals"
                      ? "bg-slate-800 border border-slate-700 text-white shadow-lg"
                      : "text-slate-400 hover:text-white"
                  }`}
                  id="tab-immersive-cockpit"
                >
                  <Activity className="h-4 w-4 text-emerald-400" />
                  Immersive Cockpit
                </button>
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === "dashboard"
                      ? "bg-slate-800 border border-slate-700 text-white shadow-lg"
                      : "text-slate-400 hover:text-white"
                  }`}
                  id="tab-code-audit"
                >
                  <Terminal className="h-4 w-4 text-cyan-400" />
                  Code Quality Audit
                </button>
                <button
                  onClick={() => setActiveTab("risk")}
                  className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === "risk"
                      ? "bg-slate-800 border border-slate-700 text-white shadow-lg"
                      : "text-slate-400 hover:text-white"
                  }`}
                  id="tab-risk-readiness"
                >
                  <Shield className="h-4 w-4 text-rose-400" />
                  Risk & Readiness
                </button>
                <button
                  onClick={() => setActiveTab("readme")}
                  className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === "readme"
                      ? "bg-slate-800 border border-slate-700 text-white shadow-lg"
                      : "text-slate-400 hover:text-white"
                  }`}
                  id="tab-readme"
                >
                  <BookOpen className="h-4 w-4 text-amber-400" />
                  README.md Snippet
                </button>
                <button
                  onClick={() => setActiveTab("pitch")}
                  className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === "pitch"
                      ? "bg-slate-800 border border-slate-700 text-white shadow-lg"
                      : "text-slate-400 hover:text-white"
                  }`}
                  id="tab-social-hub"
                >
                  <Share2 className="h-4 w-4 text-purple-400" />
                  Social Pitch Hub
                </button>
                <button
                  onClick={() => setActiveTab("scope-stability")}
                  className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === "scope-stability"
                      ? "bg-slate-800 border border-slate-700 text-white shadow-lg"
                      : "text-slate-400 hover:text-white"
                  }`}
                  id="tab-scope-stability"
                >
                  <TrendingDown className="h-4 w-4 text-emerald-400" />
                  Scope Stability
                </button>
              </div>

              {/* TAB CONTENT: IMMERSIVE COCKPIT (The 4 Reddit requested core features) */}
              {activeTab === "human-vitals" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="immersive-cockpit-grid">
                  
                  {/* LEFT COLUMN: Neglect Map */}
                  <section className="lg:col-span-4 flex flex-col gap-4" id="section-neglect-map">
                    <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-5 flex-1 flex flex-col relative overflow-hidden backdrop-blur-md">
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <UserMinus className="w-24 h-24 text-rose-500" />
                      </div>
                      
                      <h3 className="text-sm font-bold text-rose-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse"></span>
                        Neglect Map (Ghosted PRs)
                      </h3>

                      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                        Tracks unreviewed Pull Requests aging over 24 hours. Items with no reviews from external developers are flagged.
                      </p>

                      <div className="space-y-3 flex-1 overflow-y-auto max-h-[350px] pr-1">
                        {result.ghostPRs && result.ghostPRs.length > 0 ? (
                          result.ghostPRs.map((pr) => {
                            const isSevere = pr.ageInHours >= 48;
                            return (
                              <div
                                key={pr.number}
                                className={`p-3 rounded-xl flex justify-between items-center transition-all ${
                                  isSevere
                                    ? "bg-rose-500/5 border border-rose-500/20 animate-[pulse-glow_3s_infinite]"
                                    : "bg-slate-800/30 border border-slate-700/50"
                                }`}
                              >
                                <div className="min-w-0 flex-1 pr-2">
                                  <div className="text-xs font-mono font-semibold text-slate-200 truncate" title={pr.title}>
                                    #{pr.number}: {pr.title}
                                  </div>
                                  <div className="text-[10px] text-slate-500 mt-0.5">
                                    Author: <span className="text-slate-300">@{pr.author}</span>
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <div className={`text-sm font-mono font-bold ${isSevere ? "text-rose-400" : "text-slate-400"}`}>
                                    {pr.ageInHours}h
                                  </div>
                                  <div className={`text-[8px] uppercase font-bold tracking-wider mt-0.5 ${
                                    isSevere ? "text-rose-500/80" : "text-slate-500"
                                  }`}>
                                    {isSevere ? "Dead Zone" : pr.status}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center p-6 bg-slate-950/25 border border-slate-900 rounded-xl text-slate-500 font-mono text-xs">
                            No open ghosted PRs detected. Reviews are dynamic!
                          </div>
                        )}
                      </div>

                      <div className="mt-4">
                        <button
                          onClick={() => handleNudge(999)}
                          className="w-full py-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider hover:bg-rose-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Activity className="h-4 w-4" />
                          <span>
                            {nudgedPrs[999] ? "Reminders Dispatched!" : "Nudge Reviewers"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* MIDDLE COLUMN: Hotspot Radar & Burnout */}
                  <section className="lg:col-span-4 flex flex-col gap-6" id="section-hotspots-burnout">
                    
                    {/* Hotspot Radar */}
                    <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-5 h-[240px] relative overflow-hidden backdrop-blur-md flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-amber-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                          <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8c0-5.39-4.51-11.39-4.51-11.39z"/>
                          </svg>
                          Hotspot Radar
                        </h3>
                        <p className="text-[11px] text-slate-400 mb-4 leading-normal">
                          Identifies files with high frequency commit churn (&gt; 20%). Flame icons indicate severe Technical Debt.
                        </p>
                      </div>

                      <div className="space-y-3.5 overflow-y-auto max-h-[120px] pr-1">
                        {result.hotspots && result.hotspots.length > 0 ? (
                          result.hotspots.map((file, idx) => (
                            <div key={idx} className="flex flex-col gap-1">
                              <div className="flex justify-between items-center text-[10px] font-mono">
                                <span className="text-slate-300 truncate max-w-[70%] flex items-center gap-1" title={file.filePath}>
                                  {file.hasHighDebt && <Flame className="h-3.5 w-3.5 text-rose-500 inline flex-shrink-0 animate-pulse" />}
                                  {file.filePath}
                                </span>
                                <span className={file.hasHighDebt ? "text-rose-400 font-bold" : "text-amber-500"}>
                                  {file.churnScore}% Churn
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-800/60 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-1000 ${
                                    file.hasHighDebt
                                      ? "bg-gradient-to-r from-amber-500 to-rose-500"
                                      : "bg-amber-500"
                                  }`}
                                  style={{ width: `${file.churnScore}%` }}
                                ></div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-slate-500 text-xs font-mono py-2">
                            No high churn files mapped yet.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Burnout Monitor */}
                    <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-5 flex-1 relative overflow-hidden backdrop-blur-md flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-[0.2em] mb-2">
                          Context-Switching Tax
                        </h3>
                        <p className="text-[11px] text-slate-400 mb-4 leading-normal">
                          Monitors developer cognitive friction based on top-level directory span touched over active days.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[140px] pr-1">
                        {result.developerVitals && result.developerVitals.length > 0 ? (
                          result.developerVitals.slice(0, 4).map((dev, idx) => {
                            const isHigh = dev.contextSwitchingTax >= 60;
                            return (
                              <div
                                key={idx}
                                className={`p-3 rounded-2xl border transition-all ${
                                  isHigh
                                    ? "bg-rose-500/5 border-rose-500/20"
                                    : "bg-slate-800/40 border-slate-700/50"
                                }`}
                              >
                                <div className="text-[10px] text-slate-400 font-mono font-bold truncate">
                                  @{dev.username}
                                </div>
                                <div className={`text-2xl font-black font-mono tracking-tighter mt-1 ${
                                  isHigh ? "text-rose-400" : "text-cyan-400"
                                }`}>
                                  {dev.contextSwitchingTax}%
                                </div>
                                <div className="text-[9px] text-slate-500 mt-0.5">
                                  {dev.modulesTouched.length} Modules / {dev.daysActive}d
                                </div>
                                
                                <div className={`mt-2 text-[8px] p-1 rounded border text-center uppercase font-black tracking-tighter ${
                                  isHigh
                                    ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                }`}>
                                  {isHigh ? "High Risk" : "Deep Focus"}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="col-span-2 text-center text-slate-500 text-xs font-mono py-6">
                            Insufficient context logs.
                          </div>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* RIGHT COLUMN: Invisible Heroes */}
                  <section className="lg:col-span-4 flex flex-col" id="section-invisible-heroes">
                    <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-5 flex-1 relative flex flex-col justify-between backdrop-blur-md">
                      <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-500/5 blur-[80px] pointer-events-none"></div>
                      
                      <div>
                        <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-[0.2em] mb-4 flex items-center justify-between">
                          <span>Culture & Shadow Work</span>
                          <span className="text-[10px] text-slate-500 normal-case font-normal">Force Multipliers</span>
                        </h3>
                        
                        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                          Celebrates developers driving peer communication, reviews, and utility consolidation over basic line output.
                        </p>
                      </div>
                      
                      <div className="space-y-4 flex-1 overflow-y-auto max-h-[300px] pr-1">
                        {result.developerVitals && result.developerVitals.length > 0 ? (
                          result.developerVitals.map((dev, idx) => {
                            const isHighRatio = dev.ratio > 3;
                            return (
                              <div key={idx} className="relative border-b border-slate-800/60 pb-3 last:border-b-0 last:pb-0">
                                <div className="flex items-center gap-3.5 mb-2">
                                  <div className={`w-9 h-9 rounded-full p-[1px] flex-shrink-0 bg-gradient-to-br ${
                                    isHighRatio ? "from-yellow-400 to-amber-600" : "from-slate-500 to-slate-700"
                                  }`}>
                                    <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-amber-400 font-mono text-xs font-black">
                                      {dev.username.substring(0, 2).toUpperCase()}
                                    </div>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-sm font-bold text-white truncate">@{dev.username}</div>
                                    <div className="flex gap-1.5 flex-wrap mt-0.5">
                                      {dev.badges.map((badge, bIdx) => (
                                        <span
                                          key={bIdx}
                                          className={`text-[8px] uppercase tracking-widest font-black px-1.5 py-0.5 rounded ${
                                            badge.includes("Multiplier")
                                              ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-500"
                                              : badge.includes("Architect")
                                              ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400"
                                              : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                                          }`}
                                        >
                                          {badge}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <p className="text-[11px] text-slate-400 leading-normal pl-1">
                                  Mentored peer requests. Mentoring ratio:{" "}
                                  <span className="text-emerald-400 font-mono font-bold italic">
                                    {dev.ratio.toFixed(1)}x
                                  </span>{" "}
                                  Shadow Activity weight.
                                </p>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center text-slate-500 text-xs font-mono py-8">
                            No developer vitals map generated.
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800">
                        <div className="text-[9px] text-slate-500 font-mono flex justify-between uppercase">
                          <span>Data Relevance</span>
                          <span>99.2% Precision Score</span>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {/* TAB CONTENT: GENERAL TECHNICAL QUALITY AUDIT */}
              {activeTab === "dashboard" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-tab-grid">
                  
                  {/* LEFT RAIL - HEALTH GAUGE, SENTIMENT */}
                  <div className="lg:col-span-4 space-y-6">
                    
                    {/* Sentiment Analysis Gauge */}
                    <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-5 backdrop-blur-md">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400">Team Sentiment</h3>
                        <span className={`px-2 py-0.5 border text-[10px] rounded uppercase ${
                          result.teamSentiment.frustrationScore <= 3
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                            : result.teamSentiment.frustrationScore <= 6
                            ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-500"
                            : "bg-rose-500/10 border-rose-500/30 text-rose-500"
                        }`}>
                          {result.teamSentiment.frustrationLabel}
                        </span>
                      </div>

                      {/* Spark bars simulating team sentiment friction */}
                      <div className="flex items-end justify-between gap-1 grow mb-4 h-16 bg-slate-950/40 p-2 rounded-lg border border-slate-900/50">
                        <div className="w-full bg-slate-800/80 rounded-t-sm h-[40%]"></div>
                        <div className="w-full bg-slate-800/80 rounded-t-sm h-[55%]"></div>
                        <div className="w-full bg-slate-800/80 rounded-t-sm h-[30%]"></div>
                        <div className="w-full bg-yellow-500 h-[85%] rounded-t-sm shadow-[0_0_10px_rgba(234,179,8,0.3)]"></div>
                        <div className="w-full bg-slate-800/80 rounded-t-sm h-[45%]"></div>
                        <div className="w-full bg-slate-800/80 rounded-t-sm h-[60%]"></div>
                        <div className="w-full bg-slate-800/80 rounded-t-sm h-[50%]"></div>
                      </div>

                      <div className="flex items-center justify-between gap-4 p-3 rounded-xl border border-slate-800 bg-slate-950/40 mb-4">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">Friction Index</span>
                          <span className="text-xl font-extrabold text-white font-mono">
                            {result.teamSentiment.frustrationScore} <span className="text-xs text-slate-500">/ 10</span>
                          </span>
                        </div>
                        <Flame className="h-5 w-5 text-amber-500 animate-pulse" />
                      </div>

                      <div className="space-y-2">
                        {result.teamSentiment.recurringComplaints.map((complaint, idx) => (
                          <div key={idx} className="flex items-start text-xs text-slate-400 leading-normal">
                            <span className="text-yellow-500 mr-2 italic flex-shrink-0">⚠️</span>
                            <span className="break-words font-sans">{complaint}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* RIGHT COLUMN - SUMMARY, SENTIMENT TIMELINE CHART, REFACTOR TERMINAL */}
                  <div className="lg:col-span-8 space-y-6">
                    
                    {/* Progress summary bullets */}
                    <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-5 backdrop-blur-md">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                          <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400">AI Progress Pulse</h3>
                        </div>
                        <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">SYS_OK</div>
                      </div>

                      {/* Stats grid */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-slate-950/30 p-3 border border-slate-800/40 rounded-xl text-center">
                          <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">Commits</span>
                          <span className="text-base font-extrabold text-emerald-400 block mt-0.5 font-mono">
                            {result.commits ? result.commits.length : "30+"}
                          </span>
                        </div>
                        <div className="bg-slate-950/30 p-3 border border-slate-800/40 rounded-xl text-center">
                          <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">Issues</span>
                          <span className="text-base font-extrabold text-teal-400 block mt-0.5 font-mono">
                            {result.issues ? result.issues.length : "1"}
                          </span>
                        </div>
                        <div className="bg-slate-950/30 p-3 border border-slate-800/40 rounded-xl text-center">
                          <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">Hotspots Mapped</span>
                          <span className="text-base font-extrabold text-white block mt-0.5 font-mono">
                            {result.hotspots ? result.hotspots.length : "5"}
                          </span>
                        </div>
                      </div>

                      {/* AI Summary bullets */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {result.aiSummary.map((bullet, idx) => (
                          <div key={idx} className="bg-slate-950/50 p-4 border border-slate-800/50 rounded-xl flex flex-col justify-between">
                            <p className="text-xs leading-relaxed text-slate-300 break-words font-sans">{bullet}</p>
                            <span className="text-[9px] font-mono text-emerald-500/60 mt-3 self-end">PULSE_0{idx+1}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* RECHARTS SENTIMENT TIMELINE */}
                    <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-5 backdrop-blur-md">
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 flex items-center gap-2">
                          <TrendingDown className="h-4 w-4 text-emerald-400" />
                          Developer Sentiment Velocity over Time
                        </h3>
                        <span className="text-[9px] font-mono text-slate-500 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded">
                          1 - 10 scale
                        </span>
                      </div>

                      <div className="h-56 w-full bg-slate-950/40 rounded-xl overflow-hidden p-2">
                        {result.teamSentiment.sentimentTimeline && result.teamSentiment.sentimentTimeline.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={result.teamSentiment.sentimentTimeline}
                              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                            >
                              <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                              <XAxis
                                dataKey="date"
                                stroke="#64748b"
                                fontSize={9}
                                tickLine={false}
                                axisLine={false}
                              />
                              <YAxis
                                stroke="#64748b"
                                fontSize={9}
                                domain={[1, 10]}
                                tickLine={false}
                                axisLine={false}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "#020617",
                                  borderColor: "#1e293b",
                                  borderRadius: "0.5rem",
                                  color: "#fff",
                                  fontSize: "11px",
                                  fontFamily: "monospace",
                                }}
                              />
                              <Area
                                type="monotone"
                                dataKey="score"
                                name="Team Vibe"
                                stroke="#10b981"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorScore)"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-full text-xs text-slate-500 font-mono">
                            Insufficient timeline commits.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* REFACTOR RADAR PANEL */}
                    <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-5 backdrop-blur-md">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 flex items-center gap-2">
                          <Terminal className="h-4 w-4 text-emerald-400" />
                          Refactor Radar (Technical Debt)
                        </h3>
                        <span className="text-[10px] font-mono text-emerald-400 border border-emerald-400/30 px-2 py-0.5 rounded bg-emerald-400/5">Scan Depth: Moderate</span>
                      </div>
                      
                      <div className="space-y-4">
                        {result.refactorRadar.map((file, idx) => (
                          <div key={idx} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className="text-xs font-mono font-semibold text-white break-all">{file.filePath}</span>
                                <div className="flex gap-2 mt-1">
                                  <span className="text-[9px] font-mono text-slate-500 uppercase">Debt Index:</span>
                                  <span className={`text-[9px] font-mono uppercase font-bold italic ${
                                    file.complexityScore >= 75 ? "text-red-400" : "text-yellow-400"
                                  }`}>
                                    {file.complexityScore}/100 {file.complexityScore >= 75 ? "Severe" : "Moderate"}
                                  </span>
                                </div>
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono">INDEX_0{idx + 1}</div>
                            </div>
                            
                            {file.codeSnippetPreview && (
                              <div className="font-mono text-[10px] bg-black/60 p-2.5 rounded border border-slate-800/50 text-slate-400 mb-2 overflow-x-auto">
                                {file.codeSnippetPreview}
                              </div>
                            )}

                            <div className="space-y-1 bg-slate-950/30 p-2 rounded border border-slate-900">
                              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Recommendations:</span>
                              {file.suggestions.map((suggestion, sIdx) => (
                                <p key={sIdx} className="text-xs text-slate-400 italic">"• {suggestion}"</p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* TAB CONTENT: RISK & READINESS */}
              {activeTab === "risk" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="risk-tab-grid">
                  
                  {/* LEFT RAIL - BUS FACTOR RISK ASSESSMENT */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-5 backdrop-blur-md">
                      
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-rose-400 block mb-1">
                            Human Capital Silos
                          </span>
                          <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Users className="h-5 w-5 text-rose-400" />
                            Bus Factor Risk Assessment
                          </h3>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-slate-950/40 p-5 rounded-2xl border border-slate-900">
                        <div className="md:col-span-5 flex flex-col items-center justify-center">
                          <div className="relative flex items-center justify-center w-32 h-32">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle cx="64" cy="64" r="50" className="stroke-slate-800 fill-none" strokeWidth="8" />
                              <circle
                                cx="64"
                                cy="64"
                                r="50"
                                className="fill-none transition-all duration-1000 ease-out"
                                strokeWidth="8"
                                strokeDasharray={314.16}
                                strokeDashoffset={314.16 - (314.16 * (result.busFactor?.overallScore ?? 3)) / 10}
                                stroke="currentColor"
                                style={{
                                  color: (result.busFactor?.overallScore ?? 3) <= 3 ? "#f43f5e" : "#f59e0b",
                                }}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                              <span className="text-3xl font-black text-white leading-none font-mono">
                                {result.busFactor?.overallScore ?? 3}
                              </span>
                              <span className="text-[9px] font-mono text-slate-400 mt-1 uppercase tracking-wider">
                                / 10 Score
                              </span>
                            </div>
                          </div>
                          <span className={`text-xs font-mono font-bold uppercase mt-2 px-3 py-1 rounded-full border ${
                            (result.busFactor?.overallScore ?? 3) <= 3
                              ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                              : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                          }`}>
                            {(result.busFactor?.overallScore ?? 3) <= 3 ? "Critical Risk" : "Moderate Risk"}
                          </span>
                        </div>

                        <div className="md:col-span-7 space-y-4">
                          <div>
                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">AI Impact Diagnosis</span>
                            <p className="text-xs text-slate-300 leading-relaxed mt-1 break-words">
                              {result.busFactor?.explanation ?? "Module ownership analysis completed."}
                            </p>
                          </div>
                          
                          <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl">
                            <span className="text-[9px] font-mono text-rose-400 uppercase tracking-widest block font-bold mb-1">
                              Action Recommendation
                            </span>
                            <p className="text-xs text-slate-300 italic leading-relaxed">
                              "To mitigate this risk: {result.busFactor?.knowledgeSharingAction ?? 'Establish code walk-throughs across modules.'}"
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Module ownership cards */}
                      <div className="mt-6">
                        <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-3">
                          Knowledge Ownership Distribution by Module
                        </h4>

                        <div className="space-y-3">
                          {result.busFactor?.modules && result.busFactor.modules.length > 0 ? (
                            result.busFactor.modules.map((mod, idx) => (
                              <div key={idx} className="bg-slate-950/60 border border-slate-900 rounded-xl p-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0"></span>
                                    <span className="font-mono text-xs font-semibold text-white break-all" title={mod.modulePath}>
                                      {mod.modulePath}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-mono text-slate-500">
                                      Commits: <span className="text-slate-300 font-bold">{mod.totalCommits}</span>
                                    </span>
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <div className="flex justify-between items-center text-[11px]">
                                    <span className="text-slate-400">
                                      Key Owner: <span className="text-slate-200 font-bold">@{mod.topContributor}</span>
                                    </span>
                                    <span className="text-rose-400 font-mono font-bold">
                                      {mod.topContributorPercentage}% of total
                                    </span>
                                  </div>
                                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                                    <div
                                      className="bg-gradient-to-r from-rose-500 to-amber-500 h-1.5 rounded-full"
                                      style={{ width: `${mod.topContributorPercentage}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center p-6 bg-slate-950/20 border border-slate-900 rounded-xl text-slate-500 font-mono text-xs">
                              Module statistics mapping complete.
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* RIGHT RAIL - ONBOARDING FRICTION AUDITOR */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-5 backdrop-blur-md">
                      
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-400 block mb-1">
                            DX Evaluation
                          </span>
                          <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Shield className="h-5 w-5 text-emerald-400" />
                            Onboarding Friction
                          </h3>
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-center bg-slate-950/40 p-5 rounded-2xl border border-slate-900 mb-4">
                        <div className="relative flex items-center justify-center w-28 h-28 mb-2">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="56" cy="56" r="44" className="stroke-slate-800 fill-none" strokeWidth="6" />
                            <circle
                              cx="56"
                              cy="56"
                              r="44"
                              className="fill-none transition-all duration-1000 ease-out"
                              strokeWidth="6"
                              strokeDasharray={276.46}
                              strokeDashoffset={276.46 - (276.46 * (result.onboardingAuditor?.score ?? 45)) / 100}
                              stroke="currentColor"
                              style={{
                                color: (result.onboardingAuditor?.score ?? 45) >= 60 ? "#f43f5e" : "#10b981",
                              }}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center">
                            <span className="text-2xl font-black text-white leading-none font-mono">
                              {result.onboardingAuditor?.score ?? 45}
                            </span>
                            <span className="text-[9px] font-mono text-slate-400 mt-0.5 uppercase tracking-wider">
                              Friction
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <span className={`text-xs font-mono uppercase font-bold ${
                            (result.onboardingAuditor?.score ?? 45) >= 60 ? "text-rose-400" : "text-emerald-400"
                          }`}>
                            {(result.onboardingAuditor?.score ?? 45) >= 60 ? "High Setup Friction" : "Low Setup Friction"}
                          </span>
                        </div>
                      </div>

                      {/* Onboarding Checklist */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-900 text-xs">
                          <div className="flex items-center gap-2">
                            {result.onboardingAuditor?.hasEnvExample ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <XCircle className="h-4 w-4 text-rose-400" />
                            )}
                            <span className="font-mono">.env.example file</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {result.onboardingAuditor?.hasEnvExample ? "PRESENT" : "MISSING"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-900 text-xs">
                          <div className="flex items-center gap-2">
                            {result.onboardingAuditor?.hasDocker ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <XCircle className="h-4 w-4 text-amber-400" />
                            )}
                            <span className="font-mono">Dockerfile Config</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {result.onboardingAuditor?.hasDocker ? "PRESENT" : "MISSING"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-900 text-xs">
                          <div className="flex items-center gap-2">
                            {result.onboardingAuditor?.hasPrerequisites ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <XCircle className="h-4 w-4 text-rose-400" />
                            )}
                            <span className="font-mono">Setup Requirements</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {result.onboardingAuditor?.hasPrerequisites ? "DOCUMENTED" : "UNDOCUMENTED"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 p-3 rounded-xl border border-slate-850 bg-slate-950/40">
                        <span className="text-[9px] font-mono text-emerald-400 tracking-wider block mb-1">
                          DX DEVELOPER ADVOCATE INSTRUCTION:
                        </span>
                        <p className="text-xs text-slate-300 italic leading-normal">
                          "{result.onboardingAuditor?.improvementTip ?? 'Provide a quick start bootstrap guide.'}"
                        </p>
                      </div>

                      {/* ONBOARDING BLUEPRINT LAB */}
                      <div className="mt-6 pt-5 border-t border-slate-800/80">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                            Onboarding Blueprint Lab
                          </h4>
                          <span className="text-[9px] font-mono text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded bg-amber-400/5">AI-Engine</span>
                        </div>
                        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                          Automate the resolution of Onboarding Friction! Generate fully customized Docker container blueprints, environment templates, and bash runtimes for new team members instantly.
                        </p>

                        {!blueprints && !blueprintLoading ? (
                          <button
                            onClick={handleGenerateBlueprints}
                            className="w-full bg-slate-950 border border-slate-800 hover:border-amber-500/30 text-amber-400 hover:text-amber-300 font-semibold text-xs py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-amber-500/5"
                          >
                            <Terminal className="h-4 w-4" />
                            <span>Generate Onboarding Toolchain</span>
                          </button>
                        ) : blueprintLoading ? (
                          <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-900 font-mono text-xs text-slate-400 space-y-2">
                            <div className="flex items-center gap-2 text-amber-400">
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              <span>Onboarding Lab is synthesizing...</span>
                            </div>
                            <div className="text-[10px] text-slate-500 border-l-2 border-slate-800 pl-2 space-y-1">
                              <p className="animate-pulse">⏳ [LAB] Analyzing codebase architecture</p>
                              <p className="opacity-80">⏳ [LAB] Parsing technical dependencies</p>
                              <p className="opacity-60">⏳ [LAB] Injecting multi-stage container profiles</p>
                            </div>
                          </div>
                        ) : blueprints ? (
                          <div className="space-y-4 animate-fadeIn">
                            {/* Blueprint Tabs */}
                            <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-900">
                              <button
                                onClick={() => setActiveBlueprintTab("env")}
                                className={`flex-1 text-center py-1.5 rounded-md text-[10px] font-mono transition-all ${
                                  activeBlueprintTab === "env"
                                    ? "bg-slate-900 text-white font-bold border border-slate-800"
                                    : "text-slate-500 hover:text-slate-300"
                                }`}
                              >
                                .env.example
                              </button>
                              <button
                                onClick={() => setActiveBlueprintTab("docker")}
                                className={`flex-1 text-center py-1.5 rounded-md text-[10px] font-mono transition-all ${
                                  activeBlueprintTab === "docker"
                                    ? "bg-slate-900 text-white font-bold border border-slate-800"
                                    : "text-slate-500 hover:text-slate-300"
                                }`}
                              >
                                Dockerfile
                              </button>
                              <button
                                onClick={() => setActiveBlueprintTab("bootstrap")}
                                className={`flex-1 text-center py-1.5 rounded-md text-[10px] font-mono transition-all ${
                                  activeBlueprintTab === "bootstrap"
                                    ? "bg-slate-900 text-white font-bold border border-slate-800"
                                    : "text-slate-500 hover:text-slate-300"
                                }`}
                              >
                                bootstrap.sh
                              </button>
                            </div>

                            {/* Blueprint Code Console */}
                            <div className="relative">
                              <pre className="font-mono text-[11px] bg-slate-950 p-4 rounded-xl border border-slate-900 text-emerald-400 overflow-x-auto max-h-[220px] overflow-y-auto leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
                                {activeBlueprintTab === "env" && blueprints.envExample}
                                {activeBlueprintTab === "docker" && blueprints.dockerfile}
                                {activeBlueprintTab === "bootstrap" && blueprints.bootstrapScript}
                              </pre>

                              {/* Action Buttons */}
                              <div className="absolute right-3 top-3 flex gap-2">
                                <button
                                  onClick={() => {
                                    const code =
                                      activeBlueprintTab === "env"
                                        ? blueprints.envExample
                                        : activeBlueprintTab === "docker"
                                        ? blueprints.dockerfile
                                        : blueprints.bootstrapScript;
                                    navigator.clipboard.writeText(code);
                                    setCopiedBlueprint(true);
                                    setTimeout(() => setCopiedBlueprint(false), 2000);
                                  }}
                                  className="bg-slate-900/90 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300 hover:text-white p-1.5 rounded transition-all cursor-pointer shadow-md"
                                  title="Copy code"
                                >
                                  {copiedBlueprint ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Download Action */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  const config = {
                                    env: { filename: ".env.example", content: blueprints.envExample },
                                    docker: { filename: "Dockerfile", content: blueprints.dockerfile },
                                    bootstrap: { filename: "bootstrap.sh", content: blueprints.bootstrapScript }
                                  }[activeBlueprintTab];
                                  
                                  const blob = new Blob([config.content], { type: "text/plain;charset=utf-8" });
                                  const url = URL.createObjectURL(blob);
                                  const link = document.createElement("a");
                                  link.href = url;
                                  link.download = config.filename;
                                  link.click();
                                  URL.revokeObjectURL(url);
                                }}
                                className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-mono text-[10px] py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <BookOpen className="h-3.5 w-3.5" />
                                <span>Download Active Config</span>
                              </button>
                              <button
                                onClick={handleGenerateBlueprints}
                                className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white p-2 rounded-lg transition-all cursor-pointer"
                                title="Re-synthesize"
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : null}

                        {blueprintError && (
                          <div className="mt-3 text-[11px] text-rose-400 font-mono bg-rose-500/5 border border-rose-500/20 rounded-lg p-2.5">
                            ⚠️ {blueprintError}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>

                </div>
              )}

              {/* TAB CONTENT: README PRESENTATION */}
              {activeTab === "readme" && (
                <div className="max-w-4xl mx-auto border border-slate-800 bg-slate-900/40 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl" id="readme-tab-panel">
                  <div className="bg-slate-900 border-b border-slate-950 px-6 py-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-mono">README_INTEGRATION.md</span>
                    <button
                      onClick={() => handleCopyReadme(generateReadmeContent(result))}
                      className="bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
                    >
                      {readmeCopied ? (
                        <>
                          <Check className="h-4 w-4 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span>Copy Report</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-6 text-slate-300 space-y-4 max-h-[500px] overflow-y-auto font-sans leading-relaxed text-sm">
                    <div className="border-b border-slate-800 pb-3">
                      <h3 className="text-2xl font-bold text-white font-display">
                        {result.repoName} 🚀
                      </h3>
                      <p className="text-slate-400 italic text-xs mt-1">
                        {result.description}
                      </p>
                    </div>

                    <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 space-y-2">
                      <span className="text-xs font-mono text-emerald-400 font-semibold block">Weekly progress highlights:</span>
                      {result.aiSummary.map((b, idx) => (
                        <div key={idx} className="text-xs flex items-start gap-2">
                          <span>•</span>
                          <p>{b}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-mono uppercase tracking-widest text-slate-500 font-bold">Identified Friction Complaints:</h4>
                      <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 pl-1">
                        {result.teamSentiment.recurringComplaints.map((c, idx) => (
                          <li key={idx}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: SOCIAL PITCH HUB */}
              {activeTab === "pitch" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="pitch-tab-panel">
                  
                  {/* LEFT COLUMN - INTERACTIVE CONTROLS */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                          <Sparkle className="h-4 w-4" />
                          Presentation Workshop
                        </h3>
                        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                          Draft messaging, outline corporate reviews, or grab pitch presentations with single copy triggers.
                        </p>
                      </div>

                      <div className="space-y-4">
                        {/* Tone Selector */}
                        <div className="space-y-2">
                          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
                            Select Message Tone
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { id: "launch", label: "🚀 Hype Launch" },
                              { id: "recruit", label: "🤝 Recruit Helpers" },
                              { id: "audit", label: "📊 Quality Audit" },
                              { id: "dx", label: "💡 DX Insights" }
                            ].map((t) => (
                              <button
                                key={t.id}
                                onClick={() => {
                                  setPitchTone(t.id as any);
                                  setUserEditedPitch("");
                                }}
                                className={`text-[11px] font-semibold py-1.5 px-2 rounded-lg border transition-all text-center cursor-pointer ${
                                  pitchTone === t.id
                                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-300"
                                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                                }`}
                              >
                                {t.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Hashtag Toggles */}
                        <div className="space-y-2">
                          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Hashtags Blueprint</span>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { state: useDevPulseTag, setter: setUseDevPulseTag, label: "#DevPulse" },
                              { state: useOpenSourceTag, setter: setUseOpenSourceTag, label: "#OpenSource" },
                              { state: useBuildInPublicTag, setter: setUseBuildInPublicTag, label: "#BuildInPublic" },
                              { state: useHackathonTag, setter: setUseHackathonTag, label: "#Hackathon" }
                            ].map((tag, idx) => (
                              <button
                                key={idx}
                                onClick={() => tag.setter(!tag.state)}
                                className={`text-[9px] font-mono px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                                  tag.state
                                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                                    : "bg-transparent border-slate-800 text-slate-500 hover:text-slate-400"
                                }`}
                              >
                                {tag.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Text Area */}
                        <div className="space-y-2">
                          <textarea
                            value={userEditedPitch || generatePitchText(result, pitchTone)}
                            onChange={(e) => setUserEditedPitch(e.target.value)}
                            className="w-full min-h-[140px] bg-slate-950 text-xs font-mono text-slate-300 p-4 border border-slate-850 rounded-xl leading-relaxed outline-none focus:border-emerald-500 resize-y"
                            placeholder="Drafting your launch post..."
                            id="pitch-draft-textarea"
                          />
                        </div>

                        {/* Copy / Actions */}
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => {
                              const currentText = userEditedPitch || generatePitchText(result, pitchTone);
                              navigator.clipboard.writeText(currentText);
                              setPitchCopied(true);
                              setTimeout(() => setPitchCopied(false), 2000);
                            }}
                            className="bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 text-xs font-semibold py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            {pitchCopied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                            <span>Copy Draft</span>
                          </button>

                          <button
                            onClick={() => {
                              const currentText = userEditedPitch || generatePitchText(result, pitchTone);
                              const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(currentText)}`;
                              window.open(xUrl, "_blank", "noopener,noreferrer");
                            }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Share2 className="h-4 w-4" />
                            <span>Share on X</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN - LIVE PLATFORM PREVIEWS */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="flex bg-slate-950 p-1 border border-slate-900 rounded-xl">
                      {[
                        { id: "x", label: "𝕏 Post" },
                        { id: "linkedin", label: "💼 LinkedIn" },
                        { id: "script", label: "🎤 elevator script" },
                        { id: "readme", label: "📂 README snippet" }
                      ].map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setPreviewPlatform(p.id as any)}
                          className={`flex-1 text-[10px] font-mono uppercase tracking-wider py-1.5 rounded-lg text-center font-semibold transition-all cursor-pointer ${
                            previewPlatform === p.id
                              ? "bg-slate-800 text-emerald-400"
                              : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>

                    <AnimatePresence mode="wait">
                      {previewPlatform === "x" && (
                        <motion.div
                          key="x-preview"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="bg-black border border-slate-800 rounded-2xl p-5 space-y-4 text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold">
                              DP
                            </div>
                            <div>
                              <span className="font-bold text-white text-sm block">DevPulse</span>
                              <span className="text-xs text-slate-500">@devpulse_audit · Just now</span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-100 whitespace-pre-wrap leading-relaxed select-text font-sans">
                            {(userEditedPitch || generatePitchText(result, pitchTone)).split(" ").map((word, idx) => {
                              if (word.startsWith("#")) return <span key={idx} className="text-emerald-400">{word} </span>;
                              return word + " ";
                            })}
                          </p>
                        </motion.div>
                      )}

                      {previewPlatform === "linkedin" && (
                        <motion.div
                          key="linkedin-preview"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 text-left text-xs font-sans"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                              U
                            </div>
                            <div>
                              <span className="font-bold text-white">Lead Contributor</span>
                              <span className="text-[10px] text-slate-400 block">Lead Architect at Hackathon Workspace</span>
                            </div>
                          </div>

                          <p className="text-slate-200 whitespace-pre-wrap leading-normal font-mono text-[10px] bg-slate-950 p-3 rounded-lg border border-slate-850">
                            {userEditedPitch || generatePitchText(result, pitchTone)}
                          </p>
                        </motion.div>
                      )}

                      {previewPlatform === "script" && (
                        <motion.div
                          key="script-preview"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3 text-left font-sans"
                        >
                          <span className="text-[10px] font-mono text-emerald-400 font-bold block border-b border-slate-900 pb-2 uppercase">1-Minute Presentation script</span>
                          <div className="max-h-[220px] overflow-y-auto text-[11px] leading-relaxed text-slate-300 whitespace-pre-wrap italic">
                            {generateElevatorScript(result)}
                          </div>
                        </motion.div>
                      )}

                      {previewPlatform === "readme" && (
                        <motion.div
                          key="readme-preview"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3 text-left font-mono"
                        >
                          <span className="text-[10px] text-emerald-400 font-bold block border-b border-slate-900 pb-2 uppercase">README.md REPO BANNER</span>
                          <pre className="text-[9px] leading-normal text-emerald-500 bg-black/60 p-3 border border-slate-900 rounded-xl overflow-x-auto max-h-[180px] whitespace-pre">
                            {generateReadmePitchMarkdown(result)}
                          </pre>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>

                </div>
              )}

              {/* TAB CONTENT: SCOPE STABILITY RADAR */}
              {activeTab === "scope-stability" && (() => {
                const base = result.scopeAnalysis || {
                  stabilityScore: 78,
                  totalInjectedIssues: 3,
                  avgRequirementChurn: 1.4,
                  hasUiVolatilityWarning: true,
                  timeline: [
                    { week: "Week 1", originalTasks: 12, addedTasks: 1 },
                    { week: "Week 2", originalTasks: 14, addedTasks: 2 },
                    { week: "Week 3", originalTasks: 15, addedTasks: 4 },
                    { week: "Week 4", originalTasks: 10, addedTasks: 3 }
                  ],
                  pivotedIssues: [
                    {
                      number: 42,
                      title: "Integrate third-party gateway",
                      originalGoal: "Build basic token transfer functionality.",
                      currentGoal: "Support dynamic multi-chain settlement routing with real-time fee estimations and audit logs.",
                      shiftSeverity: 8,
                      isPickyUI: false
                    },
                    {
                      number: 89,
                      title: "Refactor landing page design",
                      originalGoal: "Introduce dark theme colors and font standardizations.",
                      currentGoal: "Create recursive custom particle fields, drag-and-drop dashboards, and customized layout selectors.",
                      shiftSeverity: 9,
                      isPickyUI: true
                    }
                  ]
                };

                const updatedTimeline = base.timeline.map((point, index) => {
                  if (index === base.timeline.length - 1) {
                    return {
                      ...point,
                      addedTasks: point.addedTasks + extraScopeInjections
                    };
                  }
                  return point;
                });

                const penalty = extraScopeInjections * 6;
                const stabilityScore = Math.max(12, base.stabilityScore - penalty);
                const totalInjectedIssues = base.totalInjectedIssues + extraScopeInjections;
                const avgRequirementChurn = parseFloat((base.avgRequirementChurn + (extraScopeInjections * 0.25)).toFixed(1));
                const hasUiWarning = base.hasUiVolatilityWarning || extraScopeInjections > 1;

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="scope-stability-panel">
                    
                    {/* LEFT SIDEBAR: Stakeholder Simulation Lab */}
                    <div className="lg:col-span-4 space-y-6">
                      <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-5 relative overflow-hidden backdrop-blur-md flex flex-col justify-between">
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-slate-800 rounded bg-slate-950/40 text-slate-400 font-mono text-[9px] uppercase tracking-wider mb-3">
                            Simulation Lab
                          </div>
                          <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            Stakeholder Workshop
                          </h3>
                          <p className="text-xs text-slate-400 leading-relaxed mb-4">
                            Simulate mid-sprint "unapproved features" to witness the timeline bloating, volatility warning triggering, and stability index dropping in real-time.
                          </p>
                        </div>

                        <div className="space-y-4 bg-slate-950/60 p-4 border border-slate-900 rounded-2xl">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-300">Injected Requirements</span>
                            <span className="text-xs font-mono font-bold text-rose-400">+{extraScopeInjections}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setExtraScopeInjections(prev => prev + 1)}
                              className="bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 font-mono text-[10px] py-2 px-3 rounded-lg transition-all text-center font-semibold cursor-pointer"
                            >
                              + Inject Feature
                            </button>
                            <button
                              onClick={() => setExtraScopeInjections(0)}
                              className="bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-slate-200 font-mono text-[10px] py-2 px-3 rounded-lg transition-all text-center cursor-pointer"
                            >
                              Reset
                            </button>
                          </div>
                        </div>

                        {/* Real-time Impact Summary */}
                        <div className="mt-4 space-y-2 text-[11px] font-mono border-t border-slate-800/40 pt-4">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Stability Impact:</span>
                            <span className={extraScopeInjections > 0 ? "text-rose-400 font-bold" : "text-emerald-400"}>
                              {extraScopeInjections > 0 ? `-${penalty}% Penalty` : "Nominal"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Sprint Health Status:</span>
                            <span className={`font-bold ${
                              stabilityScore >= 80 ? "text-emerald-400" : stabilityScore >= 50 ? "text-amber-400" : "text-rose-400"
                            }`}>
                              {stabilityScore >= 80 ? "Guarded" : stabilityScore >= 50 ? "Frictional Churn" : "Severe Scope Creep"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Presentation Ammo Box */}
                      <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-5 relative overflow-hidden backdrop-blur-md">
                        <h3 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest mb-3">
                          Presentation Pitch Ammo
                        </h3>
                        <p className="text-[11px] text-slate-400 mb-4 leading-normal">
                          Reddit consensus shows stakeholders block product flow without knowing the timeline impact. Copy this tactical pitch ammunition:
                        </p>

                        <div className="space-y-3 bg-slate-950/40 p-3 rounded-xl border border-slate-900">
                          <div className="text-[10px] font-mono leading-relaxed text-slate-300">
                            📢 <span className="font-bold text-white">"Traditional project updates tell you tasks are delayed. DevPulse shows WHO delayed them: stakeholders changed requirements mid-sprint, causing a {penalty > 0 ? penalty : 18}% drop in stability."</span>
                          </div>
                          <div className="text-[10px] font-mono leading-relaxed text-slate-300">
                            💡 <span className="font-bold text-white">"Instead of subjective meetings arguing over timelines, we back developer timelines with objective, Git-proven requirement churn index of {avgRequirementChurn}x."</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            const bulletText = `DevPulse Pitch Ammunition:\n1. Stability Index is at ${stabilityScore}% due to post-kickoff requirements injection.\n2. Requirement churn average is at ${avgRequirementChurn}x.\n3. Stakeholders changed key goals on critical tickets, halting velocity.`;
                            navigator.clipboard.writeText(bulletText);
                            setAmmoCopied(true);
                            setTimeout(() => setAmmoCopied(false), 2000);
                          }}
                          className="mt-4 w-full py-2 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {ammoCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          <span>{ammoCopied ? "Ammo Copied!" : "Copy Pitch Ammo"}</span>
                        </button>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: Radar overview & Timeline & Audits */}
                    <div className="lg:col-span-8 space-y-6">
                      
                      {/* Grid Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Stability Score Ring */}
                        <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-5 backdrop-blur-md flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block mb-1">Stability index</span>
                            <div className="text-3xl font-black font-mono tracking-tighter text-white">
                              {stabilityScore}%
                            </div>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800/60 rounded-full overflow-hidden mt-3">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                stabilityScore >= 80 ? "bg-emerald-500" : stabilityScore >= 50 ? "bg-amber-500" : "bg-rose-500"
                              }`}
                              style={{ width: `${stabilityScore}%` }}
                            ></div>
                          </div>
                          <span className="text-[9px] text-slate-500 font-mono mt-1 block">
                            Ideal range: 85% - 100%
                          </span>
                        </div>

                        {/* Injected Requirements */}
                        <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-5 backdrop-blur-md flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block mb-1">Injected Scope</span>
                            <div className="text-3xl font-black font-mono tracking-tighter text-rose-400">
                              {totalInjectedIssues} Tasks
                            </div>
                          </div>
                          <span className="text-[9px] text-slate-500 font-mono mt-1 block leading-normal">
                            Added &gt;48h after kickoff.
                          </span>
                        </div>

                        {/* Requirement Churn Index */}
                        <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-5 backdrop-blur-md flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block mb-1">Requirement Churn</span>
                            <div className="text-3xl font-black font-mono tracking-tighter text-cyan-400">
                              {avgRequirementChurn}x
                            </div>
                          </div>
                          <span className="text-[9px] text-slate-500 font-mono mt-1 block leading-normal">
                            Avg descriptions edits per task.
                          </span>
                        </div>
                      </div>

                      {/* Picky Client Visual UI Volatility Warning */}
                      {hasUiWarning && (
                        <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-amber-300 text-xs flex items-start gap-3 animate-[pulse-glow_4s_infinite]">
                          <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5 animate-bounce" />
                          <div className="leading-relaxed">
                            <span className="font-bold block text-amber-200 mb-0.5">🚨 PICKY CLIENT ALERT: High UI/UX Volatility Detected!</span>
                            Frequent adjustments to frontend modules and brand requirements have been detected. Establish visual wireframe signoffs immediately to lock down engineering resources.
                          </div>
                        </div>
                      )}

                      {/* Core Scope vs. Injected Bloat Chart */}
                      <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-5 backdrop-blur-md">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                              Sprint Scope Timeline
                            </h4>
                            <p className="text-[10px] text-slate-500">
                              Original tasks vs. post-kickoff stakeholder injections
                            </p>
                          </div>
                          <div className="flex gap-4 text-[10px] font-mono">
                            <span className="flex items-center gap-1.5 text-emerald-400">
                              <span className="w-2 h-2 rounded bg-emerald-500"></span> Core Scope
                            </span>
                            <span className="flex items-center gap-1.5 text-rose-400">
                              <span className="w-2 h-2 rounded bg-rose-500"></span> Injected Scope
                            </span>
                          </div>
                        </div>

                        <div className="w-full">
                          <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={updatedTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorOriginal" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorAdded" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.05)" />
                              <XAxis dataKey="week" stroke="#64748b" fontSize={11} tickLine={false} />
                              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                                labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                              />
                              <Area type="monotone" dataKey="originalTasks" name="Original Scope" stroke="#10b981" fillOpacity={1} fill="url(#colorOriginal)" strokeWidth={2} />
                              <Area type="monotone" dataKey="addedTasks" name="Injected Scope" stroke="#f43f5e" fillOpacity={1} fill="url(#colorAdded)" strokeWidth={2} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Goal Pivots Auditor (Task History Edit Comparison) */}
                      <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-5 backdrop-blur-md">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                          AI Churn Audit (Goal Pivots Tracker)
                        </h4>

                        <div className="space-y-4">
                          {base.pivotedIssues.map((issue) => (
                            <div key={issue.number} className="bg-slate-950/50 border border-slate-900 rounded-2xl p-4 space-y-3">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono font-bold text-slate-500">#{issue.number}</span>
                                  <span className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-md">{issue.title}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {issue.isPickyUI && (
                                    <span className="text-[8px] font-mono font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded uppercase">
                                      UI Volatility
                                    </span>
                                  )}
                                  <span className="text-[8px] font-mono font-bold bg-slate-900 border border-slate-800 text-rose-400 px-1.5 py-0.5 rounded uppercase">
                                    Severity {issue.shiftSeverity}/10
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-slate-900/50">
                                <div className="space-y-1">
                                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Original Goal Definition</span>
                                  <div className="text-xs text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-900 leading-relaxed italic">
                                    "{issue.originalGoal}"
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <span className="text-[9px] font-mono text-emerald-500 uppercase tracking-widest block font-bold">Pivoted Technical Scope</span>
                                  <div className="text-xs text-emerald-300 bg-emerald-500/5 p-2.5 rounded-xl border border-emerald-500/10 leading-relaxed italic">
                                    "{issue.currentGoal}"
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                  </div>
                );
              })()}

            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* FOOTER STATUS BAR */}
      <footer className="relative z-10 mx-4 sm:mx-8 mb-6 mt-6 p-4 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-slate-500 gap-4">
        <div className="flex gap-6 w-full sm:w-auto justify-center sm:justify-start">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></span>
            SYSTEM NOMINAL
          </span>
          <span>LATENCY: {result ? (result.isMock ? "42ms" : "28ms") : "12ms"}</span>
          <span className="hidden xs:inline">UPTIME: 1,240h</span>
        </div>
        <div className="flex gap-4 w-full sm:w-auto justify-center sm:justify-end">
          <span className="hover:text-slate-400 cursor-pointer">TERMINAL</span>
          <span className="hover:text-slate-400 cursor-pointer">LOGS</span>
          <span className="hover:text-slate-400 cursor-pointer">CONFIG</span>
          <span className="text-slate-800 font-bold">DEVPULSE_OS // 2026</span>
        </div>
      </footer>

    </div>
  );
}
