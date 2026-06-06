import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const HomePage = () => {
  const [isLogin, setIsLogin] = useState(true); // Tab switch karne ke liye
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Form Fields State
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Agar user pehle se logged in hai, toh direct chat page par bhej do
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (user) navigate("/chats");
  }, [navigate]);

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const config = {
        headers: { "Content-type": "application/json" },
        withCredentials: true, // Cookies handle karne ke liye critical hai
      };

      if (isLogin) {
        // ─── LOGIN API CALL ───
        const { data } = await axios.post(
          "http://localhost:5000/api/auth/login", // Apne backend port ke mutabik check kar lena
          { email, password },
          config
        );
        
        alert("Login Successful! 🎉");
        localStorage.setItem("userInfo", JSON.stringify(data.user));
        navigate("/chats");
      } else {
        // ─── SIGNUP API CALL ───
        const { data } = await axios.post(
          "http://localhost:5000/api/auth/register",
          { username, email, password },
          config
        );

        alert("Registration Successful! 🎉 Login karo ab.");
        setIsLogin(true); // Signup ke baad automatic login tab par shift
      }
    } catch (error) {
      alert(error.response?.data?.message || "Kuch garbar ho gayi bhai!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-100 font-sans">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        {/* Title */}
        <h1 className="mb-6 text-center text-3xl font-bold text-slate-800">
          🗣️ BaatCheet
        </h1>

        {/* Tabs Button */}
        <div className="mb-6 flex rounded-lg bg-slate-100 p-1">
          <button
            onClick={() => setIsLogin(true)}
            className={`w-1/2 rounded-md py-2 text-sm font-medium transition-all ${
              isLogin ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`w-1/2 rounded-md py-2 text-sm font-medium transition-all ${
              !isLogin ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Dynamic Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-600">Username</label>
              <input
                type="text"
                placeholder="Ex. Abdul Ayub"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-600">Email Address</label>
            <input
              type="email"
              placeholder="ayub@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-800 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-900 disabled:bg-slate-400"
          >
            {loading ? "Ruko bhai, loading chal rhi hai..." : isLogin ? "Log In" : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default HomePage;