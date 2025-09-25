"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { QRCodeCanvas } from "qrcode.react";
import { Calendar, Phone, User, Building2, FileText, Clock } from "lucide-react";

export default function CardPublicPage() {
  const { id } = useParams();

  // Ensure id is a string and not an array
  const cardId = Array.isArray(id) ? id[0] : id;

  // Fetch card from Convex
  const card = useQuery(api.cards.getCardByCardId, cardId ? { cardId: cardId } : "skip");

  if (!cardId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center p-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-red-400 text-lg font-medium">Invalid card ID</p>
          <p className="text-white/60 mt-2">Please check the URL and try again</p>
        </div>
      </div>
    );
  }

  if (card === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-black to-slate-900">
        <div className="text-center p-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Loading card...</p>
          <p className="text-white/60 mt-2">Please wait while we retrieve your information</p>
        </div>
      </div>
    );
  }

  if (card === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center p-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-red-400 text-xl font-semibold">Card not found</p>
          <p className="text-white/60 mt-2">The requested card does not exist or has been removed</p>
        </div>
      </div>
    );
  }

  // URL for QR code - use CardId instead of _id
  const cardURL = `${window?.location?.origin || 'https://shree-ganeshay.vercel.app'}/c/${card.CardId}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
           Warranty Card
          </h1>
          <p className="text-white/70">Digital Health Card Verification</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card Visual */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-[500px] h-[320px] rounded-2xl shadow-2xl overflow-hidden bg-gradient-to-br from--600 to-black border border-white/20">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-full h-full">
                  <div className="absolute top-4 right-4 w-32 h-32 border border-white/30 rounded-full"></div>
                  <div className="absolute bottom-8 left-8 w-24 h-24 border border-white/20 rounded-full"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-white/10 rounded-full"></div>
                </div>
              </div>

              {/* Card background image overlay */}
              <img
                src="/card-back-Shree-ganeshay.png"
                alt="Card Background"
                className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-overlay"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />

              {/* Header */}
              <div className="absolute top-4 left-4 right-4">
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    <h2 className="text-lg font-bold"> CARD</h2>
                    <p className="text-xs opacity-80">ID: {card.CardId}</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                    <p className="text-white text-xs font-medium">VERIFIED</p>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="absolute bottom-4 left-4">
                <div className="bg-white p-2 rounded-lg shadow-lg">
                  <QRCodeCanvas
                    value={cardURL}
                    size={80}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                    className="rounded"
                  />
                </div>
              </div>

              {/* Essential Info */}
              <div className="absolute bottom-4 right-4 text-right">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <p className="text-white text-xs opacity-80">Valid Until</p>
                  <p className="text-white font-bold">{card.validTo}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card Details */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Patient Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-white/60 text-sm mb-1">Full Name</label>
                  <p className="text-white text-lg font-medium">{card.patient}</p>
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-1">Case ID</label>
                  <p className="text-white font-mono">{card.caseId}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
               Provider
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 text-sm mb-1">Doctor</label>
                  <p className="text-white font-medium">{card.doctor}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4 text-white/60" />
                    <p className="text-white/80 text-sm">{card.doctorMobile}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-1">Laboratory</label>
                  <p className="text-white font-medium">{card.lab}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4 text-white/60" />
                    <p className="text-white/80 text-sm">{card.labMobile}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Validity Period
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 text-sm mb-1">Valid From</label>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-400" />
                    <p className="text-white font-medium">{card.validFrom}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-1">Valid Until</label>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-400" />
                    <p className="text-white font-medium">{card.validTo}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
       
      </div>
    </div>
  );
}