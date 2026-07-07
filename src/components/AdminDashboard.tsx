"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Calendar as CalendarIcon, 
  Settings, 
  LogOut, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  FileDown, 
  Plus, 
  Trash2,
  ChevronRight,
  Info,
  DollarSign,
  Briefcase,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import BookingCalendar from "./BookingCalendar";

// Extend jsPDF with autotable types
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

type Tab = "overview" | "bookings" | "calendar" | "pricing" | "settings";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [bookings, setBookings] = useState<any[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [pricing, setPricing] = useState<any>(null);
  const [pricingDraft, setPricingDraft] = useState<any>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [newOfferForm, setNewOfferForm] = useState({
    title: "",
    description: "",
    code: "",
    discountPercent: "10",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [bookRes, configRes] = await Promise.all([
        fetch("/api/admin/bookings"),
        fetch("/api/admin/config")
      ]);

      if (bookRes.status === 401 || configRes.status === 401) {
        router.push("/admin/login");
        return;
      }

      const bookData = await bookRes.json();
      const configData = await configRes.json();

      setBookings(bookData.bookings || []);
      setBlockedDates(configData.blockedDates?.map((d: any) => d.date) || []);
      setPricing(configData.pricing);
      setPricingDraft(configData.pricing);
      setOffers(configData.offers || []);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) fetchDashboardData();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const handleToggleBlockDate = async (date: string) => {
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_block_date", date })
      });
      if (res.ok) fetchDashboardData();
    } catch (err) {
      console.error("Failed to toggle blocked date", err);
    }
  };

  const handleSavePricing = async () => {
    try {
      if (!pricingDraft) return;
      setActionMessage("");
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_pricing", pricing: pricingDraft }),
      });
      if (!res.ok) throw new Error("Unable to save pricing.");
      setActionMessage("Pricing updated successfully.");
      fetchDashboardData();
    } catch (err) {
      console.error("Failed to save pricing", err);
    }
  };

  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_offer",
          ...newOfferForm,
        }),
      });
      if (!res.ok) throw new Error("Unable to add offer.");
      setNewOfferForm({ title: "", description: "", code: "", discountPercent: "10" });
      setActionMessage("Offer added successfully.");
      fetchDashboardData();
    } catch (err) {
      console.error("Failed to add offer", err);
    }
  };

  const handleToggleOffer = async (id: string) => {
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_offer", id }),
      });
      if (res.ok) fetchDashboardData();
    } catch (err) {
      console.error("Failed to toggle offer", err);
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter(b => b.status === "pending").length;
    const accepted = bookings.filter(b => b.status === "accepted").length;
    const revenue = bookings
      .filter(b => b.status === "accepted" || b.status === "completed")
      .reduce((acc, curr) => acc + (curr.price || 0), 0);
    const upcoming = bookings.filter(b => {
      const bDate = new Date(b.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return bDate >= today && b.status === "accepted";
    }).length;

    return { total, pending, accepted, revenue, upcoming };
  }, [bookings]);

  // Filtering bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchesSearch = 
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.mobile.includes(searchTerm);
      const matchesStatus = statusFilter === "all" || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  // Export functions
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Chennai Mehendi Art - Bookings Report", 14, 15);
    const tableData = filteredBookings.map(b => [
      b.id, b.date, b.name, b.mobile, b.packageOrGuest, b.price, b.status
    ]);
    doc.autoTable({
      head: [["ID", "Date", "Name", "Mobile", "Type", "Amount", "Status"]],
      body: tableData,
      startY: 25,
    });
    doc.save(`bookings_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredBookings);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bookings");
    XLSX.writeFile(wb, `bookings_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mehendi-bg">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-mehendi-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-mehendi-dark font-serif animate-pulse">Initializing Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-mehendi-darker text-white p-6 flex flex-col z-20">
        <div className="flex items-center space-x-3 mb-10">
          <Sparkles className="h-6 w-6 text-mehendi-gold" />
          <h1 className="font-serif font-bold text-lg tracking-wide">Artist Admin</h1>
        </div>

        <nav className="flex-grow space-y-2">
          {[
            { id: "overview", label: "Dashboard", icon: LayoutDashboard },
            { id: "bookings", label: "Bookings", icon: Users },
            { id: "calendar", label: "Calendar", icon: CalendarIcon },
            { id: "pricing", label: "Pricing & Services", icon: Briefcase },
            { id: "settings", label: "Settings", icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? "bg-mehendi-gold text-mehendi-darker font-bold shadow-lg" 
                  : "hover:bg-white/10 text-white/70"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button 
          onClick={handleLogout}
          className="mt-auto flex items-center space-x-3 px-4 py-3 rounded-xl text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-all"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-4 md:p-8 overflow-y-auto h-screen relative">
        <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-5">
          <svg width="400" height="400" viewBox="0 0 100 100" fill="#355E3B">
            <path d="M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm0 94C25.7 94 6 74.3 6 50S25.7 6 50 6s44 19.7 44 44-19.7 44-44 44z" />
          </svg>
        </div>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-serif font-bold text-mehendi-darker capitalize">{activeTab}</h2>
            <p className="text-sm text-mehendi-olive font-light">Management Portal • {new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}</p>
          </div>
          
          <div className="flex items-center space-x-3">
             <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-bold text-mehendi-darker">Chennai Mehendi Art</span>
                <span className="text-[10px] uppercase text-mehendi-gold tracking-widest">Main Branch</span>
             </div>
             <div className="h-10 w-10 rounded-full bg-mehendi-gold/20 border border-mehendi-gold flex items-center justify-center">
                <Users className="h-5 w-5 text-mehendi-dark" />
             </div>
          </div>
        </header>

        {actionMessage && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {actionMessage}
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Revenue Estimate", val: `₹${stats.revenue}`, icon: DollarSign, color: "bg-green-100 text-green-700" },
                  { label: "Total Bookings", val: stats.total, icon: Users, color: "bg-blue-100 text-blue-700" },
                  { label: "Upcoming Events", val: stats.upcoming, icon: CalendarIcon, color: "bg-amber-100 text-amber-700" },
                  { label: "Pending Review", val: stats.pending, icon: Clock, color: "bg-purple-100 text-purple-700" },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-mehendi-gold/10 flex items-center space-x-4">
                    <div className={`p-3 rounded-2xl ${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.label}</p>
                      <p className="text-2xl font-serif font-bold text-mehendi-darker">{stat.val}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions & Recent */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 bg-white p-6 rounded-3xl shadow-sm border border-mehendi-gold/10">
                  <h3 className="font-serif font-bold text-lg text-mehendi-darker mb-6">Recent Pending Bookings</h3>
                  <div className="space-y-4">
                    {bookings.filter(b => b.status === "pending").slice(0, 5).length > 0 ? (
                      bookings.filter(b => b.status === "pending").slice(0, 5).map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-4 bg-mehendi-bg/20 rounded-2xl border border-transparent hover:border-mehendi-gold/20 transition-all">
                          <div className="flex items-center space-x-4">
                            <div className="h-10 w-10 rounded-full bg-mehendi-dark/10 flex items-center justify-center font-bold text-mehendi-dark">
                              {booking.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-mehendi-darker">{booking.name}</p>
                              <p className="text-[10px] text-gray-500">{booking.date} • {booking.packageName || booking.designType}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleUpdateStatus(booking.id, "accepted")}
                              className="p-2 rounded-full bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all shadow-sm"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(booking.id, "rejected")}
                              className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10">
                        <CheckCircle className="h-12 w-12 text-mehendi-gold mx-auto mb-4 opacity-20" />
                        <p className="text-sm text-gray-400">All caught up! No pending bookings.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-4 bg-mehendi-darker p-6 rounded-3xl shadow-xl text-white overflow-hidden relative">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                      <TrendingUp size={100} />
                   </div>
                   <h3 className="font-serif font-bold text-lg mb-4 text-mehendi-gold">Quick Statistics</h3>
                   <div className="space-y-6 relative z-10">
                      <div className="flex justify-between items-center">
                         <span className="text-white/60 text-sm">Acceptance Rate</span>
                         <span className="font-bold text-lg">{Math.round((stats.accepted / (stats.total || 1)) * 100)}%</span>
                      </div>
                      <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                         <div className="bg-mehendi-gold h-full" style={{ width: `${(stats.accepted / (stats.total || 1)) * 100}%` }} />
                      </div>
                      <div className="pt-4 border-t border-white/10">
                         <p className="text-xs text-white/50 mb-2 uppercase tracking-widest">Next Major Event</p>
                         {bookings.filter(b => b.status === "accepted").sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] ? (
                            <div className="flex items-center space-x-3">
                               <div className="bg-white/10 p-2 rounded-lg">
                                  <CalendarIcon className="h-5 w-5 text-mehendi-gold" />
                               </div>
                               <div>
                                  <p className="font-bold text-sm">{bookings.filter(b => b.status === "accepted").sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0].date}</p>
                                  <p className="text-[10px] text-white/60">{bookings.filter(b => b.status === "accepted").sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0].name}</p>
                               </div>
                            </div>
                         ) : (
                           <p className="text-sm text-white/40 italic">No upcoming events scheduled</p>
                         )}
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "bookings" && (
            <motion.div 
              key="bookings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Filters Toolbar */}
              <div className="bg-white p-4 rounded-3xl shadow-sm border border-mehendi-gold/10 flex flex-col md:flex-row gap-4 items-center">
                 <div className="relative flex-grow w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search customer name, ID or phone..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-gray-100 focus:border-mehendi-gold focus:ring-1 focus:ring-mehendi-gold outline-none text-sm"
                    />
                 </div>
                 <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full md:w-auto px-4 py-2.5 rounded-2xl border border-gray-100 focus:border-mehendi-gold outline-none text-sm bg-white"
                 >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    <option value="cancelled">Cancelled</option>
                 </select>
                 <div className="flex space-x-2">
                    <button 
                      onClick={exportToExcel}
                      className="p-2.5 rounded-2xl bg-mehendi-bg text-mehendi-dark hover:bg-mehendi-dark hover:text-white transition-all border border-mehendi-gold/20"
                      title="Export to Excel"
                    >
                       <FileDown className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={exportToPDF}
                      className="p-2.5 rounded-2xl bg-mehendi-bg text-mehendi-dark hover:bg-mehendi-dark hover:text-white transition-all border border-mehendi-gold/20"
                      title="Export to PDF"
                    >
                       <FileDown className="h-5 w-5" />
                    </button>
                 </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-3xl shadow-sm border border-mehendi-gold/10 overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                       <thead className="bg-mehendi-bg/30 text-mehendi-darker text-[10px] uppercase tracking-widest font-bold">
                          <tr>
                             <th className="px-6 py-4">Customer</th>
                             <th className="px-6 py-4">Event Date</th>
                             <th className="px-6 py-4">Service</th>
                             <th className="px-6 py-4">Amount</th>
                             <th className="px-6 py-4">Status</th>
                             <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50">
                          {filteredBookings.length > 0 ? filteredBookings.map((b) => (
                             <tr key={b.id} className="hover:bg-mehendi-bg/5 transition-all group">
                                <td className="px-6 py-4">
                                   <div className="flex items-center space-x-3">
                                      <div className="h-8 w-8 rounded-full bg-mehendi-dark/5 flex items-center justify-center text-xs font-bold text-mehendi-dark">
                                         {b.name.charAt(0)}
                                      </div>
                                      <div>
                                         <p className="text-sm font-bold text-mehendi-darker">{b.name}</p>
                                         <p className="text-[10px] text-gray-400">{b.id}</p>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{b.date}</td>
                                <td className="px-6 py-4 text-xs text-gray-500 font-medium">
                                   {b.packageName || `${b.designType} (${b.subDesignName})`}
                                </td>
                                <td className="px-6 py-4 font-serif font-bold text-mehendi-dark">₹{b.price}</td>
                                <td className="px-6 py-4">
                                   <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                      b.status === "accepted" ? "bg-green-50 text-green-600 border border-green-100" :
                                      b.status === "pending" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                      "bg-red-50 text-red-600 border border-red-100"
                                   }`}>
                                      {b.status}
                                   </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                   <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      {b.status === "pending" && (
                                        <button 
                                          onClick={() => handleUpdateStatus(b.id, "accepted")}
                                          className="p-1.5 rounded-lg text-green-600 hover:bg-green-50"
                                        >
                                           <CheckCircle className="h-4 w-4" />
                                        </button>
                                      )}
                                      <button 
                                        onClick={() => handleUpdateStatus(b.id, "cancelled")}
                                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50"
                                      >
                                         <XCircle className="h-4 w-4" />
                                      </button>
                                      <button className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-50">
                                         <ChevronRight className="h-4 w-4" />
                                      </button>
                                   </div>
                                </td>
                             </tr>
                          )) : (
                            <tr>
                               <td colSpan={6} className="px-6 py-20 text-center text-gray-400 text-sm">No bookings found matching your search.</td>
                            </tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === "calendar" && (
            <motion.div 
              key="calendar"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
               <div className="lg:col-span-8">
                  <BookingCalendar 
                    selectedDate=""
                    onSelectDate={handleToggleBlockDate}
                    blockedDates={blockedDates}
                    loadingBlocked={false}
                  />
                  <div className="mt-6 bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start space-x-3">
                     <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                     <p className="text-xs text-amber-800 leading-relaxed">
                        <strong>Artist Tip:</strong> Clicking an available date in the calendar above will mark it as "Blocked" (for holidays or personal events). Clicking a blocked date will unblock it. Existing customer bookings are automatically marked as unavailable.
                     </p>
                  </div>
               </div>
               
               <div className="lg:col-span-4 space-y-6">
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-mehendi-gold/10">
                     <h3 className="font-serif font-bold text-lg text-mehendi-darker mb-4">Upcoming Schedule</h3>
                     <div className="space-y-4">
                        {bookings.filter(b => {
                           const bDate = new Date(b.date);
                           const today = new Date();
                           today.setHours(0,0,0,0);
                           return bDate >= today && b.status === "accepted";
                        }).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5).map(b => (
                           <div key={b.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl">
                              <div className="bg-mehendi-dark text-white px-3 py-1.5 rounded-xl text-center min-w-[50px]">
                                 <p className="text-[10px] uppercase font-bold">{new Date(b.date).toLocaleDateString('en-US', { month: 'short' })}</p>
                                 <p className="text-sm font-bold">{new Date(b.date).getDate()}</p>
                              </div>
                              <div>
                                 <p className="text-xs font-bold text-mehendi-darker">{b.name}</p>
                                 <p className="text-[9px] text-gray-500">{b.timeSlot}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === "pricing" && pricing && (
             <motion.div
               key="pricing"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="grid grid-cols-1 lg:grid-cols-2 gap-8"
             >
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-mehendi-gold/10">
                   <h3 className="font-serif font-bold text-lg text-mehendi-darker mb-6 flex items-center space-x-2">
                      <Sparkles className="h-5 w-5 text-mehendi-gold" />
                      <span>Bridal Packages Pricing</span>
                   </h3>
                   <div className="space-y-4">
                      {["package1", "package2", "package3"].map((id, i) => (
                        <div key={id} className="flex items-center justify-between p-4 bg-mehendi-bg/10 rounded-2xl">
                           <span className="text-sm font-medium text-mehendi-darker capitalize">Package {i+1}</span>
                           <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-400 font-serif">₹</span>
                              <input 
                                type="number" 
                          value={pricingDraft?.bridal?.[id] ?? pricing.bridal[id]}
                          onChange={(e) => setPricingDraft((prev: any) => ({
                           ...prev,
                           bridal: {
                            ...(prev?.bridal || pricing.bridal),
                            [id]: Number(e.target.value),
                           },
                          }))}
                                className="w-24 px-3 py-1.5 rounded-lg border border-gray-100 text-right font-serif font-bold text-mehendi-dark focus:border-mehendi-gold outline-none"
                              />
                           </div>
                        </div>
                      ))}
                   </div>
                 <button
                  onClick={handleSavePricing}
                  className="w-full mt-8 py-3 rounded-2xl bg-mehendi-dark text-white font-bold hover:bg-mehendi-darker transition-all"
                 >
                      Save Pricing Updates
                   </button>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-mehendi-gold/10">
                   <h3 className="font-serif font-bold text-lg text-mehendi-darker mb-6 flex items-center space-x-2">
                      <Sparkles className="h-5 w-5 text-mehendi-gold" />
                      <span>Special Offers & Coupons</span>
                   </h3>
                 <form onSubmit={handleAddOffer} className="space-y-4">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Offer title"
                      value={newOfferForm.title}
                      onChange={(e) => setNewOfferForm((prev) => ({ ...prev, title: e.target.value }))}
                      className="px-4 py-3 rounded-2xl border border-gray-100 focus:border-mehendi-gold outline-none text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Code"
                      value={newOfferForm.code}
                      onChange={(e) => setNewOfferForm((prev) => ({ ...prev, code: e.target.value }))}
                      className="px-4 py-3 rounded-2xl border border-gray-100 focus:border-mehendi-gold outline-none text-sm uppercase"
                    />
                   </div>
                   <input
                    type="text"
                    placeholder="Description"
                    value={newOfferForm.description}
                    onChange={(e) => setNewOfferForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-100 focus:border-mehendi-gold outline-none text-sm"
                   />
                   <input
                    type="number"
                    min={1}
                    placeholder="Discount %"
                    value={newOfferForm.discountPercent}
                    onChange={(e) => setNewOfferForm((prev) => ({ ...prev, discountPercent: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-100 focus:border-mehendi-gold outline-none text-sm"
                   />
                   <button className="w-full flex items-center justify-center space-x-2 py-3 rounded-2xl bg-mehendi-dark text-white font-bold hover:bg-mehendi-darker transition-all">
                    <Plus className="h-4 w-4" />
                    <span>Add Offer</span>
                   </button>
                 </form>

                 <div className="space-y-4 mt-6">
                      {offers.map(offer => (
                        <div key={offer.id} className="p-4 border border-gray-100 rounded-2xl flex items-center justify-between">
                           <div>
                              <p className="text-sm font-bold text-mehendi-darker">{offer.title}</p>
                              <code className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-100">{offer.code}</code>
                           </div>
                           <div className="flex items-center space-x-3">
                              <span className="text-xs font-bold text-green-600">{offer.discountPercent}% Off</span>
                        <button onClick={() => handleToggleOffer(offer.id)} className="text-red-400 hover:text-red-600 p-1">
                                 <Trash2 className="h-4 w-4" />
                              </button>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl bg-white p-10 rounded-3xl shadow-sm border border-mehendi-gold/10"
            >
               <h3 className="font-serif text-xl font-bold text-mehendi-darker mb-8">Account & Portal Settings</h3>
               <div className="space-y-6">
                  <div className="flex flex-col space-y-2">
                     <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Admin Username</label>
                     <input type="text" defaultValue="admin" className="px-4 py-3 rounded-2xl border border-gray-100 focus:border-mehendi-gold outline-none" />
                  </div>
                  <div className="flex flex-col space-y-2">
                     <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">New Password</label>
                     <input type="password" placeholder="Leave empty to keep current" className="px-4 py-3 rounded-2xl border border-gray-100 focus:border-mehendi-gold outline-none" />
                  </div>
                  <div className="pt-4 flex items-center justify-between border-t border-gray-50 mt-8">
                     <div className="flex flex-col">
                        <span className="text-sm font-bold text-mehendi-darker">Email Notifications</span>
                        <span className="text-xs text-gray-400">Receive alerts for new bookings</span>
                     </div>
                     <div className="w-12 h-6 bg-mehendi-gold rounded-full relative p-1 cursor-pointer">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                     </div>
                  </div>
                  <button className="w-full mt-10 py-4 bg-mehendi-dark text-white font-bold rounded-2xl hover:bg-mehendi-darker transition-all shadow-md">
                     Update Admin Profile
                  </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
