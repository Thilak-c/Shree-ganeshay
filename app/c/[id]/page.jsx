"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { QRCodeCanvas } from "qrcode.react";
import {
  Phone,
  Printer,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function CardPublicPage() {
  const { id } = useParams();
  const cardId = Array.isArray(id) ? id[0] : id;

  const card = useQuery(
    api.cards.getCardByCardId,
    cardId ? { cardId: cardId } : "skip"
  );

  const isCardActive = (validTo) => {
    if (!validTo) return true;
    return new Date(validTo) >= new Date();
  };

  if (!cardId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans text-slate-800">
        <div className="text-center p-6 bg-white border border-slate-200 rounded-lg max-w-sm w-full shadow-2xs">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
          <h2 className="text-sm font-semibold text-slate-900">
            Invalid Certificate Link
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            No Card ID was provided in the verification URL.
          </p>
        </div>
      </div>
    );
  }

  if (card === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans text-slate-800">
        <div className="text-center p-6 bg-white border border-slate-200 rounded-lg max-w-sm w-full shadow-2xs">
          <div className="w-6 h-6 rounded-full border-2 border-teal-600 border-t-transparent animate-spin mx-auto mb-2" />
          <h2 className="text-sm font-semibold text-slate-900">
            Verifying Certificate...
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Checking clinical registry record for ID: {cardId}
          </p>
        </div>
      </div>
    );
  }

  if (card === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans text-slate-800">
        <div className="text-center p-6 bg-white border border-slate-200 rounded-lg max-w-sm w-full shadow-2xs">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
          <h2 className="text-sm font-semibold text-slate-900">
            Certificate Not Found
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Card ID <code className="text-slate-800 font-bold">{cardId}</code> was not found in the official registry.
          </p>
        </div>
      </div>
    );
  }

  const active = isCardActive(card.validTo);
  const cardURL =
    typeof window !== "undefined"
      ? `${window.location.origin}/c/${card.CardId}`
      : `https://shree-ganeshay.vercel.app/c/${card.CardId}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
      <div className="max-w-xl mx-auto w-full">
        {/* Clinic Header */}
        <div className="text-center pb-5 mb-5 border-b border-slate-200">
       
          <h1 className="text-base font-bold text-slate-900 tracking-tight">
            Shree Ganeshay Dental Clinic
          </h1>
          <p className="text-xs text-teal-800 font-medium">
            Dental Prosthetics & Implant Warranty Certificate
          </p>
        </div>

        {/* Certificate Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-2xs space-y-5">
          {/* Status Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                Verification Status
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                {active ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-700">
                      Active Clinic Warranty
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span className="text-xs font-semibold text-rose-700">
                      Warranty Expired
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                Certificate ID
              </span>
              <span className="text-xs font-mono font-bold text-slate-900">
                {card.CardId}
              </span>
            </div>
          </div>

          {/* Patient Details */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">
                Patient Name
              </span>
              <span className="text-sm font-bold text-slate-900 block">
                {card.patient}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">
                Case ID
              </span>
              <span className="text-sm font-mono font-bold text-teal-800 block">
                {card.caseId}
              </span>
            </div>
          </div>

          {/* Clinical Details List */}
          <div className="space-y-2.5 text-xs bg-slate-50 p-3.5 rounded-md border border-slate-200">
            <div className="flex justify-between items-center py-1 border-b border-slate-200/70">
              <span className="text-slate-500">Attending Doctor</span>
              <span className="font-semibold text-slate-900">
                {card.doctor}{" "}
                {card.doctorMobile && (
                  <span className="text-slate-400 font-normal">
                    ({card.doctorMobile})
                  </span>
                )}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-200/70">
              <span className="text-slate-500">Certified Laboratory</span>
              <span className="font-semibold text-slate-900">
                {card.lab}{" "}
                {card.labMobile && (
                  <span className="text-slate-400 font-normal">
                    ({card.labMobile})
                  </span>
                )}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-200/70">
              <span className="text-slate-500">Issue Date</span>
              <span className="font-semibold text-slate-900">
                {card.validFrom}
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Warranty Expiration</span>
              <span
                className={`font-semibold ${
                  active ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                {card.validTo}
              </span>
            </div>
          </div>

          {/* QR & Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="bg-white p-1.5 rounded border border-slate-200 shadow-2xs">
                <QRCodeCanvas
                  value={cardURL}
                  size={60}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">
                  Scan to reverify anytime
                </span>
              
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>

              {card.doctorMobile && (
                <a
                  href={`tel:${card.doctorMobile.replace(/\s+/g, "")}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-teal-700 hover:bg-teal-800 text-white transition-colors shadow-2xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Doctor</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="text-center text-[11px] text-slate-400 py-6">
        © {new Date().getFullYear()} Shree Ganeshay Dental Clinic. Terms and conditions apply.
      </footer>
    </div>
  );
}