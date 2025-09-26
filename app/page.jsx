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

  const addCard = useMutation("cards:addCard"); // adjust path as needed

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
        const d = await QRCode.toDataURL(url, { width: 300, margin: 1 });
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
    if (drawQr && qrImage) ctx.drawImage(qrImage, 20, 200, 80, 80);

    const startX = 60,
      startY = 60,
      columnWidth = 180,
      lineHeight = 35;

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
      { label: "LAB MOBILE", value: data.labMobile },
    ];

    leftFields.forEach((f, i) => {
      const y = startY + i * lineHeight;
      ctx.fillStyle = "#6b7280";
      ctx.font = "8px Arial";
      ctx.fillText(f.label, startX, y);

      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(startX, y + 3);
      ctx.lineTo(startX + 160, y + 3);
      ctx.stroke();

      ctx.fillStyle = "#111827";
      ctx.font = "bold 11px Arial";
      ctx.fillText(f.value || "-", startX, y + 18);
    });

    rightFields.forEach((f, i) => {
      const x = startX + columnWidth,
        y = startY + i * lineHeight;
      ctx.fillStyle = "#6b7280";
      ctx.font = "8px Arial";
      ctx.fillText(f.label, x, y);

      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(x, y + 3);
      ctx.lineTo(x + 160, y + 3);
      ctx.stroke();

      ctx.fillStyle = "#111827";
      ctx.font = "bold 11px Arial";
      ctx.fillText(f.value || "-", x, y + 18);
    });
  };

  const handleSave = async () => {
    try {
      await addCard({
        CardId:data.id,
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
      const scale = 3;
      canvas.width = 500 * scale;
      canvas.height = 300 * scale;
      ctx.scale(scale, scale);

      if (side === "front") {
        try {
          const bg = await loadImage("/card-front-Shree-ganeshay.png");
          ctx.drawImage(bg, 0, 0, 500, 300);
        } catch {
          ctx.fillStyle = "#667eea";
          ctx.fillRect(0, 0, 500, 300);
          ctx.fillStyle = "white";
          ctx.font = "bold 24px Arial";
          ctx.textAlign = "center";
          ctx.fillText("Medical Card", 250, 150);
        }
      } else {
        try {
          const bg = await loadImage("/card-back-Shree-ganeshay.png");
          ctx.drawImage(bg, 0, 0, 500, 300);

          const qrImg = await loadImage(
            qrDataUrl || (await QRCode.toDataURL(`https://shree-ganeshay.vercel.app/c/${data.id}`, { width: 120, margin: 1 }))
          );

          drawBackText(ctx, true, qrImg);
        } catch {
          const gradient = ctx.createLinearGradient(0, 0, 500, 300);
          gradient.addColorStop(0, "#f093fb");
          gradient.addColorStop(1, "#f5576c");
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, 500, 300);

          const qrImg = await loadImage(
            qrDataUrl || (await QRCode.toDataURL(`https://shree-ganeshay.vercel.app/c/${data.id}`, { width: 120, margin: 1 }))
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                  Warranty Card Details
                </h1>
                {!urlParams && (
                  <button
                    onClick={() => setShowDetailsPage(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Back to Generator
                  </button>
                )}
                {urlParams && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Print Warranty
                    </button>
                    <button
                      onClick={() => window.close()}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-700 border-b-2 border-blue-200 pb-2">
                    Customer Information
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Customer Name
                      </label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                        <span className="text-lg font-semibold text-gray-800">
                          {getDisplayData().patient}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Case ID
                      </label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                        <span className="text-lg font-semibold text-gray-800">
                          {getDisplayData().caseId}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide">
                          Valid From
                        </label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                          <span className="text-lg font-semibold text-gray-800">
                            {getDisplayData().validFrom}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide">
                          Valid To
                        </label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                          <span className="text-lg font-semibold text-gray-800">
                            {getDisplayData().validTo}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-700 border-b-2 border-green-200 pb-2">
                    Warranty Information
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Doctor
                      </label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                        <span className="text-lg font-semibold text-gray-800">
                          {getDisplayData().doctor}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Doctor Mobile
                      </label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                        <span className="text-lg font-semibold text-gray-800">
                          {getDisplayData().doctorMobile}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Lab Name
                      </label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                        <span className="text-lg font-semibold text-gray-800">
                          {getDisplayData().lab}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Lab Mobile
                      </label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                        <span className="text-lg font-semibold text-gray-800">
                          {getDisplayData().labMobile}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t-2 border-gray-200">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                  Warranty Card Preview
                </h2>
                <div className="flex justify-center">
                  <div className="relative w-[400px] h-[240px] rounded-xl shadow-2xl overflow-hidden bg-white">
                    <img
                      src="/card-back-Shree-ganeshay.png"
                      alt="Card Back"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 left-4">
                      {/* use the same real QR dataURL for preview */}
                      {qrDataUrl ? (
                        <img
                          src={qrDataUrl}
                          alt="QR Code"
                          style={{ width: 60, height: 60 }}
                          className="rounded border-2 border-white shadow-md"
                        />
                      ) : (
                        <div className="w-[60px] h-[60px] bg-gray-200 rounded" />
                      )}
                    </div>
                    <div className="absolute top-6 right-6 w-[85%] p-3 bg-transparent rounded-lg text-gray-900">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        <div>
                          <p className="text-[8px] uppercase text-gray-500">
                            Customer Name
                          </p>
                          <div className="h-0.5 bg-black/30"></div>
                          <p className="font-semibold text-sm">
                            {getDisplayData().patient}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] uppercase text-gray-500">
                            Doctor
                          </p>
                          <div className="h-0.5 bg-black/30"></div>
                          <p className="font-semibold text-sm">
                            {getDisplayData().doctor}
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
      ) : (
        <div className="flex min-h-screen bg-gray-100 p-8 gap-10">
          <div className="w-1/3 bg-white shadow-lg p-6 rounded-2xl space-y-4">
            <h2 className="text-2xl font-bold text-gray-700">
              Warranty Card Details
            </h2>
            {[
              "patient",
              "doctor",
              "lab",
              "caseId",
              "doctorMobile",
              "labMobile",
            ].map((field) => (
              <input
                key={field}
                name={field}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                onChange={handleChange}
                value={data[field]}
                className="w-full border text-gray-600 rounded-lg p-2 text-sm"
              />
            ))}
            <div className="flex text-gray-600 gap-2">
              <input
                type="date"
                name="validFrom"
                value={data.validFrom}
                onChange={handleChange}
                className="border p-2 rounded-lg w-full"
              />
              <input
                type="date"
                name="validTo"
                value={data.validTo}
                onChange={handleChange}
                className="border p-2 rounded-lg w-full"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setSide("front")}
                className={`px-4 py-2 rounded ${
                  side === "front" ? "bg-blue-600 text-white" : "bg-gray-400"
                }`}
              >
                Front
              </button>
              <button
                onClick={() => setSide("back")}
                className={`px-4 py-2 rounded ${
                  side === "back" ? "bg-blue-600 text-white" : "bg-gray-400"
                }`}
              >
                Back
              </button>
            </div>
            <button
              onClick={downloadCard}
              className="px-6 py-3 bg-green-600 text-white rounded-xl w-full mt-4 shadow-md"
            >
              Download {side.charAt(0).toUpperCase() + side.slice(1)}
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div
              ref={cardRef}
              className="relative w-[500px] h-[300px] rounded-xl shadow-2xl overflow-hidden bg-white"
            >
              {side === "front" ? (
                <div>
                  <img
                    src="/card-front-Shree-ganeshay.png"
                    alt="Card Front"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div>
                  <div className="absolute text-center text-gray-400 bottom-6 left-8">
                    {/* preview uses same QR dataURL */}
                    {qrDataUrl ? (
                      <>
                      <img
                        src={qrDataUrl}
                        alt="QR Code"
                        width={70}
                        height={70}
                        className="rounded border-2 border-white"
                        />
                        <p className="text-[10px]">Scan For Details</p>
                        </>
                    ) : (
                      <div className="w-[70px] h-[70px] bg-gray-200 rounded" />
                    )}
                  </div>

                  <div className="absolute top-8 right-8 w-[90%] p-4 bg-transparent rounded-lg text-gray-900">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                      <div className="flex-col gap-y-6">
                        <p className="text-[10px] uppercase text-gray-500">
                          Patient Name
                        </p>
                        <div className="h-0.5 bg-black/30"></div>
                        <p className="font-semibold">{data.patient}</p>

                        <p className="mt-2 text-[10px] uppercase text-gray-500">
                          Case ID
                        </p>
                        <div className="h-0.5 bg-black/30"></div>
                        <p className="font-semibold">{data.caseId}</p>

                        <p className="mt-2 text-[10px] uppercase text-gray-500">
                          Valid From
                        </p>
                        <div className="h-0.5 bg-black/30"></div>
                        <p className="font-semibold">{data.validFrom}</p>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase text-gray-500">Doctor</p>
                        <div className="h-0.5 bg-black/30"></div>
                        <p className="font-semibold">{data.doctor}</p>

                        <p className="mt-2 text-[10px] uppercase text-gray-500">
                          Doctor Mobile
                        </p>

                        <div className="h-0.5 bg-black/30"></div>
                        <p className="font-semibold">{data.doctorMobile}</p>

                        <p className="mt-2 text-[10px] uppercase text-gray-500">
                          Valid To
                        </p>
                        <div className="h-0.5 bg-black/30"></div>
                        <p className="font-semibold">{data.validTo}</p>
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
