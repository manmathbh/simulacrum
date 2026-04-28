# ✨ Simulacrum: AI-Powered Career Suite

[![Live Demo](https://img.shields.io/badge/Live_Demo-simulacrum--xi.manmath.app-blue?style=for-the-badge)](https://simulacrum-xi.manmath.app)

Simulacrum is a production-grade, full-stack SaaS application designed to help job seekers master their next tech interview. It combines a real-time AI mock interview engine with an intelligent, ATS-friendly resume builder.

## 🚀 Features

* **🎙️ AI Mock Interviews:** Practice with real-time AI coaching, scenario-based questions, and live communication feedback.
* **📄 Dynamic Resume Builder:** A WYSIWYG split-screen editor that generates live, ATS-compliant PDF resumes.
* **🎯 AI Resume Tailoring (JD Match):** Input a target Job Description, and the AI will dynamically rewrite your experience bullet points to highlight the exact skills recruiters are looking for.
* **🔒 Secure Authentication:** Protected user sessions using Google OAuth.
* **📊 Analytics Engine:** Local storage-based tracking for interview confidence, clarity, and grammar trends over time.

## 💻 Tech Stack

* **Framework:** [Next.js](https://nextjs.org/) (App Router)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Dark Mode Glassmorphism UI)
* **AI Integration:** [OpenRouter API](https://openrouter.ai/) 
* **Authentication:** [NextAuth.js](https://next-auth.js.org/) (Google Provider)
* **Deployment:** [Vercel](https://vercel.com/)

## 🛠️ Getting Started (Local Development)

If you'd like to run this project locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/manmathbh/simulacrum.git](https://github.com/manmathbh/simulacrum.git)
   cd simulacrum

2. Install dependencies:

Bash
npm install
3. Set up environment variables:
Create a .env.local file in the root directory and add your keys:

Code snippet
OPENROUTER_API_KEY=your_openrouter_key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret

4. Run the development server:

Bash
npm run dev
Open http://localhost:3000 in your browser.

🚧 Work in Progress
Simulacrum is currently live, but I am still actively building and adding amazing new features! Upcoming Roadmap:

[ ] LinkedIn Bio Generator based on Resume Data

[ ] AI-driven cover letter generation

[ ] Enhanced analytics dashboard for interview progress

[ ] Persistent cloud storage for multiple resume versions

💬 Feedback & Contributions
I am actively looking for feedback to improve the platform! If you have feature requests, spot a bug, or have suggestions on the UI/UX, please open an issue or reach out to me.

If you are a developer and want to contribute, feel free to fork the repository and submit a pull request!

Built by Manmath Hatte


***