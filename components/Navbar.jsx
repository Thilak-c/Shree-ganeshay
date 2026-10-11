"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { 
  CreditCard, 
  Users, 
  Receipt, 
  LogOut, 
  Menu,
  X
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Card Studio", href: "/", icon: CreditCard },
    { name: "Patient Registry", href: "/allcard", icon: Users },
    { name: "Billing & Invoices", href: "/billing", icon: Receipt },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
             
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900 tracking-tight leading-none">
                  Shree Ganeshay
                </span>
                <span className="text-[10px] text-teal-700 font-medium tracking-wide uppercase mt-0.5">
                  Dental Clinic
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 ml-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-slate-100 text-teal-800 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Controls */}
          <div className="hidden md:flex items-center gap-3">
            <span className="text-xs text-slate-500 font-medium border-r border-slate-200 pr-3">
              Staff Portal
            </span>

            
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium ${
                  isActive
                    ? "bg-slate-100 text-teal-800 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
          <div className="pt-2 mt-2 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">Staff Portal</span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium py-1 px-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
