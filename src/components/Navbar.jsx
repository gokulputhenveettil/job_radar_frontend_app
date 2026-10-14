import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentView, setUser } from "../store";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const dispatch = useDispatch();
  const currentView = useSelector((state) => state.app.currentView);
  const user = useSelector((state) => state.app.user);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    dispatch(setUser(null));
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-8">
            <div 
              onClick={() => dispatch(setCurrentView("dashboard"))}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                in
              </div>
              <span className="font-bold text-lg tracking-tight text-gray-900">JobRadar</span>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => dispatch(setCurrentView("dashboard"))}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === "dashboard"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => dispatch(setCurrentView("analytics"))}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === "analytics"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => dispatch(setCurrentView("settings"))}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === "settings"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Settings
              </button>
            </nav>
          </div>

          {/* User Profile / Auth Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700">
                  {user.name || user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs text-red-600 hover:text-red-800 font-semibold border border-red-200 px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-1.5"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-1.5 rounded-md transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-hidden"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 px-6 py-4 space-y-2 bg-white">
            <button
              onClick={() => { dispatch(setCurrentView("dashboard")); setMobileMenuOpen(false); }}
              className="block w-full text-left py-2 text-sm text-gray-700 font-medium"
            >
              Dashboard
            </button>
            <button
              onClick={() => { dispatch(setCurrentView("analytics")); setMobileMenuOpen(false); }}
              className="block w-full text-left py-2 text-sm text-gray-700 font-medium"
            >
              Analytics
            </button>
            <button
              onClick={() => { dispatch(setCurrentView("settings")); setMobileMenuOpen(false); }}
              className="block w-full text-left py-2 text-sm text-gray-700 font-medium"
            >
              Settings
            </button>
            <div className="pt-2 border-t border-gray-100">
              {user ? (
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="block w-full text-left py-2 text-sm text-red-600 font-medium"
                >
                  Logout ({user.email})
                </button>
              ) : (
                <button
                  onClick={() => { setAuthModalOpen(true); setMobileMenuOpen(false); }}
                  className="block w-full text-left py-2 text-sm text-blue-600 font-medium"
                >
                  Sign In / Sign Up
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(userData) => dispatch(setUser(userData))}
      />
    </>
  );
}