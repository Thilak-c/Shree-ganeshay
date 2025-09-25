"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  CreditCard, 
  Receipt, 
  DollarSign, 
  Calendar, 
  User, 
  Building2, 
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  ChevronDown,
  Check
} from "lucide-react";

// Custom Dropdown Component
function CustomDropdown({ value, onChange, options, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedOption = options.find(opt => opt.value === value);
  
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
      >
        <span className={selectedOption?.value ? "text-white" : "text-white/60"}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown className={`w-5 h-5 text-white/60 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-white/20 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center justify-between ${
                option.value === value ? 'bg-blue-500/20 text-blue-400' : 'text-white'
              }`}
            >
              <span>{option.label}</span>
              {option.value === value && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BillingSystem() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateBill, setShowCreateBill] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Fetch data
  const bills = useQuery(api.billing.getAllBills);
  const cards = useQuery(api.cards.getAllCards);
  
  // Mutations
  const createBill = useMutation(api.billing.createBill);
  const updateBillStatus = useMutation(api.billing.updateBillStatus);

  // New bill form state
  const [newBill, setNewBill] = useState({
    cardId: "",
    patientName: "",
    doctorName: "",
    labName: "",
    services: [{ description: "", amount: 0 }],
    dueDate: "",
    notes: ""
  });

  const handleCreateBill = async () => {
    const totalAmount = newBill.services.reduce((sum, service) => sum + service.amount, 0);
    
    try {
      await createBill({
        cardId: newBill.cardId,
        patientName: newBill.patientName,
        doctorName: newBill.doctorName,
        labName: newBill.labName,
        services: newBill.services,
        totalAmount,
        dueDate: newBill.dueDate,
        notes: newBill.notes,
        status: "pending",
        createdAt: new Date().toISOString()
      });
      
      setShowCreateBill(false);
      setNewBill({
        cardId: "",
        patientName: "",
        doctorName: "",
        labName: "",
        services: [{ description: "", amount: 0 }],
        dueDate: "",
        notes: ""
      });
    } catch (error) {
      console.error("Error creating bill:", error);
    }
  };

  const addService = () => {
    setNewBill({
      ...newBill,
      services: [...newBill.services, { description: "", amount: 0 }]
    });
  };

  const updateService = (index, field, value) => {
    const updatedServices = newBill.services.map((service, i) =>
      i === index ? { ...service, [field]: value } : service
    );
    setNewBill({ ...newBill, services: updatedServices });
  };

  const removeService = (index) => {
    setNewBill({
      ...newBill,
      services: newBill.services.filter((_, i) => i !== index)
    });
  };

  // Filter bills based on search and status
  const filteredBills = bills?.filter(bill => {
    const matchesSearch = searchTerm === "" || 
      bill.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.cardId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || bill.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const totalRevenue = bills?.filter(b => b.status === "paid").reduce((sum, bill) => sum + bill.totalAmount, 0) || 0;
  const pendingAmount = bills?.filter(b => b.status === "pending").reduce((sum, bill) => sum + bill.totalAmount, 0) || 0;
  const overdueAmount = bills?.filter(b => b.status === "overdue").reduce((sum, bill) => sum + bill.totalAmount, 0) || 0;

  const getStatusColor = (status) => {
    switch (status) {
      case "paid": return "text-green-400 bg-green-500/20";
      case "pending": return "text-yellow-400 bg-yellow-500/20";
      case "overdue": return "text-red-400 bg-red-500/20";
      case "cancelled": return "text-gray-400 bg-gray-500/20";
      default: return "text-white/60 bg-white/10";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "paid": return <CheckCircle className="w-4 h-4" />;
      case "pending": return <Clock className="w-4 h-4" />;
      case "overdue": return <AlertCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (bills === undefined || cards === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 flex items-center justify-center">
        <div className="text-center p-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Loading billing system...</p>
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
             Billing 
          </h1>
          <p className="text-white/70">Comprehensive billing and payment management</p>
          <a href="/allcard" className="underline">Cards</a>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20 mb-8">
          <div className="flex gap-2">
            {["overview", "bills", "create"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab === "overview" && "Overview"}
                {tab === "bills" && "All Bills"}
                {tab === "create" && "Create Bill"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Total Revenue</p>
                    <p className="text-white text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Pending</p>
                    <p className="text-white text-2xl font-bold">${pendingAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Overdue</p>
                    <p className="text-white text-2xl font-bold">${overdueAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Receipt className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Total Bills</p>
                    <p className="text-white text-2xl font-bold">{bills?.length || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Bills */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-xl font-semibold text-white">Recent Bills</h3>
              </div>
              <div className="divide-y divide-white/10">
                {bills?.slice(0, 5).map((bill) => (
                  <div key={bill._id} className="p-6 hover:bg-white/5 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <Receipt className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{bill.patientName}</p>
                          <p className="text-white/60 text-sm">Card: {bill.cardId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">${bill.totalAmount}</p>
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(bill.status)}`}>
                          {getStatusIcon(bill.status)}
                          {bill.status}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bills Tab */}
        {activeTab === "bills" && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search bills by patient name, doctor, or card ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <CustomDropdown
                  value={filterStatus}
                  onChange={(value) => setFilterStatus(value)}
                  options={[
                    { value: "all", label: "All Status" },
                    { value: "pending", label: "Pending" },
                    { value: "paid", label: "Paid" },
                    { value: "overdue", label: "Overdue" },
                    { value: "cancelled", label: "Cancelled" }
                  ]}
                  placeholder="Filter by status"
                />
              </div>
            </div>

            {/* Bills List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredBills?.map((bill) => (
                <div key={bill._id} className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden hover:bg-white/15 transition-all duration-300">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{bill.patientName}</h3>
                          <p className="text-white/60 text-sm">Card: {bill.cardId}</p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(bill.status)}`}>
                        {getStatusIcon(bill.status)}
                        {bill.status}
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-white/60" />
                        <span className="text-white/80 text-sm">{bill.doctorName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-white/60" />
                        <span className="text-white/80 text-sm">Due: {bill.dueDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-white/60" />
                        <span className="text-white font-semibold">${bill.totalAmount}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {/* View bill details */}}
                        className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      {bill.status === "pending" && (
                        <button
                          onClick={() => updateBillStatus({ id: bill._id, status: "paid" })}
                          className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                        >
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Bill Tab */}
        {activeTab === "create" && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-semibold text-white mb-6">Create New Bill</h3>
              
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Card ID</label>
                    <select
                      value={newBill.cardId}
                      onChange={(e) => {
                        const selectedCard = cards?.find(card => card.CardId === e.target.value);
                        setNewBill({
                          ...newBill,
                          cardId: e.target.value,
                          patientName: selectedCard?.patient || "",
                          doctorName: selectedCard?.doctor || "",
                          labName: selectedCard?.lab || ""
                        });
                      }}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a card</option>
                      {cards?.map(card => (
                        <option key={card._id} value={card.CardId}>
                          {card.CardId} - {card.patient}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Due Date</label>
                    <input
                      type="date"
                      value={newBill.dueDate}
                      onChange={(e) => setNewBill({ ...newBill, dueDate: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Services */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-white/80 text-sm font-medium">Services</label>
                    <button
                      onClick={addService}
                      className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Service
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {newBill.services.map((service, index) => (
                      <div key={index} className="flex gap-4 items-center">
                        <input
                          type="text"
                          placeholder="Service description"
                          value={service.description}
                          onChange={(e) => updateService(index, "description", e.target.value)}
                          className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="number"
                          placeholder="Amount"
                          value={service.amount}
                          onChange={(e) => updateService(index, "amount", parseFloat(e.target.value) || 0)}
                          className="w-32 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {newBill.services.length > 1 && (
                          <button
                            onClick={() => removeService(index)}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded-lg transition-colors duration-200"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Notes (Optional)</label>
                  <textarea
                    value={newBill.notes}
                    onChange={(e) => setNewBill({ ...newBill, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Additional notes or comments..."
                  />
                </div>

                {/* Total */}
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Total Amount:</span>
                    <span className="text-white text-2xl font-bold">
                      ${newBill.services.reduce((sum, service) => sum + service.amount, 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-6">
                  <button
                    onClick={handleCreateBill}
                    disabled={!newBill.cardId || newBill.services.some(s => !s.description || s.amount <= 0)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                  >
                    Create Bill
                  </button>
                  <button
                    onClick={() => setActiveTab("bills")}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}