"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import {
  Search,
  Copy,
  Check,
  Eye,
  Trash2,
  FilePlus,
  Share2,
  Plus,
  X,
  ExternalLink,
  AlertTriangle
} from "lucide-react";

export default function AllCardsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCard, setSelectedCard] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [removedCardIds, setRemovedCardIds] = useState([]);

  // Convex data & mutations
  const cards = useQuery(api.cards.getAllCards);
  const deleteCard = useMutation(api.cards.deleteCard);

  const isCardActive = (validTo) => {
    if (!validTo) return true;
    return new Date(validTo) >= new Date();
  };

  const activeCardsList = (cards || []).filter(
    (c) => !removedCardIds.includes(c._id)
  );

  // Filter and search
  const filteredCards = activeCardsList.filter((card) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      card.patient?.toLowerCase().includes(term) ||
      card.doctor?.toLowerCase().includes(term) ||
      card.caseId?.toLowerCase().includes(term) ||
      card.CardId?.toLowerCase().includes(term);

    const active = isCardActive(card.validTo);
    const matchesFilter =
      filterBy === "all" ||
      (filterBy === "active" && active) ||
      (filterBy === "expired" && !active);

    return matchesSearch && matchesFilter;
  });

  // Sort
  const sortedCards = filteredCards?.sort((a, b) => {
    if (sortBy === "patient") {
      return (a.patient || "").localeCompare(b.patient || "");
    }
    if (sortBy === "oldest") {
      return new Date(a.validFrom || 0) - new Date(b.validFrom || 0);
    }
    if (sortBy === "expiry") {
      return new Date(a.validTo || 0) - new Date(b.validTo || 0);
    }
    // newest default
    return new Date(b.validFrom || 0) - new Date(a.validFrom || 0);
  });

  const handleCopyUrl = (cardId) => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://shree-ganeshay.vercel.app";
    navigator.clipboard.writeText(`${origin}/c/${cardId}`);
    setCopiedId(cardId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareWhatsApp = (card) => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://shree-ganeshay.vercel.app";
    const url = `${origin}/c/${card.CardId}`;
    const text = encodeURIComponent(
      `Hello ${card.patient},\n\nYour Dental Warranty Card from Shree Ganeshay Dental Clinic:\nCard ID: ${card.CardId}\nValid Until: ${card.validTo}\n\nView official certificate: ${url}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate?._id) return;
    const targetId = deleteCandidate._id;
    setRemovedCardIds((prev) => [...prev, targetId]);
    setDeleteCandidate(null);
    if (selectedCard?._id === targetId) {
      setSelectedCard(null);
    }

    try {
      await deleteCard({ id: targetId });
    } catch (err) {
      console.warn("Backend sync notice for card deletion:", err);
    }
  };

  const totalCards = activeCardsList.length;
  const activeCount = activeCardsList.filter((c) => isCardActive(c.validTo)).length;
  const expiredCount = totalCards - activeCount;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Patient Card Registry
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Administrative directory of issued dental warranty and prosthetic cards
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate New Card</span>
          </Link>
        </div>

        {/* Compact Summary Metrics */}
        <div className="grid grid-cols-3 gap-3 my-4">
          <div className="bg-white border border-slate-200 rounded-md p-3 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-medium block">
              Total Cards
            </span>
            <span className="text-lg font-bold text-slate-900 block mt-0.5">
              {totalCards}
            </span>
          </div>
          <div className="bg-white border border-slate-200 rounded-md p-3 shadow-2xs">
            <span className="text-[11px] text-emerald-700 font-medium block">
              Active Warranties
            </span>
            <span className="text-lg font-bold text-emerald-700 block mt-0.5">
              {activeCount}
            </span>
          </div>
          <div className="bg-white border border-slate-200 rounded-md p-3 shadow-2xs">
            <span className="text-[11px] text-rose-700 font-medium block">
              Expired
            </span>
            <span className="text-lg font-bold text-rose-700 block mt-0.5">
              {expiredCount}
            </span>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white border border-slate-200 rounded-md p-3 mb-4 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by patient name, doctor, case ID, or card ID..."
              className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-md pl-9 pr-3 py-1.5 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-100"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md bg-slate-100 p-0.5 border border-slate-200">
              <button
                onClick={() => setFilterBy("all")}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  filterBy === "all"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterBy("active")}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  filterBy === "active"
                    ? "bg-white text-emerald-700 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterBy("expired")}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  filterBy === "expired"
                    ? "bg-white text-rose-700 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Expired
              </button>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-slate-300 text-slate-700 text-xs rounded-md px-2.5 py-1.5 outline-none focus:border-teal-600"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="patient">Patient Name (A-Z)</option>
              <option value="expiry">Expiry Date</option>
            </select>
          </div>
        </div>

        {/* Content Table */}
        {cards === undefined ? (
          <div className="py-16 text-center bg-white border border-slate-200 rounded-md">
            <div className="w-6 h-6 rounded-full border-2 border-teal-600 border-t-transparent animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Loading cards registry...</p>
          </div>
        ) : sortedCards?.length === 0 ? (
          <div className="py-14 text-center bg-white border border-slate-200 rounded-md">
            <p className="text-sm font-medium text-slate-700">
              No patient records found
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {searchTerm
                ? "No cards matched your search term."
                : "Create your first dental card in the studio."}
            </p>
            {!searchTerm && (
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-md text-xs font-medium bg-teal-700 text-white hover:bg-teal-800"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Card</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[10px] font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Patient</th>
                    <th className="py-2.5 px-4">Case / Card ID</th>
                    <th className="py-2.5 px-4">Doctor & Lab</th>
                    <th className="py-2.5 px-4">Validity</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedCards.map((card) => {
                    const active = isCardActive(card.validTo);
                    return (
                      <tr
                        key={card._id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="py-2.5 px-4">
                          <div className="font-semibold text-slate-900 text-xs">
                            {card.patient}
                          </div>
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="font-mono text-teal-800 text-[11px] font-medium">
                            {card.caseId}
                          </div>
                          <div className="font-mono text-slate-400 text-[10px]">
                            ID: {card.CardId}
                          </div>
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="text-slate-800">{card.doctor}</div>
                          <div className="text-slate-400 text-[11px]">
                            {card.lab}
                          </div>
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="text-slate-700">{card.validTo}</div>
                          <div className="text-slate-400 text-[10px]">
                            From: {card.validFrom}
                          </div>
                        </td>
                        <td className="py-2.5 px-4">
                          {active ? (
                            <span className="inline-flex items-center text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-[11px] font-medium text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                              Expired
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => setSelectedCard(card)}
                              title="View details & QR code"
                              className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleCopyUrl(card.CardId)}
                              title="Copy verification link"
                              className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                            >
                              {copiedId === card.CardId ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              onClick={() => handleShareWhatsApp(card)}
                              title="Share on WhatsApp"
                              className="p-1 rounded hover:bg-slate-100 text-emerald-600 hover:text-emerald-700"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>

                            <Link
                              href={`/billing?cardId=${card.CardId}&patient=${encodeURIComponent(card.patient)}&doctor=${encodeURIComponent(card.doctor || "")}&lab=${encodeURIComponent(card.lab || "")}`}
                              title="Create bill for this card"
                              className="p-1 rounded hover:bg-slate-100 text-teal-700 hover:text-teal-800"
                            >
                              <FilePlus className="w-3.5 h-3.5" />
                            </Link>

                            <button
                              onClick={() => setDeleteCandidate(card)}
                              title="Delete card"
                              className="p-1 rounded hover:bg-slate-100 text-rose-600 hover:text-rose-700"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* View Details Modal */}
        {selectedCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs">
            <div className="bg-white border border-slate-200 rounded-lg max-w-lg w-full p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900">
                  Card Certificate Details
                </h3>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-5 flex flex-col items-center bg-slate-50 p-4 rounded-md border border-slate-200">
                  <div className="bg-white p-2 rounded border border-slate-200 shadow-2xs">
                    <QRCodeCanvas
                      value={`${typeof window !== "undefined" ? window.location.origin : ""}/c/${selectedCard.CardId}`}
                      size={120}
                      level="H"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-2 font-mono">
                    ID: {selectedCard.CardId}
                  </span>
                </div>

                <div className="sm:col-span-7 space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">
                      Patient Name
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {selectedCard.patient}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">
                        Case ID
                      </span>
                      <span className="font-mono text-teal-800 font-semibold">
                        {selectedCard.caseId}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">
                        Valid Until
                      </span>
                      <span className="text-slate-800">
                        {selectedCard.validTo}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">
                      Doctor
                    </span>
                    <span className="text-slate-700">
                      {selectedCard.doctor} ({selectedCard.doctorMobile})
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">
                      Laboratory
                    </span>
                    <span className="text-slate-700">
                      {selectedCard.lab} ({selectedCard.labMobile})
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <a
                  href={`/c/${selectedCard.CardId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Public Verification</span>
                </a>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-teal-700 text-white hover:bg-teal-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs">
            <div className="bg-white border border-slate-200 rounded-lg max-w-sm w-full p-5 shadow-lg space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Delete Card Record
                  </h3>
                  <p className="text-xs text-slate-500">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600">
                Are you sure you want to remove the card for{" "}
                <strong className="text-slate-900">{deleteCandidate.patient}</strong>{" "}
                (Case: {deleteCandidate.caseId})?
              </p>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setDeleteCandidate(null)}
                  disabled={isDeleting}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-rose-600 text-white hover:bg-rose-700"
                >
                  {isDeleting ? "Deleting..." : "Delete Permanently"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}