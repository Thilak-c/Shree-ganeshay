import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  Scale,
  ArrowLeft,
  XCircle,
  Clock
} from "lucide-react";

export const metadata = {
  title: "Terms & Conditions - Shri Ganesh Dental",
  description:
    "Warranty terms, coverage exclusions, and mandatory conditions for dental restorations and prosthetics.",
};

const exclusions = [
  "Cash refund for prosthesis.",
  "Cash involved for removal or insertion, lost wages, chair time, or pain & suffering.",
  "Repair resulting from accident, alteration done on zirconia base, failure of supportive tooth or tissue structure, or improper dental hygiene.",
  "Shipping cost for repairs.",
  "Dental fees for repair and replacement of prosthesis.",
];

const requirements = [
  {
    title: "Licensed Dentist Insertion",
    description: "Prosthesis must be inserted by a licensed practicing dentist.",
  },
  {
    title: "Original Model & Warranty Card",
    description:
      "Dental prosthesis must be returned with the original model and warranty card in order for remake of prosthesis.",
  },
  {
    title: "Legal Jurisdiction",
    description: "Subject to Patna courts jurisdiction only.",
  },
  {
    title: "Policy Updates",
    description: "Warranty terms & conditions are subject to change without notice.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
      <div className="max-w-2xl mx-auto w-full">
        {/* Navigation & Clinic Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-teal-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Portal</span>
          </Link>
          <span className="text-[11px] font-medium tracking-wide text-teal-800 uppercase bg-teal-50 border border-teal-200/60 px-2 py-0.5 rounded">
            Official Warranty Policy
          </span>
        </div>

        <div className="text-center pb-6 mb-6 border-b border-slate-200">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-xs sm:text-sm text-teal-800 font-medium mt-1">
            Shri Ganesh Dental
          </p>
          <div className="mt-3 inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-3 py-1 rounded-full text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Your dental restoration is warranted by lab</span>
          </div>
        </div>

        <div className="space-y-6">
          {/* Coverage Section */}
          <section className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 shadow-2xs">
            <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
              <div className="p-2 rounded-md bg-teal-50 text-teal-700">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Coverage Under Warranty
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Scope covers repair or replacement of prosthesis done by us.
                </p>
              </div>
            </div>

            {/* Exclusions */}
            <div className="mt-5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 uppercase tracking-wide mb-3">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Warranty Does Not Cover</span>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                {exclusions.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Mandatory Requirements Section */}
          <section className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 shadow-2xs">
            <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
              <div className="p-2 rounded-md bg-slate-100 text-slate-700">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Mandatory for Warranty to Apply
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  The following requirements must be met for any claim or remake.
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {requirements.map((req, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-200/80 rounded-md p-3.5"
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                    <span className="w-4 h-4 rounded-full bg-teal-700 text-white text-[10px] flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    {req.title}
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {req.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
              <span className="inline-flex items-center gap-1">
                <Scale className="w-3 h-3 text-slate-400" />
                Jurisdiction: Patna Courts Only
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                Terms subject to change without notice
              </span>
            </div>
          </section>
        </div>
      </div>

      <footer className="text-center text-[11px] text-slate-400 py-6 mt-6">
        © {new Date().getFullYear()} Shri Ganesh Dental. All rights reserved.
      </footer>
    </div>
  );
}
