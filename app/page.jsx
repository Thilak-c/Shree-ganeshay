"use client";

import { useState, useRef, useEffect } from "react";
import QRCode from "qrcode";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
  CreditCard,
  Download,
  Printer,
  Share2,
  Copy,
  Check,
  RefreshCw,
  FilePlus,
  ArrowRight
} from "lucide-react";

const generateShortId = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

export default function CardGenerator() {
  const [data, setData] = useState({
    id: "",
    patient: "",
    doctor: "",
    doctorMobile: "",
    lab: "",
    labMobile: "",
    caseId: "",
    validFrom: "",
    validTo: "",
  });

  const [side, setSide] = useState("back");
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const cardRef = useRef(null);

  const addCard = useMutation(api.cards.addCard);

  // Initialize random Card ID on client mount to prevent SSR hydration mismatch
  useEffect(() => {
    setData((prev) => (prev.id ? prev : { ...prev, id: generateShortId() }));
  }, []);

  // Generate QR code for verification URL
  useEffect(() => {
    const generate = async () => {
      if (!data.id) return;
      try {
        const origin =
          typeof window !== "undefined"
            ? window.location.origin
            : "https://shree-ganeshay.vercel.app";
        const url = `${origin}/c/${data.id}`;
        const d = await QRCode.toDataURL(url, {
          width: 320,
          margin: 1,
          color: {
            dark: "#1e293b",
            light: "#ffffff",
          },
          errorCorrectionLevel: "H",
        });
        setQrDataUrl(d);
      } catch (err) {
        console.error("QR generation failed:", err);
        setQrDataUrl(null);
      }
    };
    generate();
  }, [data.id]);

  const handleChange = (e) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (savedSuccess) setSavedSuccess(false);
  };

  const setWarrantyDuration = (years) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const startStr = data.validFrom || todayStr;
    const start = new Date(startStr);
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + years);
    setData((prev) => ({
      ...prev,
      validFrom: prev.validFrom || todayStr,
      validTo: end.toISOString().split("T")[0],
    }));
  };

  const handleRegenerateId = () => {
    setData((prev) => ({
      ...prev,
      id: generateShortId(),
    }));
    setSavedSuccess(false);
  };

  const handleSaveToRegistry = async () => {
    if (isSaving || savedSuccess) return;
    if (!data.patient.trim()) {
      alert("Please enter the patient name before saving.");
      return;
    }

    setIsSaving(true);
    try {
      await addCard({
        CardId: data.id,
        patient: data.patient.trim(),
        doctor: data.doctor.trim(),
        lab: data.lab.trim(),
        caseId: data.caseId.trim(),
        doctorMobile: data.doctorMobile.trim(),
        labMobile: data.labMobile.trim(),
        validFrom: data.validFrom,
        validTo: data.validTo,
      });
      setSavedSuccess(true);
    } catch (err) {
      console.error("Error saving card:", err);
      alert("Failed to save card. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  const downloadCardImage = async () => {
    try {
      if (!data.patient.trim()) {
        alert("Please enter the patient name first.");
        return;
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const scale = 3;
      canvas.width = 500 * scale;
      canvas.height = 300 * scale;
      ctx.scale(scale, scale);

      if (side === "front") {
      
          const bg = await loadImage("/card-front-Shree-ganeshay.png");
          ctx.drawImage(bg, 0, 0, 500, 300);
    
      } else {
        try {
          const bg = await loadImage("/card-back-Shree-ganeshay.png");
          ctx.drawImage(bg, 0, 0, 500, 300);
        } catch {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, 500, 300);
          ctx.strokeStyle = "#cbd5e1";
          ctx.lineWidth = 1;
          ctx.strokeRect(0, 0, 500, 300);
        }

        ctx.fillStyle = "#64748b";
        ctx.font = "9px system-ui";
        ctx.textAlign = "left";

        const fields = [
          { label: "PATIENT NAME", value: data.patient || "-" },
          { label: "CASE ID", value: data.caseId || "-" },
          { label: "VALID FROM", value: data.validFrom || "-" },
          { label: "VALID TO", value: data.validTo || "-" },
          { label: "DOCTOR", value: data.doctor || "-" },
          { label: "DOCTOR MOBILE", value: data.doctorMobile || "-" },
          { label: "LABORATORY", value: data.lab || "-" },
        ];

        fields.forEach((f, i) => {
          const isRight = i >= 4;
          const colIndex = isRight ? i - 4 : i;
          const x = isRight ? 240 : 60;
          const y = 60 + colIndex * 46;

          ctx.fillStyle = "#64748b";
          ctx.font = "9px system-ui";
          ctx.fillText(f.label, x, y);

          ctx.fillStyle = "#0f172a";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(f.value, x, y + 16);
        });

        if (qrDataUrl) {
          const qrImg = await loadImage(qrDataUrl);
          ctx.drawImage(qrImg, 380, 180, 85, 85);
          ctx.fillStyle = "#64748b";
          ctx.font = "8px system-ui";
          ctx.textAlign = "center";
          ctx.fillText("VERIFY ONLINE", 422, 276);
        }
      }

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `DentalCard-${data.caseId || data.id}-${side}.png`;
      link.click();
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export card image.");
    }
  };

  const handleCopyLink = () => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://shree-ganeshay.vercel.app";
    const url = `${origin}/c/${data.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://shree-ganeshay.vercel.app";
    const url = `${origin}/c/${data.id}`;
    const text = encodeURIComponent(
      `Hello ${data.patient || "Patient"},\n\nHere is your official Dental Warranty Card from Shree Ganeshay Dental Clinic:\nCard ID: ${data.id}\nValid Until: ${data.validTo}\n\nVerify certificate: ${url}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
  

        {/* Success Alert */}
        {savedSuccess && (
          <div className="mt-4 p-3 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Card <strong>{data.id}</strong> has been saved to the clinic registry.
              </span>
            </div>
            <Link
              href={`/billing?cardId=${data.id}&patient=${encodeURIComponent(data.patient)}`}
              className="font-medium underline hover:text-emerald-950"
            >
              Create invoice →
            </Link>
          </div>
        )}

        {/* Form and Preview Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Left: Form (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Patient & Case Information
              </h2>
              <span
                className="text-[11px] font-mono text-slate-500"
                suppressHydrationWarning
              >
                Card ID: {data.id || "------"}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Patient Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="patient"
                  value={data.patient}
                  onChange={handleChange}
                  placeholder="Patient name"
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-3 py-2 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Case / Reg ID
                  </label>
                  <input
                    type="text"
                    name="caseId"
                    value={data.caseId}
                    onChange={handleChange}
                    placeholder="Case ID"
                    className="w-full bg-white border border-slate-300 font-mono text-slate-900 rounded-md px-3 py-2 outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Warranty Duration
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {[3, 5, 10].map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => setWarrantyDuration(yr)}
                        className="py-1.5 text-[11px] rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors"
                      >
                        {yr} Yr
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Doctor Details */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-slate-700 font-medium mb-1">
                  Attending Doctor
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="doctor"
                    value={data.doctor}
                    onChange={handleChange}
                    placeholder="Doctor name"
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-3 py-2 outline-none focus:border-teal-600"
                  />
                  <input
                    type="text"
                    name="doctorMobile"
                    value={data.doctorMobile}
                    onChange={handleChange}
                    placeholder="Doctor contact number"
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-3 py-2 outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              {/* Lab Details */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-slate-700 font-medium mb-1">
                  Dental Laboratory
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="lab"
                    value={data.lab}
                    onChange={handleChange}
                    placeholder="Laboratory name"
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-3 py-2 outline-none focus:border-teal-600"
                  />
                  <input
                    type="text"
                    name="labMobile"
                    value={data.labMobile}
                    onChange={handleChange}
                    placeholder="Laboratory contact number"
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-3 py-2 outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Valid From
                  </label>
                  <input
                    type="date"
                    name="validFrom"
                    value={data.validFrom}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-3 py-2 outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Valid To (Expiry)
                  </label>
                  <input
                    type="date"
                    name="validTo"
                    value={data.validTo}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-3 py-2 outline-none focus:border-teal-600"
                  />
                </div>
              </div>
            </div>

            {/* Save Action */}
            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSaveToRegistry}
                disabled={isSaving || savedSuccess}
                className={`w-full inline-flex items-center justify-center gap-2 font-medium py-2 px-4 rounded-md text-xs transition-colors shadow-2xs ${
                  savedSuccess
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-300 cursor-default"
                    : "bg-teal-700 hover:bg-teal-800 disabled:bg-slate-200 disabled:text-slate-400 text-white"
                }`}
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Card Saved in Registry</span>
                  </>
                ) : isSaving ? (
                  <span>Saving Record...</span>
                ) : (
                  <span>Save Card to Registry</span>
                )}
              </button>
            </div>
          </div>

          {/* Right: Card Preview & Action Suite (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
            <div>
              {/* Preview Toggle Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-teal-700" />
                  <span className="text-xs font-semibold text-slate-900">
                    Card Preview (CR80 Standard)
                  </span>
                </div>
                <div className="inline-flex rounded-md bg-slate-100 p-0.5 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setSide("front")}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      side === "front"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Front
                  </button>
                  <button
                    type="button"
                    onClick={() => setSide("back")}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      side === "back"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Back (Details & QR)
                  </button>
                </div>
              </div>

              {/* Physical Card Visual Mockup */}
              <div className="flex justify-center py-4 bg-slate-50 rounded-lg border border-slate-200">
                <div
                  ref={cardRef}
                  className="relative w-[480px] h-[288px] rounded-lg overflow-hidden border border-slate-300 select-none bg-white shadow-xs"
                >
                  {side === "front" ? (
                    <div className="relative w-full h-full">
                      <img
                        src="/card-front-Shree-ganeshay.png"
                        alt="Card Front"
                        className="w-full h-full object-cover"
                      
                      />
                     
                    </div>
                  ) : (
                    <div className="relative w-full h-full bg-white text-slate-900 p-5">
                      <img
                        src="/card-back-Shree-ganeshay.png"
                        alt="Card Back"
                        className="absolute inset-0 w-full h-full object-cover opacity-90"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                      <div className="relative z-10 grid grid-cols-12 h-full">
                        {/* Data Column */}
                        <div className="col-span-8 space-y-2">
                          <div>
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">
                              Patient Name
                            </span>
                            <span className="text-xs font-bold text-slate-900 block truncate">
                              {data.patient || "Patient Full Name"}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">
                                Case ID
                              </span>
                              <span className="text-[11px] font-mono font-bold text-teal-800 block">
                                {data.caseId || "-"}
                              </span>
                            </div>
                            <div>
                              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">
                                Valid Until
                              </span>
                              <span className="text-[11px] font-bold text-slate-800 block">
                                {data.validTo || "-"}
                              </span>
                            </div>
                          </div>

                          <div>
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">
                              Doctor & Contact
                            </span>
                            <span className="text-[11px] text-slate-700 block truncate">
                              {data.doctor} ({data.doctorMobile})
                            </span>
                          </div>

                          <div>
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">
                              Laboratory
                            </span>
                            <span className="text-[11px] text-slate-700 block truncate">
                              {data.lab}
                            </span>
                          </div>
                        </div>

                        {/* QR Code Column */}
                        <div className="col-span-4 flex flex-col items-center justify-end pb-1">
                          {qrDataUrl ? (
                            <div className="bg-white p-1 rounded border border-slate-200 text-center shadow-2xs">
                              <img
                                src={qrDataUrl}
                                alt="QR Code"
                                className="w-16 h-16"
                              />
                              <span className="text-[7px] text-slate-500 font-bold block mt-0.5">
                                SCAN TO VERIFY
                              </span>
                            </div>
                          ) : (
                            <div className="w-16 h-16 bg-slate-100 rounded" />
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 mt-4 space-y-3">
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={downloadCardImage}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Download PNG ({side})</span>
                </button>

             

               
              </div>

              {/* Direct Link to Invoicing */}
              <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600">
                  Ready to bill this procedure?
                </span>
                <Link
                  href={`/billing?cardId=${data.id}&patient=${encodeURIComponent(data.patient || "")}&doctor=${encodeURIComponent(data.doctor || "")}&lab=${encodeURIComponent(data.lab || "")}`}
                  className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-800 font-medium"
                >
                  <FilePlus className="w-3.5 h-3.5" />
                  <span>Create Invoice</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
