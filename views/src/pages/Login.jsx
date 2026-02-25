import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { signIn, isAuthenticated, redirectPath } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // If already logged in, redirect away from login page
  if (isAuthenticated) return <Navigate to={redirectPath} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { 
      setError("Please enter your email and password."); 
      return; 
    }
    setLoading(true);
    setError("");
    
    try {
      // Handles the API call to /auth/login
      const { redirectTo } = await signIn({ email, password });
      setSuccess(true);
      
      // Delay slightly so the user sees the success message before redirecting
      setTimeout(() => navigate(redirectTo, { replace: true }), 600);
    } catch (err) {
      setError(err.message ?? "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100"
      style={{
        background: `linear-gradient(rgba(241, 214, 214, 0.5), rgba(248, 244, 244, 0.10)), url(/hospital_bg.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Centered Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#0e93b1]/20 p-10 backdrop-blur-sm">
        
        {/* Logo Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-40 h-40 flex items-center justify-center transition-transform hover:scale-105">
            <img 
              className="w-full h-full object-contain" 
              src="/hospital_logo.png" 
              alt="GNE Hospital Logo" 
            />
          </div>
          <p className="text-sm text-gray-500">Sign in to your admin dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Status Messages */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Login successful! Redirecting…</span>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="desk@hospital.com"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0e93b1] focus:border-transparent outline-none transition-all"
              required
              autoComplete="email"
            />
          </div>

          {/* Password Field */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Password
              </label>
              <a href="#" className="text-xs text-blue-600 hover:underline">Forgot Password?</a>
            </div>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                id="password"
                name="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0e93b1] focus:border-transparent outline-none transition-all"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#0e93b1] hover:bg-[#102544] text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Sign In"
            )}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          © 2026 GNE Medical Hospital Management System
        </p>
      </div>
    </div>
  );
}