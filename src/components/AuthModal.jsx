import React, { useState } from "react";

async function readAuthResponse(response) {
  const body = await response.text();

  try {
    return body ? JSON.parse(body) : {};
  } catch {
    throw new Error(body || "The server returned an invalid response.");
  }
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const loginEndpoint = "/api/v1/auth/login";
    const endpoint = isLogin ? loginEndpoint : "/api/v1/auth/signup";
    const authHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    const credentials = {
      [isLogin ? "api_v1_user" : "user"]: {
        ...(isLogin ? {} : { name: formData.name }),
        email: formData.email,
        password: formData.password,
      },
    };

    try {
      let res = await fetch(`http://localhost:3000${endpoint}`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(credentials),
      });

      let data = await readAuthResponse(res);
      if (!res.ok) {
        throw new Error(data.error || data.errors?.join(", ") || "Authentication failed");
      }

      // Extract Bearer token from header
      if (!isLogin) {
        res = await fetch(`http://localhost:3000${loginEndpoint}`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            api_v1_user: { email: formData.email, password: formData.password },
          }),
        });
        data = await readAuthResponse(res);
        if (!res.ok) {
          throw new Error(
            data.error ||
              data.errors?.join(", ") ||
              "Account created, but sign-in failed. Please sign in."
          );
        }
      }

      const token = res.headers.get("Authorization") || data.token;
      if (!token) throw new Error("Authentication succeeded but no token was returned.");

      localStorage.setItem("auth_token", token);
      onAuthSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg font-bold"
        >
          ✕
        </button>

        <div className="flex border-b border-gray-100 mb-6">
          <button
            onClick={() => { setIsLogin(true); setError(""); }}
            className={`flex-1 pb-3 text-sm font-semibold transition-colors ${
              isLogin ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(""); }}
            className={`flex-1 pb-3 text-sm font-semibold transition-colors ${
              !isLogin ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 text-xs bg-red-50 text-red-700 p-2.5 rounded-md border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ada Lovelace"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md text-sm transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? "Processing..." : isLogin ? "Sign In" : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}