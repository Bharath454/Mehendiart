"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Calendar as CalendarIcon, 
  LogOut, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  FileDown, 
  Trash2,
  Info,
  DollarSign,
  Briefcase,
  Sparkles,
  Mail,
  Upload,
  Image as ImageIcon,
  Edit2,
  Loader2,
  RefreshCw,
  MessageSquare,
  Phone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import BookingCalendar from "./BookingCalendar";

type Tab = "overview" | "bookings" | "packages" | "designs" | "inquiries" | "calendar" | "pricing" | "settings";

interface BridalPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  includes: string[];
}

interface GuestDesign {
  id: string;
  name: string;
  type: "Arabic" | "Indian";
  price: number;
  image: string;
  description?: string;
}

interface Inquiry {
  id: string;
  name: string;
  email: string;
  mobile: string;
  message: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const formatSafeDate = (dateStr: any, options?: Intl.DateTimeFormatOptions): string => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "N/A";
      return d.toLocaleDateString('en-IN', options || { dateStyle: 'short' });
    } catch {
      return "N/A";
    }
  };

  const formatSafeMonth = (dateStr: any): string => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "N/A";
      return d.toLocaleDateString('en-US', { month: 'short' });
    } catch {
      return "N/A";
    }
  };

  const formatSafeDay = (dateStr: any): string => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      return d.getDate().toString();
    } catch {
      return "";
    }
  };

  const [bookings, setBookings] = useState<any[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [pricing, setPricing] = useState<any>(null);
  const [pricingDraft, setPricingDraft] = useState<any>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionMessage, setActionMessage] = useState("");

  // CRUD States
  const [packages, setPackages] = useState<BridalPackage[]>([]);
  const [designs, setDesigns] = useState<GuestDesign[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  // Package Form State
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [packageForm, setPackageForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    includesInput: ""
  });
  const [packageUploading, setPackageUploading] = useState(false);

  // Design Form State
  const [editingDesignId, setEditingDesignId] = useState<string | null>(null);
  const [designForm, setDesignForm] = useState({
    name: "",
    type: "Arabic" as "Arabic" | "Indian",
    price: "",
    image: "",
    description: ""
  });
  const [designUploading, setDesignUploading] = useState(false);

  // Auto-clear success messages after 4 seconds
  useEffect(() => {
    if (!actionMessage) return;
    const timer = setTimeout(() => setActionMessage(""), 4000);
    return () => clearTimeout(timer);
  }, [actionMessage]);

  /**
   * Silently attempt to refresh the access token using the refresh_token cookie.
   * Returns true if successful, false if the session is truly expired.
   */
  const tryRefreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/refresh", { method: "POST" });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  /**
   * Fetch wrapper that silently retries on 401 TOKEN_EXPIRED by refreshing first.
   */
  const authFetch = useCallback(
    async (url: string, options?: RequestInit): Promise<Response> => {
      const res = await fetch(url, options);

      if (res.status === 401) {
        const data = await res.clone().json().catch(() => ({}));
        if (data?.code === "TOKEN_EXPIRED") {
          const refreshed = await tryRefreshToken();
          if (refreshed) {
            // Retry the original request with the new token
            return fetch(url, options);
          }
        }
        // Not recoverable — redirect to login
        router.push("/login");
        throw new Error("Unauthorized");
      }

      return res;
    },
    [router, tryRefreshToken]
  );

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [bookRes, configRes, packRes, desRes, inqRes] = await Promise.all([
        authFetch("/api/admin/bookings"),
        authFetch("/api/admin/config"),
        fetch("/api/packages"),
        fetch("/api/designs"),
        authFetch("/api/inquiries")
      ]);

      const bookData = await bookRes.json();
      const configData = await configRes.json();
      const packData = await packRes.json();
      const desData = await desRes.json();
      const inqData = await inqRes.json();

      setBookings(bookData.bookings || []);
      setBlockedDates(configData.blockedDates?.map((d: any) => d.date) || []);
      setPricing(configData.pricing);
      setPricingDraft(configData.pricing);
      setOffers(configData.offers || []);
      setPackages(packData.packages || []);
      setDesigns(desData.designs || []);
      setInquiries(inqData.inquiries || []);
    } catch (err: any) {
      if (err?.message !== "Unauthorized") {
        console.error("Failed to load dashboard data", err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await authFetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        setActionMessage(`Booking status updated to ${status}`);
        fetchDashboardData();
      } else {
        const data = await res.json();
        setActionMessage(`Error: ${data.error || "Failed to update status"}`);
      }
    } catch (err: any) {
      if (err?.message !== "Unauthorized") console.error("Failed to update status", err);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm("Delete this booking? This cannot be undone.")) return;
    try {
      const res = await authFetch(`/api/admin/bookings?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setActionMessage("Booking deleted successfully.");
        fetchDashboardData();
      } else {
        const data = await res.json();
        setActionMessage(`Error: ${data.error || "Delete failed"}`);
      }
    } catch (err: any) {
      if (err?.message !== "Unauthorized") console.error("Delete booking error", err);
    }
  };

  const handleDeleteAllBookings = async () => {
    const count = bookings.length;
    if (!confirm(`Delete ALL ${count} booking(s)? This permanently removes every booking from the database and cannot be undone.`)) return;
    try {
      // Delete one-by-one using existing DELETE endpoint
      await Promise.all(bookings.map(b => authFetch(`/api/admin/bookings?id=${b.id}`, { method: "DELETE" })));
      setActionMessage(`All ${count} booking(s) deleted successfully.`);
      fetchDashboardData();
    } catch (err: any) {
      if (err?.message !== "Unauthorized") console.error("Delete all bookings error", err);
      setActionMessage("Some bookings could not be deleted.");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Proceed with redirect even if request fails
    }
    router.push("/login");
    router.refresh();
  };

  const handleToggleBlockDate = async (date: string) => {
    try {
      const res = await authFetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_block_date", date })
      });
      if (res.ok) {
        setActionMessage(`Date ${date} availability updated`);
        fetchDashboardData();
      }
    } catch (err: any) {
      if (err?.message !== "Unauthorized") console.error("Failed to toggle blocked date", err);
    }
  };

  // Image Upload helper
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "package" | "design") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    if (target === "package") setPackageUploading(true);
    else setDesignUploading(true);

    try {
      const res = await authFetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.url) {
        if (target === "package") {
          setPackageForm(prev => ({ ...prev, image: data.url }));
        } else {
          setDesignForm(prev => ({ ...prev, image: data.url }));
        }
        setActionMessage("Image uploaded successfully!");
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err: any) {
      if (err?.message !== "Unauthorized") {
        console.error("Upload error:", err);
        alert(err?.message || "Error uploading image");
      }
    } finally {
      setPackageUploading(false);
      setDesignUploading(false);
    }
  };

  // ─── Package Actions ──────────────────────────────────────────────────────
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageForm.name || !packageForm.description || !packageForm.price || !packageForm.image) {
      alert("Please fill in all package details and upload an image.");
      return;
    }

    const includes = packageForm.includesInput.split("\n").filter(i => i.trim() !== "");
    const body = {
      id: editingPackageId,
      name: packageForm.name,
      description: packageForm.description,
      price: Number(packageForm.price),
      image: packageForm.image,
      includes
    };

    try {
      const url = "/api/packages";
      const method = editingPackageId ? "PATCH" : "POST";
      const res = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        setActionMessage(editingPackageId ? "Package updated successfully" : "New package created");
        setPackageForm({ name: "", description: "", price: "", image: "", includesInput: "" });
        setEditingPackageId(null);
        fetchDashboardData();
      } else {
        const errData = await res.json();
        alert(errData.error || "Save failed");
      }
    } catch (err: any) {
      if (err?.message !== "Unauthorized") console.error(err);
    }
  };

  const handleEditPackage = (pkg: BridalPackage) => {
    setEditingPackageId(pkg.id);
    setPackageForm({
      name: pkg.name,
      description: pkg.description,
      price: String(pkg.price),
      image: pkg.image,
      includesInput: (pkg.includes || []).join("\n")
    });
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;
    try {
      const res = await authFetch(`/api/packages?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setActionMessage("Package deleted successfully");
        fetchDashboardData();
      }
    } catch (err: any) {
      if (err?.message !== "Unauthorized") console.error(err);
    }
  };

  // ─── Design Actions ───────────────────────────────────────────────────────
  const handleSaveDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!designForm.name || !designForm.price || !designForm.image) {
      alert("Please fill in all design details and upload an image.");
      return;
    }

    const body = {
      id: editingDesignId,
      name: designForm.name,
      type: designForm.type,
      price: Number(designForm.price),
      image: designForm.image,
      description: designForm.description
    };

    try {
      const url = "/api/designs";
      const method = editingDesignId ? "PATCH" : "POST";
      const res = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        setActionMessage(editingDesignId ? "Design updated successfully" : "New design created");
        setDesignForm({ name: "", type: "Arabic", price: "", image: "", description: "" });
        setEditingDesignId(null);
        fetchDashboardData();
      } else {
        const errData = await res.json();
        alert(errData.error || "Save failed");
      }
    } catch (err: any) {
      if (err?.message !== "Unauthorized") console.error(err);
    }
  };

  const handleEditDesign = (design: GuestDesign) => {
    setEditingDesignId(design.id);
    setDesignForm({
      name: design.name,
      type: design.type,
      price: String(design.price),
      image: design.image,
      description: design.description || ""
    });
  };

  const handleDeleteDesign = async (id: string) => {
    if (!confirm("Are you sure you want to delete this design?")) return;
    try {
      const res = await authFetch(`/api/designs?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setActionMessage("Design deleted successfully");
        fetchDashboardData();
      }
    } catch (err: any) {
      if (err?.message !== "Unauthorized") console.error(err);
    }
  };

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
    const totalInquiries = inquiries.length;

    return { total, pending, accepted, revenue, upcoming, totalInquiries };
  }, [bookings, inquiries]);

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

  // Exports
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Shahira Mehandi - Bookings Report", 14, 15);
    const tableData = filteredBookings.map(b => [
      b.id, b.date, b.name, b.mobile, b.packageOrGuest, b.price, b.status
    ]);
    (doc as any).autoTable({
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
      <aside className="w-full md:w-64 bg-mehendi-darker text-white p-4 md:p-6 flex flex-col z-20 shrink-0">
        {/* Mobile Header: Logo + Logout */}
        <div className="flex items-center justify-between w-full md:hidden mb-4 border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-mehendi-gold animate-pulse" />
            <h1 className="font-serif font-bold text-sm tracking-wide text-white">Artist Admin</h1>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider text-red-300 bg-red-400/10 hover:bg-red-400/20 transition-all border border-red-400/20"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center space-x-3 mb-8">
          <Sparkles className="h-6 w-6 text-mehendi-gold animate-pulse" />
          <h1 className="font-serif font-bold text-lg tracking-wide text-white">Artist Admin</h1>
        </div>

        {/* Tab Navigation links: Horizontal scrolling on mobile, vertical stack on desktop */}
        <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible space-x-2 md:space-x-0 md:space-y-1 pb-2 md:pb-0 scrollbar-hide w-full flex-grow-0 md:flex-grow">
          {[
            { id: "overview", label: "Overview", icon: LayoutDashboard },
            { id: "bookings", label: "Appointments", icon: Users },
            { id: "packages", label: "Bride Mehendi", icon: Briefcase },
            { id: "designs", label: "Guest Mehendi", icon: Sparkles },
            { id: "inquiries", label: "Inquiries", icon: Mail },
            { id: "calendar", label: "Calendar", icon: CalendarIcon },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id as Tab); setActionMessage(""); }}
              className={`whitespace-nowrap flex-shrink-0 flex items-center space-x-2.5 px-4 py-2.5 md:py-3 rounded-xl transition-all text-[11px] md:text-xs font-semibold uppercase tracking-wider ${
                activeTab === item.id 
                  ? "bg-mehendi-gold text-mehendi-darker font-bold shadow-lg" 
                  : "hover:bg-white/10 text-white/70"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Desktop Logout Button */}
        <button 
          onClick={handleLogout}
          className="hidden md:flex mt-6 items-center space-x-3 px-4 py-3 rounded-xl text-xs uppercase font-bold tracking-wider text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-all"
        >
          <LogOut className="h-4.5 w-4.5 shrink-0" />
          <span>Logout Portal</span>
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-grow p-4 md:p-8 overflow-y-auto h-auto md:h-screen relative">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-mehendi-gold/10 pb-4">
          <div>
            <h2 className="text-2xl font-serif font-bold text-mehendi-darker capitalize">
              {activeTab === "overview" && "System Overview"}
              {activeTab === "bookings" && "Appointments Ledger"}
              {activeTab === "packages" && "Bride Mehendi Packages"}
              {activeTab === "designs" && "Guest Mehendi Designs"}
              {activeTab === "inquiries" && "Customer Inquiry Inbox"}
              {activeTab === "calendar" && "Studio Calendar Slots"}
            </h2>
            <p className="text-xs text-mehendi-olive font-light tracking-wide mt-1">
              Shahira Mehandi Portal • {new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}
            </p>
          </div>
        </header>

        {actionMessage && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3.5 text-xs text-green-800 font-semibold flex items-center justify-between gap-3">
            <span>✅ {actionMessage}</span>
            <button
              onClick={() => setActionMessage("")}
              className="text-green-600 hover:text-green-800 transition-colors text-xs font-bold shrink-0"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Stats widgets */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {[
                  { label: "Bookings Revenue", val: `₹${stats.revenue}`, icon: DollarSign, color: "bg-green-100 text-green-700 border border-green-200" },
                  { label: "Total Schedules", val: stats.total, icon: Users, color: "bg-blue-100 text-blue-700 border border-blue-200" },
                  { label: "Confirmed Events", val: stats.upcoming, icon: CalendarIcon, color: "bg-amber-100 text-amber-700 border border-amber-200" },
                  { label: "Reviews Pending", val: stats.pending, icon: Clock, color: "bg-purple-100 text-purple-700 border border-purple-200" },
                  { label: "Inquiries", val: stats.totalInquiries, icon: MessageSquare, color: "bg-rose-100 text-rose-700 border border-rose-200" },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-3 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-mehendi-gold/15 flex items-center space-x-2 sm:space-x-4">
                    <div className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl ${stat.color} shrink-0`}>
                      <stat.icon className="h-4 sm:h-6 w-4 sm:w-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-wider truncate">{stat.label}</p>
                      <p className="text-sm sm:text-2xl font-serif font-bold text-mehendi-darker mt-0.5 truncate">{stat.val}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Pending Table */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-mehendi-gold/15">
                <h3 className="font-serif font-bold text-lg text-mehendi-darker mb-6 border-b border-mehendi-gold/10 pb-3 flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-mehendi-gold" />
                  <span>Pending Customer Booking Reviews</span>
                </h3>
                <div className="space-y-3.5">
                  {bookings.filter(b => b.status === "pending").length > 0 ? (
                    bookings.filter(b => b.status === "pending").slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-mehendi-bg/10 rounded-2xl border border-mehendi-gold/10 gap-4">
                        <div>
                          <p className="font-bold text-sm text-mehendi-darker">{booking.name} ({booking.mobile})</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Date: <strong>{booking.date}</strong> | Slot: {booking.timeSlot} | Selected: <strong>{booking.packageName || `${booking.designType} (${booking.subDesignName})`}</strong>
                          </p>
                        </div>
                        <div className="flex space-x-2 w-full sm:w-auto shrink-0 justify-end">
                          <button 
                            onClick={() => handleUpdateStatus(booking.id, "accepted")}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs uppercase transition-all shadow-md"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>Accept</span>
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(booking.id, "rejected")}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase transition-all shadow-md"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <CheckCircle className="h-10 w-10 text-mehendi-gold/40 mx-auto mb-3" />
                      <p className="text-sm text-gray-400 font-light">All caught up! No bookings pending your approval review.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: BOOKINGS */}
          {activeTab === "bookings" && (
            <motion.div 
              key="bookings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Search filter toolbar */}
              <div className="bg-white p-4 rounded-3xl border border-mehendi-gold/15 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-grow w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search name, ID or mobile..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-gray-100 focus:border-mehendi-gold outline-none text-sm"
                  />
                </div>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full md:w-auto px-4 py-2.5 rounded-2xl border border-gray-100 outline-none text-sm bg-white focus:border-mehendi-gold"
                >
                  <option value="all">All Booking Statuses</option>
                  <option value="pending">Pending Review</option>
                  <option value="accepted">Approved / Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <div className="flex space-x-2 shrink-0">
                  <button onClick={exportToExcel} className="p-2.5 rounded-2xl bg-mehendi-bg text-mehendi-dark hover:bg-mehendi-dark hover:text-white transition-all border border-mehendi-gold/20" title="Export Excel">
                    <FileDown className="h-4.5 w-4.5" />
                  </button>
                  <button onClick={exportToPDF} className="p-2.5 rounded-2xl bg-mehendi-bg text-mehendi-dark hover:bg-mehendi-dark hover:text-white transition-all border border-mehendi-gold/20" title="Export PDF">
                    <FileDown className="h-4.5 w-4.5" />
                  </button>

                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-3xl border border-mehendi-gold/15 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-mehendi-bg/30 text-[10px] uppercase font-bold tracking-widest text-mehendi-darker">
                      <tr>
                        <th className="px-6 py-4">Customer Info</th>
                        <th className="px-6 py-4">Booking Date</th>
                        <th className="px-6 py-4">Event Occasion</th>
                        <th className="px-6 py-4">Design selection</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {filteredBookings.length > 0 ? filteredBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-mehendi-bg/5 transition-all">
                          <td className="px-6 py-4">
                            <p className="font-bold text-mehendi-darker">{b.name}</p>
                            <p className="text-[10px] text-gray-500 font-mono">{b.email} • {b.mobile}</p>
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-600">{b.date} ({b.timeSlot})</td>
                          <td className="px-6 py-4 text-xs font-semibold text-mehendi-olive">{b.eventType}</td>
                          <td className="px-6 py-4 text-xs font-light max-w-[200px] truncate">{b.packageName || `${b.designType} Style - ${b.subDesignName}`}</td>
                          <td className="px-6 py-4 font-serif font-bold text-mehendi-dark">₹{b.price}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                              b.status === "accepted" ? "bg-green-50 text-green-600 border border-green-200" :
                              b.status === "pending" ? "bg-amber-50 text-amber-600 border border-amber-200" :
                              "bg-red-50 text-red-500 border border-red-200"
                            }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end space-x-1.5">
                              {/* WhatsApp quick contact */}
                              <a
                                href={`https://wa.me/91${b.mobile}?text=Hi%20${encodeURIComponent(b.name)}%2C%20this%20is%20Shahira%20Mehandi%20regarding%20your%20booking%20ID%20${b.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded-xl bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all"
                                title={`WhatsApp ${b.name}`}
                              >
                                <Phone className="h-4 w-4" />
                              </a>
                              {/* Email quick contact */}
                              <a
                                href={`mailto:${b.email}?subject=Your%20Booking%20at%20Shahira%20Mehandi%20(ID:%20${b.id})`}
                                className="p-1 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white transition-all"
                                title={`Email ${b.name}`}
                              >
                                <Mail className="h-4 w-4" />
                              </a>
                              {b.status === "pending" && (
                                <button onClick={() => handleUpdateStatus(b.id, "accepted")} className="p-1 rounded-xl bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all" title="Accept">
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                              )}
                              {b.status !== "rejected" && b.status !== "cancelled" && (
                                <button onClick={() => handleUpdateStatus(b.id, "rejected")} className="p-1 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all" title="Reject">
                                  <XCircle className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteBooking(b.id)}
                                className="p-1 rounded-xl bg-gray-50 text-gray-400 hover:bg-red-500 hover:text-white transition-all"
                                title="Delete booking"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-20 text-center text-gray-400 font-light">No customer bookings found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: PACKAGES CRUD */}
          {activeTab === "packages" && (
            <motion.div 
              key="packages"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left Column: Form panel */}
              <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-mehendi-gold/15 shadow-sm h-fit">
                <h3 className="font-serif font-bold text-lg text-mehendi-darker mb-5 flex items-center space-x-2 border-b border-mehendi-gold/10 pb-3">
                  <Sparkles className="h-4.5 w-4.5 text-mehendi-gold" />
                  <span>{editingPackageId ? "Edit Package Details" : "Create New Bridal Package"}</span>
                </h3>

                <form onSubmit={handleSavePackage} className="space-y-4">
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-mehendi-darker uppercase tracking-wider">Package Title *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Bridal Package 1"
                      value={packageForm.name}
                      onChange={(e) => setPackageForm(prev => ({ ...prev, name: e.target.value }))}
                      className="px-4 py-2.5 rounded-xl border border-gray-150 focus:border-mehendi-gold outline-none text-sm"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-mehendi-darker uppercase tracking-wider">Base Price (INR) *</label>
                    <input 
                      type="number" 
                      required
                      placeholder="e.g. 3500"
                      value={packageForm.price}
                      onChange={(e) => setPackageForm(prev => ({ ...prev, price: e.target.value }))}
                      className="px-4 py-2.5 rounded-xl border border-gray-150 focus:border-mehendi-gold outline-none text-sm font-semibold text-mehendi-dark"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-mehendi-darker uppercase tracking-wider">Brief Description *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Both hands front and back till elbow"
                      value={packageForm.description}
                      onChange={(e) => setPackageForm(prev => ({ ...prev, description: e.target.value }))}
                      className="px-4 py-2.5 rounded-xl border border-gray-150 focus:border-mehendi-gold outline-none text-sm"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-mehendi-darker uppercase tracking-wider">Included Features (One per line)</label>
                    <textarea 
                      rows={4}
                      placeholder="Elbow-length coverage&#10;Traditional details&#10;Custom style"
                      value={packageForm.includesInput}
                      onChange={(e) => setPackageForm(prev => ({ ...prev, includesInput: e.target.value }))}
                      className="px-4 py-2.5 rounded-xl border border-gray-150 focus:border-mehendi-gold outline-none text-sm"
                    />
                  </div>

                  {/* Photo upload field */}
                  <div className="flex flex-col space-y-2">
                    <label className="text-[10px] font-bold text-mehendi-darker uppercase tracking-wider">Design photo *</label>
                    <div className="flex items-center space-x-3">
                      {packageForm.image ? (
                        <div className="h-16 w-16 rounded-xl border border-mehendi-gold/20 overflow-hidden relative shrink-0">
                          <img src={packageForm.image} alt="Uploaded" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-16 w-16 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-400 shrink-0">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                      )}
                      
                      <label className="flex-grow flex items-center justify-center border border-dashed border-mehendi-gold/30 rounded-xl p-4 bg-mehendi-bg/15 hover:bg-mehendi-bg/35 transition-all cursor-pointer relative">
                        {packageUploading ? (
                          <Loader2 className="h-5 w-5 text-mehendi-gold animate-spin" />
                        ) : (
                          <div className="flex items-center space-x-2 text-xs font-bold text-mehendi-dark uppercase tracking-wider">
                            <Upload className="h-4 w-4" />
                            <span>Upload Image</span>
                          </div>
                        )}
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, "package")}
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-2">
                    {editingPackageId && (
                      <button 
                        type="button"
                        onClick={() => {
                          setEditingPackageId(null);
                          setPackageForm({ name: "", description: "", price: "", image: "", includesInput: "" });
                        }}
                        className="w-1/2 py-3.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold uppercase tracking-wider hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    )}
                    <button 
                      type="submit"
                      className="flex-grow py-3.5 bg-mehendi-dark text-white rounded-xl text-xs uppercase font-bold tracking-wider hover:opacity-95 shadow-md"
                    >
                      {editingPackageId ? "Update package" : "Create package"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Dynamic listing grid */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {packages.map((pkg) => (
                    <div key={pkg.id} className="bg-white rounded-3xl border border-mehendi-gold/15 overflow-hidden flex flex-col justify-between shadow-sm relative group hover:shadow-md transition-all">
                      <div className="aspect-[4/3] w-full overflow-hidden relative shrink-0">
                        <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
                        <div className="absolute top-3 right-3 flex space-x-1.5">
                          <button 
                            onClick={() => handleEditPackage(pkg)}
                            className="p-2 rounded-full bg-white text-mehendi-dark shadow-md hover:bg-mehendi-dark hover:text-white transition-all"
                            title="Edit Package"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeletePackage(pkg.id)}
                            className="p-2 rounded-full bg-white text-red-500 shadow-md hover:bg-red-500 hover:text-white transition-all"
                            title="Delete Package"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="p-5 flex-grow flex flex-col justify-between">
                        <div>
                          <h4 className="font-serif font-bold text-mehendi-darker text-base">{pkg.name}</h4>
                          <p className="text-xs text-gray-500 mt-1 font-light italic">{pkg.description}</p>
                        </div>
                        <div className="pt-4 border-t border-gray-50 flex items-center justify-between mt-4">
                          <span className="text-[10px] text-gray-400 uppercase font-semibold">Pricing rate</span>
                          <span className="font-serif font-bold text-mehendi-dark text-lg">₹{pkg.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: DESIGNS CRUD */}
          {activeTab === "designs" && (
            <motion.div 
              key="designs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Form Column */}
              <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-mehendi-gold/15 shadow-sm h-fit">
                <h3 className="font-serif font-bold text-lg text-mehendi-darker mb-5 flex items-center space-x-2 border-b border-mehendi-gold/10 pb-3">
                  <Sparkles className="h-4.5 w-4.5 text-mehendi-gold" />
                  <span>{editingDesignId ? "Modify Design collection" : "Add Guest Design item"}</span>
                </h3>

                <form onSubmit={handleSaveDesign} className="space-y-4">
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-mehendi-darker uppercase tracking-wider">Design Title *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Palm Arabic Design"
                      value={designForm.name}
                      onChange={(e) => setDesignForm(prev => ({ ...prev, name: e.target.value }))}
                      className="px-4 py-2.5 rounded-xl border border-gray-150 focus:border-mehendi-gold outline-none text-sm"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-mehendi-darker uppercase tracking-wider">Collection Category *</label>
                    <select 
                      value={designForm.type}
                      onChange={(e) => setDesignForm(prev => ({ ...prev, type: e.target.value as any }))}
                      className="px-4 py-2.5 rounded-xl border border-gray-150 focus:border-mehendi-gold outline-none text-sm bg-white"
                    >
                      <option value="Arabic">Arabic Designs</option>
                      <option value="Indian">Traditional Indian Designs</option>
                    </select>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-mehendi-darker uppercase tracking-wider">Price (INR per hand) *</label>
                    <input 
                      type="number" 
                      required
                      placeholder="e.g. 100"
                      value={designForm.price}
                      onChange={(e) => setDesignForm(prev => ({ ...prev, price: e.target.value }))}
                      className="px-4 py-2.5 rounded-xl border border-gray-150 focus:border-mehendi-gold outline-none text-sm font-semibold text-mehendi-dark"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-mehendi-darker uppercase tracking-wider">Description</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Clean spaced motifs"
                      value={designForm.description}
                      onChange={(e) => setDesignForm(prev => ({ ...prev, description: e.target.value }))}
                      className="px-4 py-2.5 rounded-xl border border-gray-150 focus:border-mehendi-gold outline-none text-sm"
                    />
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-[10px] font-bold text-mehendi-darker uppercase tracking-wider">Henna design photo *</label>
                    <div className="flex items-center space-x-3">
                      {designForm.image ? (
                        <div className="h-16 w-16 rounded-xl border border-mehendi-gold/20 overflow-hidden relative shrink-0">
                          <img src={designForm.image} alt="Uploaded" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-16 w-16 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-400 shrink-0">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                      )}
                      
                      <label className="flex-grow flex items-center justify-center border border-dashed border-mehendi-gold/30 rounded-xl p-4 bg-mehendi-bg/15 hover:bg-mehendi-bg/35 transition-all cursor-pointer relative">
                        {designUploading ? (
                          <Loader2 className="h-5 w-5 text-mehendi-gold animate-spin" />
                        ) : (
                          <div className="flex items-center space-x-2 text-xs font-bold text-mehendi-dark uppercase tracking-wider">
                            <Upload className="h-4 w-4" />
                            <span>Upload Image</span>
                          </div>
                        )}
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, "design")}
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-2">
                    {editingDesignId && (
                      <button 
                        type="button"
                        onClick={() => {
                          setEditingDesignId(null);
                          setDesignForm({ name: "", type: "Arabic", price: "", image: "", description: "" });
                        }}
                        className="w-1/2 py-3.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold uppercase tracking-wider hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    )}
                    <button 
                      type="submit"
                      className="flex-grow py-3.5 bg-mehendi-dark text-white rounded-xl text-xs uppercase font-bold tracking-wider hover:opacity-95 shadow-md"
                    >
                      {editingDesignId ? "Update design" : "Add design"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Collections Grid */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h4 className="font-serif font-bold text-base text-mehendi-darker mb-4 border-b border-mehendi-gold/10 pb-2">Arabic Collection</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {designs.filter(d => d.type === "Arabic").map(design => (
                      <div key={design.id} className="bg-white border border-mehendi-gold/10 rounded-2xl overflow-hidden relative shadow-sm hover:shadow-md transition-all">
                        <div className="aspect-[3/4] relative overflow-hidden">
                          <img src={design.image} alt={design.name} className="w-full h-full object-cover" />
                          <div className="absolute top-2 right-2 flex space-x-1">
                            <button onClick={() => handleEditDesign(design)} className="p-1.5 rounded-full bg-white text-mehendi-dark shadow-sm hover:bg-mehendi-dark hover:text-white transition-all"><Edit2 className="h-3.5 w-3.5" /></button>
                            <button onClick={() => handleDeleteDesign(design.id)} className="p-1.5 rounded-full bg-white text-red-500 shadow-sm hover:bg-red-500 hover:text-white transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        </div>
                        <div className="p-3 text-center">
                          <p className="font-bold text-xs text-mehendi-darker truncate">{design.name}</p>
                          <p className="font-serif font-bold text-mehendi-gold text-sm mt-1">₹{design.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-serif font-bold text-base text-mehendi-darker mb-4 border-b border-mehendi-gold/10 pb-2">Traditional Indian Collection</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {designs.filter(d => d.type === "Indian").map(design => (
                      <div key={design.id} className="bg-white border border-mehendi-gold/10 rounded-2xl overflow-hidden relative shadow-sm hover:shadow-md transition-all">
                        <div className="aspect-[3/4] relative overflow-hidden">
                          <img src={design.image} alt={design.name} className="w-full h-full object-cover" />
                          <div className="absolute top-2 right-2 flex space-x-1">
                            <button onClick={() => handleEditDesign(design)} className="p-1.5 rounded-full bg-white text-mehendi-dark shadow-sm hover:bg-mehendi-dark hover:text-white transition-all"><Edit2 className="h-3.5 w-3.5" /></button>
                            <button onClick={() => handleDeleteDesign(design.id)} className="p-1.5 rounded-full bg-white text-red-500 shadow-sm hover:bg-red-500 hover:text-white transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        </div>
                        <div className="p-3 text-center">
                          <p className="font-bold text-xs text-mehendi-darker truncate">{design.name}</p>
                          <p className="font-serif font-bold text-mehendi-gold text-sm mt-1">₹{design.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: INQUIRIES LISTING */}
          {activeTab === "inquiries" && (
            <motion.div 
              key="inquiries"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500 font-light">{inquiries.length} message{inquiries.length !== 1 ? 's' : ''} received</p>
                <button
                  onClick={fetchDashboardData}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-mehendi-bg text-mehendi-dark text-xs font-bold hover:bg-mehendi-dark hover:text-white transition-all border border-mehendi-gold/20"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Refresh</span>
                </button>
              </div>
              {inquiries.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {inquiries.map((inq) => (
                    <div key={inq.id} className="bg-white p-6 rounded-3xl border border-mehendi-gold/15 shadow-sm space-y-3 relative">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-serif font-bold text-mehendi-darker text-base">{inq.name}</h4>
                          <p className="text-xs text-mehendi-olive font-light font-mono mt-0.5">{inq.email} • {inq.mobile}</p>
                        </div>
                        <span className="text-[10px] text-gray-400 font-light">
                          {formatSafeDate(inq.createdAt, { dateStyle: 'short' })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 bg-mehendi-bg/15 p-3.5 rounded-2xl italic leading-relaxed border border-mehendi-gold/5">
                        "{inq.message}"
                      </p>
                      {/* Quick Reply Buttons */}
                      <div className="flex space-x-2 pt-1">
                        <a
                          href={`https://wa.me/91${inq.mobile}?text=Hi%20${encodeURIComponent(inq.name)}%2C%20this%20is%20Shahira%20Mehandi.%20Thank%20you%20for%20your%20message!`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-green-50 text-green-700 hover:bg-green-600 hover:text-white transition-all text-[10px] font-bold uppercase tracking-wide border border-green-200"
                        >
                          <Phone className="h-3 w-3" />
                          <span>WhatsApp Reply</span>
                        </a>
                        <a
                          href={`mailto:${inq.email}?subject=Re:%20Your%20Inquiry%20to%20Shahira%20Mehandi`}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-all text-[10px] font-bold uppercase tracking-wide border border-blue-200"
                        >
                          <Mail className="h-3 w-3" />
                          <span>Email Reply</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-mehendi-gold/10">
                  <Mail className="h-10 w-10 text-mehendi-gold/30 mx-auto mb-3" />
                  <p className="text-sm text-gray-400 font-light">Your inquiry inbox is empty. No messages submitted from contact page.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 6: CALENDAR */}
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
                  allowClickBlocked={true}
                />
                <div className="mt-6 bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start space-x-3">
                  <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed font-light">
                    <strong>Availability Block Rule:</strong> Click any available date inside the calendar matrix above to instantly switch its status to "Blocked" (for holiday periods/personal reasons). Click a blocked date block to restore it back to "Available". Booked slots show red.
                  </p>
                </div>
              </div>
              
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-mehendi-gold/15 shadow-sm">
                  <h3 className="font-serif font-bold text-base text-mehendi-darker mb-4 border-b border-mehendi-gold/10 pb-2">Upcoming Confirmed Events</h3>
                  <div className="space-y-3">
                    {bookings.filter(b => {
                      if (!b.date) return false;
                      const bDate = new Date(b.date);
                      if (isNaN(bDate.getTime())) return false;
                      const today = new Date();
                      today.setHours(0,0,0,0);
                      return bDate >= today && b.status === "accepted";
                    }).sort((a,b) => {
                      const aTime = a.date ? new Date(a.date).getTime() : 0;
                      const bTime = b.date ? new Date(b.date).getTime() : 0;
                      return (isNaN(aTime) ? 0 : aTime) - (isNaN(bTime) ? 0 : bTime);
                    }).slice(0, 5).map(b => (
                      <div key={b.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl border border-transparent hover:border-mehendi-gold/10 transition-all">
                        <div className="bg-mehendi-dark text-white px-2.5 py-1.5 rounded-xl text-center min-w-[50px] shrink-0 font-medium">
                          <p className="text-[9px] uppercase font-bold tracking-wider">{formatSafeMonth(b.date)}</p>
                          <p className="text-sm font-bold">{formatSafeDay(b.date)}</p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-mehendi-darker truncate">{b.name}</p>
                          <p className="text-[9px] text-gray-500 font-light truncate">{b.timeSlot}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
