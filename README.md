# CareerForge AI
### Autonomous Multi-Agent Job Application & Career Optimization Engine
*Yash & Prerna — Final Year Project*

---

## 1. What this is

CareerForge AI is a full-stack web platform that automates the job search process end to end
using a **coordinated pipeline of five specialist AI agents**, instead of a single chatbot that
only answers questions:

| Agent | Job |
|---|---|
| **Resume Agent** | Parses the uploaded resume and extracts verified skills |
| **Scout Agent** | Scans live job listings and ranks them by fit against those skills |
| **Tailor Agent** | Rewrites the application to speak directly to a chosen role |
| **Application Agent** | Assembles and submits the application package |
| **Tracker Agent** | Monitors every submitted application and advances its status |

This is what makes the project **agentic** rather than a simple RAG/Q&A demo: each agent hands
work to the next, the way a real team would, and the user can watch the relay run live.

## 2. Tech stack

- **Frontend:** React 19 + Vite, React Router, Tailwind CSS, Recharts, lucide-react icons
- **State / "backend" for this demo:** a React Context store backed by `localStorage`, so the
  whole app runs standalone and deploys as a static site on Vercel with zero server cost
- **Intended production backend** (documented for the project report, not required to run the
  demo): Java Spring Boot REST APIs + Spring Security (JWT) + PostgreSQL/MySQL, with a Python
  microservice running LangGraph/CrewAI for the real agent orchestration and an LLM (OpenAI API
  or a local Llama model via Ollama) behind it

## 3. Features

- Landing page explaining the multi-agent pipeline with an animated "Agent Relay" visual
- Email/password signup & login (mock auth, stored locally per browser)
- Resume upload (.txt, or paste resume text) with live skill extraction
- 1,240+ generated mock job listings, searchable and filterable by keyword, city, and work mode
- Real-time match-score badge on every listing, computed against the user's extracted skills
- A live, animated agent-pipeline run when applying to a role, with a scrolling log panel
- Applications tracker with a 4-stage progress bar (Submitted -> Under Review -> Interview -> Offer)
- User dashboard with charts: applications by stage, and market-fit distribution across all jobs
- Admin console (separate login) with platform-wide stats and charts
- Fully responsive, dark "forge" visual identity with a custom logo, distinctive type system, and
  a signature animated relay component reused across the app

## 4. Running locally

```bash
npm install
npm run dev
```
Visit the URL Vite prints (usually `http://localhost:5173`).

To build a production bundle:
```bash
npm run build
npm run preview
```

## 5. Demo accounts

- **New user:** sign up with any name/email/password from the Sign Up page.
- **Admin console:** on the Login page, click "Use admin demo credentials", or log in manually with:
  - email: `admin@careerforge.ai`
  - password: `admin123`

All data (accounts, resumes, applications) is stored in the browser's `localStorage`, scoped per
browser/device -- there is no shared server database in this demo build.

## 6. Deploying to Vercel

1. Push this folder to a GitHub repository.
2. Go to vercel.com -> **Add New Project** -> import the repository.
3. Vercel auto-detects the Vite framework preset. Leave the defaults:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Click **Deploy**. Your live URL will look like `https://careerforge-ai.vercel.app`.
5. Every future push to the connected branch redeploys automatically -- this is what gives you a
   permanent, free-tier live link to put on your project report and demo in front of your panel.

`vercel.json` is already included so client-side routes (`/jobs`, `/dashboard`, etc.) work
correctly on refresh and direct link.

## 7. Project structure

```
src/
  components/     Logo, Navbar, Footer, AgentRelay, JobCard, ProtectedRoute
  context/        StoreContext.jsx -- auth + resume + applications state (localStorage-backed)
  data/           jobs.js -- seeded generator for 1,240+ mock job listings
  pages/          Landing, Login, Signup, Dashboard, ResumeUpload, Jobs, JobDetail,
                  Applications, Admin, NotFound
```

## 8. Real-world relevance (for viva / report)

Job seekers routinely spend hours rewriting the same resume for dozens of postings and then lose
track of what they applied to. CareerForge AI's architecture demonstrates how a multi-agent
system can absorb that repetitive, multi-step workload -- extraction, search, tailoring,
submission, tracking -- rather than only answering isolated questions, which is the direction the
industry's own agentic-AI tooling (LangGraph, CrewAI, AutoGen) is heading toward.

## 9. Suggested next steps if extending beyond the demo

- Replace the mock auth/localStorage layer with real Spring Boot + JWT + PostgreSQL
- Replace the simulated agent pipeline with an actual LangGraph/CrewAI service calling an LLM
- Integrate a real job-board API (e.g. Adzuna, LinkedIn Jobs API) in place of generated listings
- Add real resume parsing (Apache PDFBox / pdfplumber) instead of keyword matching on pasted text
