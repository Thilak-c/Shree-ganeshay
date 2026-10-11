"use client";

import { useState, useEffect, Suspense } from "react";
import { useQuery, useMutation } from "convex/react";
import { useSearchParams } from "next/navigation";
import { api } from "../../convex/_generated/api";
import Navbar from "@/components/Navbar";
import {
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  Printer,
  X,
  AlertTriangle
} from "lucide-react";

function BillingContent() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries & Mutations
  const bills = useQuery(api.billing.getAllBills);
  const cards = useQuery(api.cards.getAllCards);
  const createBill = useMutation(api.billing.createBill);
  const updateBillStatus = useMutation(api.billing.updateBillStatus);

  const getDefaultDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  };

  // New bill form
  const [newBill, setNewBill] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return {
      cardId: "",
      patientName: "",
      doctorName: "Dr. Thilak",
      labName: "DentCraft Precision Lab",
      services: [{ description: "Crown Prosthesis (Zirconia)", amount: 4500 }],
      dueDate: d.toISOString().split("T")[0],
      notes: "",
    };
  });

  // Prepopulate from URL params if arrived from Card Studio or Registry
  useEffect(() => {
    const cardIdParam = searchParams.get("cardId");
    const patientParam = searchParams.get("patient");
    const doctorParam = searchParams.get("doctor");
    const labParam = searchParams.get("lab");

    if (cardIdParam || patientParam) {
      setNewBill((prev) => ({
        ...prev,
        cardId: cardIdParam || prev.cardId,
        patientName: patientParam || prev.patientName,
        doctorName: doctorParam || prev.doctorName,
        labName: labParam || prev.labName,
      }));
      setShowCreateModal(true);
    }
  }, [searchParams]);

  const handleSelectCard = (cardId) => {
    const card = cards?.find((c) => c.CardId === cardId);
    if (card) {
      setNewBill((prev) => ({
        ...prev,
        cardId: card.CardId,
        patientName: card.patient,
        doctorName: card.doctor || prev.doctorName,
        labName: card.lab || prev.labName,
      }));
    } else {
      setNewBill((prev) => ({ ...prev, cardId }));
    }
  };

  const handleAddService = () => {
    setNewBill((prev) => ({
      ...prev,
      services: [...prev.services, { description: "", amount: 0 }],
    }));
  };

  const handleServiceChange = (index, field, value) => {
    const updated = [...newBill.services];
    updated[index] = {
      ...updated[index],
      [field]: field === "amount" ? Number(value) || 0 : value,
    };
    setNewBill((prev) => ({ ...prev, services: updated }));
  };

  const handleRemoveService = (index) => {
    if (newBill.services.length <= 1) return;
    setNewBill((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }));
  };

  const totalAmount = newBill.services.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );

  const handleSubmitBill = async (e) => {
    e.preventDefault();
    if (!newBill.patientName.trim()) {
      alert("Please enter patient name.");
      return;
    }
    if (totalAmount <= 0) {
      alert("Total bill amount must be greater than zero.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createBill({
        cardId: newBill.cardId || "MANUAL",
        patientName: newBill.patientName.trim(),
        doctorName: newBill.doctorName.trim(),
        labName: newBill.labName.trim(),
        services: newBill.services.filter((s) => s.description.trim() !== ""),
        totalAmount: totalAmount,
        dueDate: newBill.dueDate,
        notes: newBill.notes?.trim() || undefined,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
      setShowCreateModal(false);
      setNewBill({
        cardId: "",
        patientName: "",
        doctorName: "Dr. Thilak",
        labName: "DentCraft Precision Lab",
        services: [{ description: "", amount: 0 }],
        dueDate: getDefaultDueDate(),
        notes: "",
      });
    } catch (err) {
      console.error("Create bill error:", err);
      alert("Failed to create bill.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusToggle = async (bill) => {
    const nextStatus = bill.status === "paid" ? "pending" : "paid";
    try {
      await updateBillStatus({ id: bill._id, status: nextStatus });
    } catch (err) {
      console.error("Status update error:", err);
      alert("Failed to update status.");
    }
  };

  const [removedBillIds, setRemovedBillIds] = useState([]);

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate?._id) return;
    const targetId = deleteCandidate._id;
    setRemovedBillIds((prev) => [...prev, targetId]);
    setDeleteCandidate(null);

    try {
      await updateBillStatus({ id: targetId, status: "cancelled" });
    } catch (err) {
      console.warn("Backend sync notice for bill deletion:", err);
    }
  };

  // Calculations (active bills only, excluding cancelled or locally removed)
  const allBills = (bills || []).filter(
    (b) => b.status !== "cancelled" && !removedBillIds.includes(b._id)
  );
  const totalBilled = allBills.reduce((s, b) => s + (b.totalAmount || 0), 0);
  const totalPaid = allBills
    .filter((b) => b.status === "paid")
    .reduce((s, b) => s + (b.totalAmount || 0), 0);
  const totalPending = totalBilled - totalPaid;

  // Filter
  const filteredBills = allBills.filter((bill) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      bill.patientName?.toLowerCase().includes(term) ||
      bill.cardId?.toLowerCase().includes(term) ||
      bill.services?.some((s) => s.description.toLowerCase().includes(term));

    const matchesStatus =
      statusFilter === "all" || bill.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Billing & Invoices
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Financial ledger for patient dental procedures, balances, and receipts
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Invoice</span>
          </button>
        </div>

        {/* Financial Summaries */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
          <div className="bg-white border border-slate-200 rounded-md p-3 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-medium block">
              Total Invoiced
            </span>
            <span className="text-lg font-bold text-slate-900 block mt-0.5">
              ₹{totalBilled.toLocaleString("en-IN")}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              {allBills.length} recorded invoices
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-md p-3 shadow-2xs">
            <span className="text-[11px] text-emerald-700 font-medium block">
              Paid / Collected
            </span>
            <span className="text-lg font-bold text-emerald-700 block mt-0.5">
              ₹{totalPaid.toLocaleString("en-IN")}
            </span>
            <span className="text-[11px] text-emerald-600/80 mt-0.5 block">
              {allBills.filter((b) => b.status === "paid").length} cleared invoices
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-md p-3 shadow-2xs">
            <span className="text-[11px] text-amber-700 font-medium block">
              Pending / Outstanding
            </span>
            <span className="text-lg font-bold text-amber-700 block mt-0.5">
              ₹{totalPending.toLocaleString("en-IN")}
            </span>
            <span className="text-[11px] text-amber-600/80 mt-0.5 block">
              {allBills.filter((b) => b.status === "pending").length} awaiting payment
            </span>
          </div>
        </div>

        {/* Search & Status Toolbar */}
        <div className="bg-white border border-slate-200 rounded-md p-3 mb-4 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by patient name, card ID, or procedure"
              className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-md pl-9 pr-3 py-1.5 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-100"
            />
          </div>

          <div className="inline-flex rounded-md bg-slate-100 p-0.5 border border-slate-200">
            {["all", "pending", "paid"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded text-xs font-medium capitalize transition-colors ${
                  statusFilter === status
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Invoice Table */}
        {bills === undefined ? (
          <div className="py-16 text-center bg-white border border-slate-200 rounded-md">
            <div className="w-6 h-6 rounded-full border-2 border-teal-600 border-t-transparent animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Loading invoices...</p>
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="py-14 text-center bg-white border border-slate-200 rounded-md">
            <p className="text-sm font-medium text-slate-700">
              No invoices match your selection
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Create an invoice to bill a patient procedure.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[10px] font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Patient & Card</th>
                    <th className="py-2.5 px-4">Services / Procedures</th>
                    <th className="py-2.5 px-4">Amount</th>
                    <th className="py-2.5 px-4">Due Date</th>
                    <th className="py-2.5 px-4">Payment Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBills.map((bill) => {
                    const isPaid = bill.status === "paid";
                    return (
                      <tr
                        key={bill._id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="py-2.5 px-4">
                          <div className="font-semibold text-slate-900 text-xs">
                            {bill.patientName}
                          </div>
                          <div className="font-mono text-teal-800 text-[10px]">
                            Card: {bill.cardId}
                          </div>
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="space-y-0.5">
                            {bill.services?.slice(0, 2).map((s, i) => (
                              <div
                                key={i}
                                className="text-slate-700 text-[11px] truncate max-w-xs"
                              >
                                • {s.description} (₹{s.amount})
                              </div>
                            ))}
                            {bill.services?.length > 2 && (
                              <span className="text-[10px] text-slate-400">
                                +{bill.services.length - 2} more items
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="font-bold text-slate-900 text-xs">
                            ₹{bill.totalAmount?.toLocaleString("en-IN")}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-700">
                          {bill.dueDate || "-"}
                        </td>
                        <td className="py-2.5 px-4">
                          <button
                            onClick={() => handleStatusToggle(bill)}
                            title="Click to toggle Paid/Pending"
                            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded transition-colors ${
                              isPaid
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                            }`}
                          >
                            {isPaid ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Clock className="w-3 h-3 text-amber-600" />
                            )}
                            <span className="capitalize">{bill.status}</span>
                          </button>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => setSelectedReceipt(bill)}
                              title="Print / View Receipt"
                              className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setDeleteCandidate(bill)}
                              title="Delete invoice"
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

        {/* Create Invoice Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs">
            <div className="bg-white border border-slate-200 rounded-lg max-w-lg w-full p-5 shadow-lg space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900">
                  Create Patient Invoice
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitBill} className="space-y-3.5 text-xs">
                {(() => {
                  const uniqueCards = [];
                  const seenCardIds = new Set();
                  (cards || []).forEach((c) => {
                    if (!c || !c.CardId) return;
                    if (!seenCardIds.has(c.CardId)) {
                      seenCardIds.add(c.CardId);
                      uniqueCards.push(c);
                    }
                  });

                  return uniqueCards.length > 0 ? (
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        Link Registered Card (Optional)
                      </label>
                      <select
                        value={newBill.cardId}
                        onChange={(e) => handleSelectCard(e.target.value)}
                        className="w-full bg-white border border-slate-300 text-slate-800 rounded-md px-3 py-1.5 outline-none focus:border-teal-600"
                      >
                        <option value="">Manual Entry (No Card Linked)</option>
                        {uniqueCards.map((c) => (
                          <option key={c._id} value={c.CardId}>
                            {c.patient} — {c.caseId} (Card: {c.CardId})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null;
                })()}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      Patient Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newBill.patientName}
                      onChange={(e) =>
                        setNewBill((p) => ({ ...p, patientName: e.target.value }))
                      }
                      placeholder="Patient Name"
                      className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-3 py-1.5 outline-none focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={newBill.dueDate}
                      onChange={(e) =>
                        setNewBill((p) => ({ ...p, dueDate: e.target.value }))
                      }
                      className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-3 py-1.5 outline-none focus:border-teal-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      Doctor
                    </label>
                    <input
                      type="text"
                      value={newBill.doctorName}
                      onChange={(e) =>
                        setNewBill((p) => ({ ...p, doctorName: e.target.value }))
                      }
                      className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-3 py-1.5 outline-none focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      Laboratory
                    </label>
                    <input
                      type="text"
                      value={newBill.labName}
                      onChange={(e) =>
                        setNewBill((p) => ({ ...p, labName: e.target.value }))
                      }
                      className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-3 py-1.5 outline-none focus:border-teal-600"
                    />
                  </div>
                </div>

                {/* Services items */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-800">
                      Procedures & Charges
                    </span>
                    <button
                      type="button"
                      onClick={handleAddService}
                      className="text-teal-700 hover:text-teal-800 text-[11px] font-medium"
                    >
                      + Add Procedure
                    </button>
                  </div>

                  <div className="space-y-2">
                    {newBill.services.map((item, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Procedure description"
                          value={item.description}
                          onChange={(e) =>
                            handleServiceChange(
                              idx,
                              "description",
                              e.target.value
                            )
                          }
                          className="flex-1 bg-white border border-slate-300 text-slate-900 rounded-md px-3 py-1.5 outline-none focus:border-teal-600"
                        />
                        <div className="w-28 relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                            ₹
                          </span>
                          <input
                            type="number"
                            placeholder="Amount"
                            value={item.amount || ""}
                            onChange={(e) =>
                              handleServiceChange(idx, "amount", e.target.value)
                            }
                            className="w-full bg-white border border-slate-300 text-slate-900 rounded-md pl-6 pr-2 py-1.5 outline-none focus:border-teal-600"
                          />
                        </div>
                        {newBill.services.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveService(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Total calculation */}
                  <div className="mt-3 p-2.5 bg-slate-50 rounded-md border border-slate-200 flex justify-between items-center">
                    <span className="text-slate-600 text-xs">Total Invoiced</span>
                    <span className="font-bold text-slate-900 text-sm">
                      ₹{totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-1.5 rounded-md text-xs font-medium bg-teal-700 text-white hover:bg-teal-800"
                  >
                    {isSubmitting ? "Creating..." : "Save Invoice"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Printable Official Receipt Modal */}
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs">
            <div className="bg-white text-slate-900 rounded-lg max-w-lg w-full p-6 shadow-xl space-y-4 border border-slate-200">
              <div className="flex justify-between items-start pb-3 border-b border-slate-200">
                <div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">
                    Shree Ganeshay Dental Clinic
                  </h2>
                  <p className="text-xs text-slate-500">
                    Official Treatment Invoice & Receipt
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-teal-800 block">
                    CARD: {selectedReceipt.cardId}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Date: {selectedReceipt.createdAt?.split("T")[0] || selectedReceipt.dueDate}
                  </span>
                </div>
              </div>

              {/* Patient / Doctor Meta */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-md border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    Patient Name
                  </span>
                  <span className="font-semibold text-slate-900">
                    {selectedReceipt.patientName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    Attending Doctor
                  </span>
                  <span className="font-semibold text-slate-900">
                    {selectedReceipt.doctorName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    Status
                  </span>
                  <span
                    className={`font-semibold capitalize ${
                      selectedReceipt.status === "paid"
                        ? "text-emerald-700"
                        : "text-amber-700"
                    }`}
                  >
                    {selectedReceipt.status}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    Due Date
                  </span>
                  <span className="font-semibold text-slate-900">
                    {selectedReceipt.dueDate || "-"}
                  </span>
                </div>
              </div>

              {/* Itemized Services */}
              <div className="border border-slate-200 rounded-md overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[10px] uppercase">
                    <tr>
                      <th className="p-2.5">Procedure</th>
                      <th className="p-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedReceipt.services?.map((item, i) => (
                      <tr key={i}>
                        <td className="p-2.5 text-slate-800">{item.description}</td>
                        <td className="p-2.5 text-right font-medium text-slate-900">
                          ₹{item.amount?.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                    <tr>
                      <td className="p-2.5 text-slate-700">Total</td>
                      <td className="p-2.5 text-right text-slate-900 text-sm">
                        ₹{selectedReceipt.totalAmount?.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <p className="text-[10px] text-slate-400 text-center">
                *Computer-generated receipt issued by Shree Ganeshay Dental Clinic.
              </p>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedReceipt(null)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-teal-700 text-white hover:bg-teal-800"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
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
                    Delete Invoice
                  </h3>
                  <p className="text-xs text-slate-500">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600">
                Are you sure you want to permanently delete the invoice for{" "}
                <strong className="text-slate-900">
                  {deleteCandidate.patientName}
                </strong>{" "}
                (₹{deleteCandidate.totalAmount?.toLocaleString("en-IN")})?
              </p>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setDeleteCandidate(null)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-rose-600 text-white hover:bg-rose-700"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function BillingSystem() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500">
          Loading billing system...
        </div>
      }
    >
      <BillingContent />
    </Suspense>
  );
}