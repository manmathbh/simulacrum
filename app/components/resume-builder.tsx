"use client";

import { useState } from "react";

type ResumeExperience = {
  title: string;
  company: string;
  duration: string;
};

type ResumeEducation = {
  degree: string;
  institution: string;
  year: string;
};

export interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
}

const defaultResumeData: ResumeData = {
  fullName: "",
  email: "",
  phone: "",
  summary: "",
  experience: [{ title: "", company: "", duration: "" }],
  education: [{ degree: "", institution: "", year: "" }],
};

export function ResumeBuilder() {
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);

  const updateField = (field: keyof Omit<ResumeData, "experience" | "education">) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setResumeData((prev) => ({ ...prev, [field]: value }));
    };

  return (
    <section className="flex-1 px-6 pb-8 sm:px-8">
      <div className="grid h-full grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-lg">
          <h3 className="text-xl font-bold tracking-tight text-white">Resume Editor</h3>
          <p className="mt-1 text-sm text-indigo-200">
            Fill in your details to generate a live resume preview.
          </p>

          <div className="mt-6 max-h-[72vh] space-y-4 overflow-y-auto pr-1">
            <div>
              <label htmlFor="resume-full-name" className="block text-sm font-medium text-slate-200">
                Full Name
              </label>
              <input
                id="resume-full-name"
                type="text"
                value={resumeData.fullName}
                onChange={updateField("fullName")}
                placeholder="Jane Doe"
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 outline-none transition focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div>
              <label htmlFor="resume-email" className="block text-sm font-medium text-slate-200">
                Email
              </label>
              <input
                id="resume-email"
                type="email"
                value={resumeData.email}
                onChange={updateField("email")}
                placeholder="jane.doe@email.com"
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 outline-none transition focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div>
              <label htmlFor="resume-phone" className="block text-sm font-medium text-slate-200">
                Phone
              </label>
              <input
                id="resume-phone"
                type="tel"
                value={resumeData.phone}
                onChange={updateField("phone")}
                placeholder="+1 (555) 123-4567"
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 outline-none transition focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div>
              <label htmlFor="resume-summary" className="block text-sm font-medium text-slate-200">
                Summary
              </label>
              <textarea
                id="resume-summary"
                value={resumeData.summary}
                onChange={updateField("summary")}
                rows={6}
                placeholder="Write a concise professional summary..."
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 outline-none transition focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-300/30 p-5 backdrop-blur-sm">
          <div className="flex h-full items-center justify-center">
            <div className="aspect-[1/1.414] w-full max-w-[640px] bg-white p-8 text-black shadow-2xl">
              <header>
                <h4 className="text-3xl font-bold tracking-tight text-black">
                  {resumeData.fullName || "Your Name"}
                </h4>
                <p className="mt-1 text-sm text-slate-700">
                  {resumeData.email || "your.email@example.com"}
                  {resumeData.phone ? ` | ${resumeData.phone}` : ""}
                </p>
              </header>

              <section className="mt-8">
                <h5 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Professional Summary
                </h5>
                <p className="mt-2 text-sm leading-relaxed text-slate-800">
                  {resumeData.summary ||
                    "Your summary will appear here in real time as you type on the left."}
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
