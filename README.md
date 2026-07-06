This is the **Master README.md**, fully updated to include every technical sub-feature, the mathematical formulas, and the specific workshop tools you’ve built. It is structured to maximize your score in the **OpenNova Hackathon.**

---

# DevPulse (v2.4.0) — The AI Engineering Cockpit

> **"Quantifying the unquantifiable."**  
> DevPulse is an immersive telemetry dashboard that exposes the hidden human and technical friction slowing down software teams. From "Ghosted PRs" to "Stakeholder Scope Creep," we turn Git noise into actionable intelligence.

---

## Demo & Links
*   **Live Demo Video:** [https://youtu.be/4GYpBQMI2_4]
*   **GitHub Repository:** [https://github.com/JewellGomes/devPulseApp](https://github.com/JewellGomes/devPulseApp)

---

## Hackathon Information
*   **Problem Statement:** Build an innovative solution that solves a real-world problem using technology.
*   **The Problem:** Most development failures aren't caused by bad code, but by **process friction**: unreviewed PRs, developer burnout from context-switching, and "In Limbo" projects caused by silent scope creep.
*   **The Solution:** An AI-driven "Human Vitals" engine that uses GitHub telemetry to protect developer focus and project stability.

---

## Feature 1: Immersive Cockpit
The primary mission control for engineering leads to monitor real-time team health:
*   **Neglect Map (Ghosted PRs):** Tracks Pull Requests aging over 24 hours with no external reviews. Features a **"Nudge Reviewers"** trigger.
*   **Hotspot Radar:** Identifies "Spaghetti Code" hotspots with high frequency churn (>20%).
*   **Context-Switching Tax:** Monitors cognitive friction based on the number of modules a dev touches per day.
*   **Culture & Shadow Work:** Tracks "Force Multipliers"—developers who enable others through reviews and mentoring (Shadow Multiplier).

## Feature 2: Code Quality Audit
AI-driven analysis of the repository's technical and emotional velocity:
*   **AI Progress Pulse:** Summarizes weekly technical wins and cleanup efforts using Gemini AI.
*   **Developer Sentiment Velocity Over Time:** A chronological Recharts graph tracking team morale and "Vibe" based on issue discussions.
*   **Refactor Radar (Technical Debt):** Scans source files to identify hotspots and provides AI-recommended refactoring snippets for debt reduction.
*   **Team Sentiment Analysis:** Flags "Constant Rework" and "Shifting Definitions" as high-friction warnings.
*   **Telemetry Scientific Formulas & Mathematical Rigor:**
    To ensure objective accuracy, DevPulse calculates engineering indicators using these proprietary models:
    1.  **Context-Switching Tax:** $\text{Fragmentation Index} = \frac{\text{Modules Touched}}{\text{Days Active}}$
    2.  **Neglect & Ghost Review Latency:** $\text{Neglect Score} = \text{Decay Hours} \times e^{-0.2 \times \text{Comments}}$
    3.  **Shadow Work & Culture Ratio:** $\text{Shadow Multiplier} = \frac{\text{Comments} + \text{Reviews}}{\text{Commits}}$
    4.  **Hotspots & Code Debt Churn:** $\text{File Risk} = \text{Commits Touched} \times \log(\text{Complexity Delta})$

## Feature 3: Risk & Readiness
Preparing the project for the "Real World" and new contributors:
*   **Bus Factor Risk Assessment:** Identifies knowledge silos where modules are owned by a single developer.
*   **Onboarding Friction Gauge:** A 0-100 score measuring how hard it is for a new dev to set up.
*   **Onboarding Blueprint Lab:** AI-Engine that **generates** missing setup files like `.env`, `Dockerfile`, and `bootstrap.sh` on demand.

## Feature 4: Scope Stability & Stakeholder Workshop
The defensive layer against project bloat and "Picky Clients":
*   **Stakeholder Workshop (Simulation Lab):** Use the **"Inject Feature"** and **"Reset"** buttons to simulate mid-sprint requirement changes and see the immediate impact on stability.
*   **AI Churn Audit (Goal Pivots Tracker):** AI-powered analysis that detects when an Issue's "Definition of Done" has shifted from its original goal.
*   **Sprint Scope Timeline:** A comparative visualization of **Core Scope** vs. **Injected Stakeholder Scope**.
*   **Requirement Churn Score:** A live index (e.g., 4.7x) calculating the average description edits per task.
*   **Presentation Pitch Ammo:** Tactical, data-backed scripts for developers to defend their timelines in meetings using objective Git metrics.
*   **Picky Client Alert:** High UI/UX Volatility detection for frontend-heavy churn.

## Feature 5: README & Social Hub
*   **README.md Snippet:** Generates a professional integration report for stakeholders.
*   **Social Pitch Hub:** A presentation workshop to draft "Hype Launches," "Quality Audits," or "DX Insights" for X (Twitter) and LinkedIn.

---

## Telemetry Scientific Formulas & Mathematical Rigor
DevPulse uses objective algorithmic models to drive its indicators:
1.  **Context-Switching Tax:** $Fragmentation Index = Modules Touched / Days Active$
2.  **Neglect & Ghost Review Latency:** $Neglect Score = Decay Hours * e^{(-0.2 * Comments)}$
3.  **Shadow Work & Culture Ratio:** $Shadow Multiplier = (Comments + Reviews) / Commits$
4.  **Hotspots & Code Debt Churn:** $File Risk = Commits Touched * log(Complexity Delta)$
5.  **Requirement Churn:** $Avg description edits / task$

---

## Technical Implementation
*   **Stack:** Next.js 14, Node.js, Express, Tailwind CSS, Framer Motion, Recharts.
*   **API:** Octokit (GitHub REST & GraphQL) for deep history fetching.
*   **AI:** Google Gemini 1.5 Flash for high-speed sentiment/churn auditing.
*   **Architecture:** Modular "Telemetry Engine" that processes raw Git events into human-centric vitals.

---

## Judging Criteria Alignment

| Criteria | DevPulse Implementation |
| :--- | :--- |
| **Innovation** | First-of-its-kind "Stakeholder Workshop" to simulate and quantify scope creep. |
| **Practical Use** | Solves the #1 developer complaint: invisible work and unmanaged requirement shifts. |
| **UI/UX** | Immersive "Cockpit" design with glassmorphism, dark-mode terminal aesthetics, and real-time simulations. |
| **Technical** | Advanced use of GitHub API, AI schema-validation, and complex mathematical decay models. |
| **Presentation** | Built-in "Pitch Ammo" and "Social Pitch Hub" ensures the project is demo-ready for any audience. |

---

## Setup Instructions

1. **Clone:** `git clone https://github.com/JewellGomes/kitaCareAI.git`
2. **Install:** `npm install`
3. **Environment:** Create `.env` with `GITHUB_TOKEN` and `GEMINI_API_KEY`.
4. **Launch:** `npm run dev`

---
**Created by Jewell Gomes**  
## Team Details
**Project Type:** Solo Developer
**Developer:** Jewell Eudocia Gomes
**Role:** Full-Stack Developer, AI Engineer, & UI/UX Designer
**SkillValix Profile:** https://www.skillvalix.com/u/6a4611fce30a0191427733a7
*Submitted for the OpenNova Hackathon — Build Ideas That Matter.*