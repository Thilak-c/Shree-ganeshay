"use client";
import { useState, useRef, useEffect } from "react";
import QRCode from "qrcode";
import { useMutation } from "convex/react";

export default function CardGenerator() {
  const [data, setData] = useState({
    id: "",
    patient: "",
    doctor: "",
    lab: "",
    caseId: "",
    doctorMobile: "",
    labMobile: "",
    validFrom: "",
    validTo: "",
  });

  const [side, setSide] = useState("back");
  const [showDetailsPage, setShowDetailsPage] = useState(false);
  const [urlParams, setUrlParams] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const cardRef = useRef(null);

  const addCard = useMutation("cards:addCard");

  const generateShortId = () =>
    Math.random().toString(36).substring(2, 8).toUpperCase();

  useEffect(() => {
    if (!data.id) setData((prev) => ({ ...prev, id: generateShortId() }));

    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("card")) {
        try {
          const decodedData = JSON.parse(atob(searchParams.get("card")));
          setUrlParams(decodedData);
          setShowDetailsPage(true);
        } catch (error) {
          console.error("Error decoding card data:", error);
        }
      }
    }
  }, []);

  useEffect(() => {
    const generate = async () => {
      if (!data.id) return;
      try {
        const url = `https://shree-ganeshay.vercel.app/c/${data.id}`;
        const d = await QRCode.toDataURL(url, { 
          width: 400, 
          margin: 2,
          color: {
            dark: '#1f2937',
            light: '#ffffff'
          },
          errorCorrectionLevel: 'H'
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
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  const drawBackText = (ctx, drawQr = true, qrImage = null) => {
    // Professional styling constants
    const cardPadding = 80;
    const fieldSpacing = 42;
    const labelFontSize = "10px";
    const valueFontSize = "14px";
    const qrSize = 90;
    
    // QR code positioned at bottom right with proper margins
    if (drawQr && qrImage) {
      ctx.drawImage(qrImage, 500 - qrSize - 30, 300 - qrSize - 30, qrSize, qrSize);
    }

    // Text area dimensions (accounting for QR space)
    const textAreaWidth = 500 - qrSize - 80; // Leave space for QR
    const columnWidth = (textAreaWidth - 40) / 2;

    const leftFields = [
      { label: "PATIENT NAME", value: data.patient },
      { label: "CASE ID", value: data.caseId },
      { label: "VALID FROM", value: data.validFrom },
      { label: "VALID TO", value: data.validTo },
    ];

    const rightFields = [
      { label: "DOCTOR", value: data.doctor },
      { label: "DOCTOR MOBILE", value: data.doctorMobile },
      { label: "LAB NAME", value: data.lab },
      // { label: "LAB MOBILE", value: data.labMobile },
    ];

    // Draw left column
    leftFields.forEach((f, i) => {
      const x = cardPadding;
      const y = 60 + i * fieldSpacing;
      
      // Label
      ctx.fillStyle = "#6b7280";
      ctx.font = `${labelFontSize} "Segoe UI", Arial, sans-serif`;
      ctx.letterSpacing = "0.5px";
      ctx.fillText(f.label.toUpperCase(), x, y);

      // Underline
      ctx.strokeStyle = "#d1d5db";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y + 5);
      ctx.lineTo(x + columnWidth, y + 5);
      ctx.stroke();

      // Value
      ctx.fillStyle = "#111827";
      ctx.font = `bold ${valueFontSize} "Segoe UI", Arial, sans-serif`;
      ctx.letterSpacing = "0px";
      const valueText = f.value || "-";
      // Truncate if too long
      const maxWidth = columnWidth - 10;
      let displayText = valueText;
      if (ctx.measureText(valueText).width > maxWidth) {
        while (ctx.measureText(displayText + "...").width > maxWidth && displayText.length > 0) {
          displayText = displayText.slice(0, -1);
        }
        displayText += "...";
      }
      ctx.fillText(displayText, x, y + 20);
    });

    // Draw right column
    rightFields.forEach((f, i) => {
      const x = cardPadding + columnWidth + 40;
      const y = 60 + i * fieldSpacing;
      
      // Label
      ctx.fillStyle = "#6b7280";
      ctx.font = `${labelFontSize} "Segoe UI", Arial, sans-serif`;
      ctx.letterSpacing = "0.5px";
      ctx.fillText(f.label.toUpperCase(), x, y);

      // Underline
      ctx.strokeStyle = "#d1d5db";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y + 5);
      ctx.lineTo(x + columnWidth, y + 5);
      ctx.stroke();

      // Value
      ctx.fillStyle = "#111827";
      ctx.font = `bold ${valueFontSize} "Segoe UI", Arial, sans-serif`;
      ctx.letterSpacing = "0px";
      const valueText = f.value || "-";
      // Truncate if too long
      const maxWidth = columnWidth - 10;
      let displayText = valueText;
      if (ctx.measureText(valueText).width > maxWidth) {
        while (ctx.measureText(displayText + "...").width > maxWidth && displayText.length > 0) {
          displayText = displayText.slice(0, -1);
        }
        displayText += "...";
      }
      ctx.fillText(displayText, x, y + 20);
    });

    // Add QR label
    if (drawQr) {
      ctx.fillStyle = "#6b7280";
      ctx.font = "9px Arial";
      ctx.textAlign = "center";
      ctx.fillText("SCAN FOR DETAILS", 500 - qrSize/2 - 30, 300 - 10);
      ctx.textAlign = "left"; // Reset alignment
    }
  };

  const handleSave = async () => {
    try {
      await addCard({
        CardId: data.id,
        patient: data.patient,
        doctor: data.doctor,
        lab: data.lab,
        caseId: data.caseId,
        doctorMobile: data.doctorMobile,
        labMobile: data.labMobile,
        validFrom: data.validFrom,
        validTo: data.validTo,
      });
      alert("Card saved successfully!");
    } catch (err) {
      console.error("Error saving card:", err);
    }
  };

  const downloadCard = async () => {
    try {
      await handleSave();

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const scale = 4; // Higher resolution for professional quality
      canvas.width = 500 * scale;
      canvas.height = 300 * scale;
      ctx.scale(scale, scale);

      if (side === "front") {
        try {
          const bg = await loadImage("/card-front-Shree-ganeshay.png");
          ctx.drawImage(bg, 0, 0, 500, 300);
        } catch {
          // Professional gradient fallback
          const gradient = ctx.createLinearGradient(0, 0, 500, 300);
          gradient.addColorStop(0, "#1e40af");
          gradient.addColorStop(1, "#3b82f6");
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, 500, 300);
          
          // Add company branding
          ctx.fillStyle = "white";
          ctx.font = "bold 28px Arial";
          ctx.textAlign = "center";
          ctx.fillText("MEDICAL WARRANTY CARD", 250, 130);
          ctx.font = "16px Arial";
          ctx.fillText("Professional Healthcare Services", 250, 160);
          ctx.textAlign = "left";
        }
      } else {
        try {
          const bg = await loadImage("/card-back-Shree-ganeshay.png");
          ctx.drawImage(bg, 0, 0, 500, 300);

          const qrImg = await loadImage(
            qrDataUrl || (await QRCode.toDataURL(`https://shree-ganeshay.vercel.app/c/${data.id}`, { 
              width: 360, 
              margin: 2,
              errorCorrectionLevel: 'H'
            }))
          );

          drawBackText(ctx, true, qrImg);
        } catch {
          // Professional background
          ctx.fillStyle = "#f8fafc";
          ctx.fillRect(0, 0, 500, 300);
          
          // Add subtle border
          ctx.strokeStyle = "#e2e8f0";
          ctx.lineWidth = 2;
          ctx.strokeRect(1, 1, 498, 298);

          const qrImg = await loadImage(
            qrDataUrl || (await QRCode.toDataURL(`https://shree-ganeshay.vercel.app/c/${data.id}`, { 
              width: 360, 
              margin: 2,
              errorCorrectionLevel: 'H'
            }))
          );
          drawBackText(ctx, true, qrImg);
        }
      }

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `${data.caseId || data.id}-${side}.png`;
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to save or download the card.");
    }
  };

  const getDisplayData = () => urlParams || data;

  return (
    <div>
      {showDetailsPage ? (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-10">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h1 className="text-4xl font-bold text-gray-800 mb-2">
                    Medical Warranty Card
                  </h1>
                  <p className="text-gray-600">Professional Healthcare Documentation</p>
                </div>
                {!urlParams && (
                  <button
                    onClick={() => setShowDetailsPage(false)}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    ← Back to Generator
                  </button>
                )}
                {urlParams && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => window.print()}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      🖨️ Print
                    </button>
                    <button
                      onClick={() => window.close()}
                      className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      ✕ Close
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="border-l-4 border-blue-500 pl-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                      Patient Information
                    </h2>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
                          Patient Name
                        </label>
                        <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-100">
                          <span className="text-xl font-bold text-gray-900">
                            {getDisplayData().patient || "Not specified"}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
                          Case ID
                        </label>
                        <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-100">
                          <span className="text-xl font-mono font-bold text-blue-800">
                            {getDisplayData().caseId || "Not assigned"}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
                            Valid From
                          </label>
                          <div className="p-4 bg-green-50 rounded-xl border-2 border-green-100">
                            <span className="text-lg font-bold text-green-800">
                              {getDisplayData().validFrom || "Not set"}
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
                            Valid To
                          </label>
                          <div className="p-4 bg-red-50 rounded-xl border-2 border-red-100">
                            <span className="text-lg font-bold text-red-800">
                              {getDisplayData().validTo || "Not set"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="border-l-4 border-green-500 pl-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                      Healthcare Provider Details
                    </h2>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
                          Attending Doctor
                        </label>
                        <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-100">
                          <span className="text-xl font-bold text-gray-900">
                            {getDisplayData().doctor || "Not assigned"}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
                          Doctor Contact
                        </label>
                        <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-100">
                          <span className="text-lg font-mono font-bold text-blue-800">
                            {getDisplayData().doctorMobile || "Not provided"}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
                          Laboratory
                        </label>
                        <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-100">
                          <span className="text-xl font-bold text-gray-900">
                            {getDisplayData().lab || "Not specified"}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
                          Lab Contact
                        </label>
                        <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-100">
                          <span className="text-lg font-mono font-bold text-purple-800">
                            {getDisplayData().labMobile || "Not provided"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t-2 border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
                  Digital Warranty Card Preview
                </h2>
                <div className="flex justify-center">
                  <div className="relative w-[500px] h-[300px] rounded-2xl shadow-2xl overflow-hidden bg-white border-4 border-gray-200">
                    <img
                      src="/card-back-Shree-ganeshay.png"
                      alt="Card Back"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    
                    {/* QR Code - Professional positioning */}
                    <div className="absolute bottom-8 right-8 bg-white p-2 rounded-lg shadow-lg">
                      {qrDataUrl ? (
                        <div className="text-center">
                          <img
                            src={qrDataUrl}
                            alt="QR Code"
                            style={{ width: 80, height: 80 }}
                            className="rounded"
                          />
                          <p className="text-[8px] text-gray-600 mt-1 font-semibold">SCAN FOR DETAILS</p>
                        </div>
                      ) : (
                        <div className="w-[80px] h-[80px] bg-gray-200 rounded animate-pulse" />
                      )}
                    </div>
                    
                    {/* Professional field layout */}
                    <div className="absolute top-10 left-10 w-[60%] p-4 bg-white/90 backdrop-blur-sm rounded-xl border border-white/50">
                      <div className="grid grid-cols-2 gap-6 text-xs">
                        <div className="space-y-4">
                          <div>
                            <p className="text-[9px] uppercase text-gray-500 font-semibold tracking-wide">
                              Patient Name
                            </p>
                            <div className="h-px bg-gray-300 my-1"></div>
                            <p className="font-bold text-sm text-gray-900">
                              {getDisplayData().patient || "Not specified"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase text-gray-500 font-semibold tracking-wide">
                              Case ID
                            </p>
                            <div className="h-px bg-gray-300 my-1"></div>
                            <p className="font-mono font-bold text-sm text-blue-800">
                              {getDisplayData().caseId || "Not assigned"}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <p className="text-[9px] uppercase text-gray-500 font-semibold tracking-wide">
                              Doctor
                            </p>
                            <div className="h-px bg-gray-300 my-1"></div>
                            <p className="font-bold text-sm text-gray-900">
                              {getDisplayData().doctor || "Not assigned"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase text-gray-500 font-semibold tracking-wide">
                              Lab
                            </p>
                            <div className="h-px bg-gray-300 my-1"></div>
                            <p className="font-bold text-sm text-gray-900">
                              {getDisplayData().lab || "Not specified"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 p-8 gap-12">
          <div className="w-1/3 bg-white shadow-2xl p-8 rounded-3xl space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Card Generator
              </h2>
              <p className="text-gray-600">Professional Medical Warranty Cards</p>
            </div>
            
            {[
              { key: "patient", label: "Patient Name", icon: "👤" },
              { key: "doctor", label: "Doctor", icon: "👨‍⚕️" },
              { key: "lab", label: "Laboratory", icon: "🏥" },
              { key: "caseId", label: "Case ID", icon: "📋" },
              { key: "doctorMobile", label: "Doctor Mobile", icon: "📞" },
              { key: "labMobile", label: "Lab Mobile", icon: "☎️" },
            ].map(({ key, label, icon }) => (
              <div key={key} className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span>{icon}</span>
                  {label}
                </label>
                <input
                  name={key}
                  placeholder={`Enter ${label.toLowerCase()}...`}
                  onChange={handleChange}
                  value={data[key]}
                  className="w-full border-2 border-gray-200 text-gray-700 rounded-xl p-4 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 group-hover:border-gray-300"
                />
              </div>
            ))}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span>📅</span>
                  Valid From
                </label>
                <input
                  type="date"
                  name="validFrom"
                  value={data.validFrom}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-200 text-gray-800 p-4 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <span>📅</span>
                  Valid To
                </label>
                <input 
                  type="date"
                  name="validTo"
                  value={data.validTo}
                  onChange={handleChange}
                  className="w-full border-2 text-gray-800  border-gray-200 p-4 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>
            
            <div className="flex gap-4 pt-4">
              <button
                onClick={() => setSide("front")}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                  side === "front" 
                    ? "bg-blue-600 text-white shadow-lg" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                🎭 Front
              </button>
              <button
                onClick={() => setSide("back")}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                  side === "back" 
                    ? "bg-blue-600 text-white shadow-lg" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                📄 Back
              </button>
            </div>
            
            <button
              onClick={downloadCard}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold text-lg shadow-xl hover:from-green-700 hover:to-green-800 transform hover:scale-105 transition-all duration-200"
            >
              💾 Download {side.charAt(0).toUpperCase() + side.slice(1)}
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div
              ref={cardRef}
              className="relative w-[500px] h-[300px] rounded-2xl shadow-2xl overflow-hidden bg-white border-4 border-gray-300 transform hover:scale-105 transition-transform duration-300"
            >
              {side === "front" ? (
                <div className="relative">
                  <img
                    src="/card-front-Shree-ganeshay.png"
                    alt="Card Front"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Fallback if image doesn't load */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                    <div className="text-center text-white">
                      <h3 className="text-3xl font-bold mb-2">MEDICAL CARD</h3>
                      <p className="text-lg opacity-90">Professional Healthcare</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative bg-gradient-to-br from-gray-50 to-white">
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="w-full h-full" style={{
                      backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)',
                      backgroundSize: '20px 20px'
                    }}></div>
                  </div>
                  
                  {/* QR Code - Professional positioning */}
                  <div className="absolute bottom-8 right-8 bg-white p-3 rounded-lg shadow-xl border-2 border-gray-200">
                    {qrDataUrl ? (
                      <div className="text-center">
                        <img
                          src={qrDataUrl}
                          alt="QR Code"
                          width={85}
                          height={85}
                          className="rounded"
                        />
                        <p className="text-[9px] text-gray-600 mt-2 font-semibold tracking-wide">SCAN FOR DETAILS</p>
                      </div>
                    ) : (
                      <div className="w-[85px] h-[85px] bg-gray-200 rounded animate-pulse" />
                    )}
                  </div>

                  {/* Professional field layout */}
                  <div className="absolute top-10 left-10 w-[65%] p-6">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-6">
                        {[
                          { label: "PATIENT NAME", value: data.patient },
                          { label: "CASE ID", value: data.caseId },
                          { label: "VALID FROM", value: data.validFrom },
                          { label: "VALID TO", value: data.validTo }
                        ].map((field, i) => (
                          <div key={i} className="group">
                            <p className="text-[10px] uppercase text-gray-500 font-bold tracking-wider mb-1">
                              {field.label}
                            </p>
                            <div className="h-px bg-gradient-to-r from-gray-400 to-transparent mb-2 group-hover:from-blue-500 transition-colors"></div>
                            <p className="font-bold text-sm text-gray-900 min-h-[20px]">
                              {field.value || "-"}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-6">
                        {[
                          { label: "DOCTOR", value: data.doctor },
                          { label: "DOCTOR MOBILE", value: data.doctorMobile },
                          { label: "LAB NAME", value: data.lab },
                          { label: "LAB MOBILE", value: data.labMobile }
                        ].map((field, i) => (
                          <div key={i} className="group">
                            <p className="text-[10px] uppercase text-gray-500 font-bold tracking-wider mb-1">
                              {field.label}
                            </p>
                            <div className="h-px bg-gradient-to-r from-gray-400 to-transparent mb-2 group-hover:from-green-500 transition-colors"></div>
                            <p className="font-bold text-sm text-gray-900 min-h-[20px]">
                              {field.value || "-"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
