"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Search, Filter, Calendar, User, Building2, Phone, Eye, Download, Copy } from "lucide-react";

export default function AllCardsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Fetch all cards from Convex
  const cards = useQuery(api.cards.getAllCards);

  // Filter and search cards
  const filteredCards = cards?.filter(card => {
    const matchesSearch = searchTerm === "" || 
      card.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.CardId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterBy === "all" || 
      (filterBy === "active" && new Date(card.validTo) > new Date()) ||
      (filterBy === "expired" && new Date(card.validTo) <= new Date());

    return matchesSearch && matchesFilter;
  });

  // Sort cards
  const sortedCards = filteredCards?.sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.validFrom) - new Date(a.validFrom);
      case "oldest":
        return new Date(a.validFrom) - new Date(b.validFrom);
      case "patient":
        return a.patient.localeCompare(b.patient);
      case "expiry":
        return new Date(a.validTo) - new Date(b.validTo);
      default:
        return 0;
    }
  });

  const copyCardUrl = (cardId) => {
    const url = `${window.location.origin}/c/${cardId}`;
    navigator.clipboard.writeText(url);
    // You might want to show a toast notification here
  };

  const isCardActive = (validTo) => {
    return new Date(validTo) > new Date();
  };

  if (cards === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 flex items-center justify-center">
        <div className="text-center p-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Loading cards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
         Cards Dashboard
          </h1>
          <p className="text-white/70">Manage and view all warranty cards</p>
          <a href="/billing" className="underline">Billing</a>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by patient name, doctor, case ID, or card ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter */}
            <div className="flex gap-4">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Cards</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="patient">Patient Name</option>
                <option value="expiry">Expiry Date</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">{cards?.length || 0}</p>
              <p className="text-white/60 text-sm">Total Cards</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-400">
                {cards?.filter(card => isCardActive(card.validTo)).length || 0}
              </p>
              <p className="text-white/60 text-sm">Active Cards</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-red-400">
                {cards?.filter(card => !isCardActive(card.validTo)).length || 0}
              </p>
              <p className="text-white/60 text-sm">Expired Cards</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="max-w-7xl mx-auto">
        {sortedCards?.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-white/60" />
            </div>
            <p className="text-white text-xl font-medium">No cards found</p>
            <p className="text-white/60 mt-2">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCards?.map((card) => (
              <div
                key={card._id}
                className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden hover:bg-white/15 transition-all duration-300 group"
              >
                {/* Card Header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">{card.patient}</h3>
                        <p className="text-white/60 text-sm">ID: {card.CardId}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isCardActive(card.validTo)
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {isCardActive(card.validTo) ? 'Active' : 'Expired'}
                    </div>
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-6 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-white/60" />
                      <div>
                        <p className="text-white/60 text-xs">Doctor</p>
                        <p className="text-white text-sm font-medium">{card.doctor}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-white/60" />
                      <div>
                        <p className="text-white/60 text-xs">Doctor Mobile</p>
                        <p className="text-white text-sm">{card.doctorMobile}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-white/60" />
                      <div>
                        <p className="text-white/60 text-xs">Laboratory</p>
                        <p className="text-white text-sm font-medium">{card.lab}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-white/60" />
                      <div>
                        <p className="text-white/60 text-xs">Valid Until</p>
                        <p className="text-white text-sm">{card.validTo}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-6 pt-0">
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.open(`/c/${card.CardId}`, '_blank')}
                      className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => copyCardUrl(card.CardId)}
                      className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-12">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
          <p className="text-white/60 text-sm">
         Cards Dashboard - Total of {sortedCards?.length || 0} cards displayed
          </p>
        </div>
      </div>
    </div>
  );
}