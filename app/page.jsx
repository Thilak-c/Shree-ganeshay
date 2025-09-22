"use client";
import { useState, useRef, useEffect } from "react";

export default function CardGenerator() {
  const [data, setData] = useState({
    patient: "John Doe",
    doctor: "Dr. Smith",
    lab: "City Lab",
    caseId: "CASE123456",
    doctorMobile: "9876543210",
    labMobile: "9123456789",
    validFrom: "2025-09-01",
    validTo: "2026-09-01",
  });

  const [side, setSide] = useState("back");
  const [showDetailsPage, setShowDetailsPage] = useState(false);
  const [urlParams, setUrlParams] = useState(null);
  const cardRef = useRef(null);

  // Check URL parameters on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('card')) {
        try {
          const encodedData = searchParams.get('card');
          const decodedData = JSON.parse(atob(encodedData));
          setUrlParams(decodedData);
          setShowDetailsPage(true);
        } catch (error) {
          console.error('Error decoding card data:', error);
        }
      }
    }
  }, []);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  // Generate QR code data URL
  const generateQRCode = (text, size = 100) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = size;
    canvas.height = size;
    
    // Simple QR-like pattern
    const moduleSize = size / 25;
    const hash = text.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = 'black';
    
    for (let i = 0; i < 25; i++) {
      for (let j = 0; j < 25; j++) {
        const shouldFill = (hash + i * 25 + j) % 3 === 0;
        if (shouldFill) {
          ctx.fillRect(i * moduleSize, j * moduleSize, moduleSize, moduleSize);
        }
      }
    }
    
    // Add finder patterns (corners)
    const drawFinderPattern = (x, y) => {
      ctx.fillStyle = 'black';
      ctx.fillRect(x, y, moduleSize * 7, moduleSize * 7);
      ctx.fillStyle = 'white';
      ctx.fillRect(x + moduleSize, y + moduleSize, moduleSize * 5, moduleSize * 5);
      ctx.fillStyle = 'black';
      ctx.fillRect(x + moduleSize * 2, y + moduleSize * 2, moduleSize * 3, moduleSize * 3);
    };
    
    drawFinderPattern(0, 0);
    drawFinderPattern(0, size - moduleSize * 7);
    drawFinderPattern(size - moduleSize * 7, 0);
    
    return canvas.toDataURL();
  };

  // Create URL with encoded card data
  const createDetailsURL = () => {
    // Encode card data as base64
    const encodedData = btoa(JSON.stringify(data));
    return `${window.location.origin}/card?card=${encodedData}`;
  };

  // Handle QR code click - just for testing, remove in production
  const handleQRClick = () => {
    // For development/testing - show details page
    const url = createDetailsURL();
    console.log('QR Code would open:', url);
    setShowDetailsPage(true);
  };

  // Get display data (from URL params if available, otherwise from form)
  const getDisplayData = () => {
    return urlParams || data;
  };

  const downloadCard = async () => {
    if (cardRef.current) {
      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas size (high resolution)
      const scale = 3;
      canvas.width = 500 * scale;
      canvas.height = 300 * scale;
      
      // Scale context for high-res rendering
      ctx.scale(scale, scale);
      
      if (side === "front") {
        // Load and draw front background image
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          ctx.drawImage(img, 0, 0, 500, 300);
          // Download the image
          const link = document.createElement('a');
          link.href = canvas.toDataURL('image/png');
          link.download = `${data.caseId}-${side}.png`;
          link.click();
        };
        img.onerror = () => {
          // Fallback: create a simple front card
          drawSimpleFront(ctx);
          const link = document.createElement('a');
          link.href = canvas.toDataURL('image/png');
          link.download = `${data.caseId}-${side}.png`;
          link.click();
        };
        img.src = "/card-front-Shree-ganeshay.png";
      } else {
        // Load and draw back background image, then add text
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          ctx.drawImage(img, 0, 0, 500, 300);
          drawBackText(ctx);
          // Download the image
          const link = document.createElement('a');
          link.href = canvas.toDataURL('image/png');
          link.download = `${data.caseId}-${side}.png`;
          link.click();
        };
        img.onerror = () => {
          // Fallback: create a simple back card
          drawSimpleBack(ctx);
          const link = document.createElement('a');
          link.href = canvas.toDataURL('image/png');
          link.download = `${data.caseId}-${side}.png`;
          link.click();
        };
        img.src = "/card-back-Shree-ganeshay.png";
      }
    }
  };

  const drawBackText = (ctx) => {
    // Draw QR Code first
    const qrDataURL = generateQRCode(createDetailsURL(), 80);
    const qrImg = new Image();
    qrImg.onload = () => {
      ctx.drawImage(qrImg, 20, 200, 80, 80);
    };
    qrImg.src = qrDataURL;
    
    // Set up text styling
    ctx.fillStyle = 'rgba(107, 114, 128, 1)';
    ctx.font = '8px Arial';
    ctx.textAlign = 'left';
    
    const startX = 60;
    const startY = 60;
    const columnWidth = 180;
    const lineHeight = 35;
    
    // Left Column Data
    const leftFields = [
      { label: 'PATIENT NAME', value: data.patient },
      { label: 'CASE ID', value: data.caseId },
      { label: 'VALID FROM', value: data.validFrom },
      { label: 'VALID TO', value: data.validTo }
    ];
    
    // Right Column Data
    const rightFields = [
      { label: 'DOCTOR', value: data.doctor },
      { label: 'DOCTOR MOBILE', value: data.doctorMobile },
      { label: 'LAB NAME', value: data.lab },
      { label: 'LAB MOBILE', value: data.labMobile }
    ];
    
    // Draw Left Column
    leftFields.forEach((field, index) => {
      const y = startY + (index * lineHeight);
      
      // Draw label
      ctx.fillStyle = 'rgba(107, 114, 128, 1)';
      ctx.font = '8px Arial';
      ctx.fillText(field.label, startX, y);
      
      // Draw underline
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(startX, y + 3);
      ctx.lineTo(startX + 160, y + 3);
      ctx.stroke();
      
      // Draw value
      ctx.fillStyle = 'rgba(17, 24, 39, 1)';
      ctx.font = 'bold 11px Arial';
      ctx.fillText(field.value, startX, y + 18);
    });
    
    // Draw Right Column
    rightFields.forEach((field, index) => {
      const y = startY + (index * lineHeight);
      const x = startX + columnWidth;
      
      // Draw label
      ctx.fillStyle = 'rgba(107, 114, 128, 1)';
      ctx.font = '8px Arial';
      ctx.fillText(field.label, x, y);
      
      // Draw underline
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(x, y + 3);
      ctx.lineTo(x + 160, y + 3);
      ctx.stroke();
      
      // Draw value
      ctx.fillStyle = 'rgba(17, 24, 39, 1)';
      ctx.font = 'bold 11px Arial';
      ctx.fillText(field.value, x, y + 18);
    });
  };

  const drawSimpleFront = (ctx) => {
    // Fallback front design
    const gradient = ctx.createLinearGradient(0, 0, 500, 300);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 500, 300);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Medical Card', 250, 150);
  };

  const drawSimpleBack = (ctx) => {
    // Fallback back design
    const gradient = ctx.createLinearGradient(0, 0, 500, 300);
    gradient.addColorStop(0, '#f093fb');
    gradient.addColorStop(1, '#f5576c');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 500, 300);
    
    drawBackText(ctx);
  };

  return (
    <div>
      {showDetailsPage ? (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Warranty Card Details</h1>
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
                        <span className="text-lg font-semibold text-gray-800">{getDisplayData().patient}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Case ID
                      </label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                        <span className="text-lg font-semibold text-gray-800">{getDisplayData().caseId}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide">
                          Valid From
                        </label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                          <span className="text-lg font-semibold text-gray-800">{getDisplayData().validFrom}</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide">
                          Valid To
                        </label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                          <span className="text-lg font-semibold text-gray-800">{getDisplayData().validTo}</span>
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
                        <span className="text-lg font-semibold text-gray-800">{getDisplayData().doctor}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Doctor Mobile
                      </label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                        <span className="text-lg font-semibold text-gray-800">{getDisplayData().doctorMobile}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Lab Name
                      </label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                        <span className="text-lg font-semibold text-gray-800">{getDisplayData().lab}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Lab Mobile
                      </label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                        <span className="text-lg font-semibold text-gray-800">{getDisplayData().labMobile}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t-2 border-gray-200">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Warranty Card Preview</h2>
                <div className="flex justify-center">
                  <div className="relative w-[400px] h-[240px] rounded-xl shadow-2xl overflow-hidden bg-white">
                    <img
                      src="/card-back-Shree-ganeshay.png"
                      alt="Card Back"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 left-4">
                      <img 
                        src={generateQRCode(createDetailsURL(), 60)}
                        alt="QR Code"
                        className="rounded border-2 border-white shadow-md"
                      />
                    </div>
                    <div className="absolute top-6 right-6 w-[85%] p-3 bg-transparent rounded-lg text-gray-900">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        <div>
                          <p className="text-[8px] uppercase text-gray-500">Customer Name</p>
                          <div className="h-0.5 bg-black/30"></div>
                          <p className="font-semibold text-sm">{getDisplayData().patient}</p>
                        </div>
                        <div>
                          <p className="text-[8px] uppercase text-gray-500">Doctor</p>
                          <div className="h-0.5 bg-black/30"></div>
                          <p className="font-semibold text-sm">{getDisplayData().doctor}</p>
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
            <h2 className="text-2xl font-bold text-gray-700">Warranty Card Details</h2>
            {["patient","doctor","lab","caseId","doctorMobile","labMobile"].map((field)=>(
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
              <input type="date" name="validFrom" value={data.validFrom} onChange={handleChange} className="border p-2 rounded-lg w-full"/>
              <input type="date" name="validTo" value={data.validTo} onChange={handleChange} className="border p-2 rounded-lg w-full"/>
            </div>
            <div className="flex gap-4">
              <button onClick={()=>setSide("front")} className={`px-4 py-2 rounded ${side==="front"?"bg-blue-600 text-white":"bg-gray-400"}`}>Front</button>
              <button onClick={()=>setSide("back")} className={`px-4 py-2 rounded ${side==="back"?"bg-blue-600 text-white":"bg-gray-400"}`}>Back</button>
            </div>
            <button onClick={downloadCard} className="px-6 py-3 bg-green-600 text-white rounded-xl w-full mt-4 shadow-md">
              Download {side.charAt(0).toUpperCase()+side.slice(1)}
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
                  <img
                    src="/card-back-Shree-ganeshay.png"
                    alt="Card Back"
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  <div className="absolute bottom-6 left-6">
                    {/* <img 
                      src={generateQRCode(createDetailsURL())}
                      alt="QR Code - Scan to view warranty details"
                      className="w-[200px] h-[200px] rounded border-2 border-white shadow-md"
                      title="Scan with phone to view warranty details"
                    /> */}
                    {/* <p className="text-xs text-white text-center mt-1 bg-black/50 rounded px-1">Scan Me</p> */}
                  </div>

                  <div className="absolute top-8 right-8 w-[90%] p-4 bg-transparent rounded-lg text-gray-900">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                      <div>
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

                        <p className="mt-2 text-[10px] uppercase text-gray-500">
                          Valid To
                        </p>
                        <div className="h-0.5 bg-black/30"></div>
                        <p className="font-semibold">{data.validTo}</p>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase text-gray-500">
                          Doctor
                        </p>
                        <div className="h-0.5 bg-black/30"></div>
                        <p className="font-semibold">{data.doctor}</p>

                        <p className="mt-2 text-[10px] uppercase text-gray-500">
                          Doctor Mobile
                        </p>
                        <div className="h-0.5 bg-black/30"></div>
                        <p className="font-semibold">{data.doctorMobile}</p>

                        <p className="mt-2 text-[10px] uppercase text-gray-500">
                          Lab Name
                        </p>
                        <div className="h-0.5 bg-black/30"></div>
                        <p className="font-semibold">{data.lab}</p>

                        <p className="mt-2 text-[10px] uppercase text-gray-500">
                          Lab Mobile
                        </p>
                        <div className="h-0.5 bg-black/30"></div>
                        <p className="font-semibold">{data.labMobile}</p>
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