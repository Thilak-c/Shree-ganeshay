"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError("");

    const cleanCode = passcode.trim();
    if (!cleanCode) {
      setError("Please enter the 4-digit passcode.");
      inputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: cleanCode }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Incorrect passcode. Please try again.");
        setPasscode("");
        setIsSubmitting(false);
        inputRef.current?.focus();
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get("from") || "/";

      startTransition(() => {
        router.push(redirectUrl);
        router.refresh();
      });
    } catch {
      setError("Network connection error. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isSubmitting && !isPending) {
      handleSubmit(e);
    }
  };

  const isLoading = isSubmitting || isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans text-slate-800 antialiased">
      <div className="w-full max-w-sm">
        {/* Clinic Identity */}
        <div className="text-center mb-6">
        
          <h1 className="text-base font-bold text-slate-900 tracking-tight">
            Shri Ganesh Dental Lab
          </h1>
          
        </div>

        {/* Login Form Container */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
         
          <p className="text-xs text-slate-500 mb-4">
            Enter your 4-digit access passcode to continue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="passcode"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Passcode
              </label>
              <div className="relative">
                <input
                  id="passcode"
                  ref={inputRef}
                  type={showPasscode ? "text" : "password"}
                  inputMode="numeric"
                  autoComplete="current-password"
                  maxLength={16}
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    if (error) setError("");
                  }}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  placeholder="Enter passcode"
                  className={`w-full bg-white border text-slate-900 text-sm rounded-md pl-3 pr-10 py-2 outline-none transition-colors placeholder:text-slate-400 focus:ring-2 ${
                    error
                      ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                      : "border-slate-300 focus:border-teal-600 focus:ring-teal-50"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  tabIndex={-1}
                  aria-label={showPasscode ? "Hide passcode" : "Show passcode"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showPasscode ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Error Notice */}
              {error && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 mt-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !passcode}
              className="w-full inline-flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-medium py-2 px-4 rounded-md transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Unlocking...</span>
                </>
              ) : (
                <span>Unlock Portal</span>
              )}
            </button>
          </form>
        </div>

       
      </div>
    </div>
  );
}
