import { Icon } from "@iconify/react/dist/iconify.js";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { loginFunction } from "../features/auth/authService";

const SignInLayer = () => {

  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  const toggleVisibility = () => {
    setShowPassword(!showPassword)
  }

  const validate = () => {
    let newErrors = {}
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (phone.length < 10) {
      newErrors.phone = "Phone number must be 10 digits";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!validate()) return;
    try {
      loginFunction(dispatch, navigate, { phone, password })
    } catch (err) {
      console.log("Error Loging in", err.message);
    }
  }

  const ErrorMsg = ({ field }) => {
    return errors[field] ? (
      <div className="text-danger mt-4 fw-medium" style={{ fontSize: "11px" }}>
        {errors[field]}
      </div>
    ) : null
  }

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 10) {
      setPhone(value)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

        /* ── Keyframes ── */
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatOrb {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(-22px) scale(1.04); }
        }
        @keyframes floatOrb2 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(18px) scale(0.97); }
        }
        @keyframes shimmerLine {
          0%   { left: -60%; }
          100% { left: 130%; }
        }
        @keyframes pulseRing {
          0%   { box-shadow: 0 4px 18px rgba(232,135,58,0.32); }
          50%  { box-shadow: 0 4px 28px rgba(232,135,58,0.55); }
          100% { box-shadow: 0 4px 18px rgba(232,135,58,0.32); }
        }
        @keyframes logoGlow {
          0%, 100% { filter: drop-shadow(0 2px 6px rgba(232,135,58,0.15)); }
          50%       { filter: drop-shadow(0 4px 16px rgba(232,135,58,0.35)); }
        }
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes borderPulse {
          0%, 100% { border-color: rgba(201,169,110,0.25); }
          50%       { border-color: rgba(232,135,58,0.45); }
        }

        /* ── Page wrapper ── */
        .lit-auth-bg {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Outfit', sans-serif;
          background: url("../assets/images/bg/78786.jpg") center center / cover no-repeat;
          position: relative;
          overflow: hidden;
        }

        /* Soft light overlay so card stays readable */
        .lit-auth-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.55) 0%,
            rgba(255,248,240,0.45) 40%,
            rgba(232,135,58,0.12) 100%
          );
          background-size: 200% 200%;
          animation: gradientShift 9s ease infinite;
          pointer-events: none;
          z-index: 0;
        }

        /* ── Floating orbs ── */
        .lit-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }
        .lit-orb-1 {
          width: 400px; height: 400px;
          top: -130px; left: -130px;
          background: radial-gradient(circle, rgba(232,135,58,0.11) 0%, transparent 70%);
          animation: floatOrb 7s ease-in-out infinite;
        }
        .lit-orb-2 {
          width: 320px; height: 320px;
          bottom: -90px; right: -90px;
          background: radial-gradient(circle, rgba(201,169,110,0.14) 0%, transparent 70%);
          animation: floatOrb2 9s ease-in-out infinite;
        }
        .lit-orb-3 {
          width: 220px; height: 220px;
          top: 55%; left: 68%;
          background: radial-gradient(circle, rgba(176,176,176,0.10) 0%, transparent 70%);
          animation: floatOrb 11s ease-in-out infinite reverse;
        }
        .lit-orb-4 {
          width: 170px; height: 170px;
          top: 8%; right: 10%;
          background: radial-gradient(circle, rgba(232,135,58,0.09) 0%, transparent 70%);
          animation: floatOrb2 6s ease-in-out infinite;
        }

        /* ── Glass card ── */
        .lit-glass-card {
          background: rgba(255, 255, 255, 0.68);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1px solid rgba(255,255,255,0.55);
          border-radius: 28px;
          box-shadow:
            0 4px 8px rgba(0,0,0,0.08),
            0 16px 48px rgba(0,0,0,0.12),
            0 1px 0px rgba(255,255,255,0.9) inset;
          padding: 52px 44px;
          width: 100%;
          max-width: 440px;
          position: relative;
          z-index: 1;
          animation: fadeSlideUp 0.7s cubic-bezier(0.22,1,0.36,1) both;
          overflow: hidden;
        }

        /* Shimmer sweep */
        .lit-glass-card::after {
          content: '';
          position: absolute;
          top: 0; bottom: 0;
          width: 45%;
          background: linear-gradient(
            105deg,
            transparent 25%,
            rgba(255,255,255,0.6) 50%,
            transparent 75%
          );
          animation: shimmerLine 5s ease-in-out infinite;
          pointer-events: none;
          z-index: 0;
        }

        /* Top orange accent line */
        .lit-glass-card::before {
          content: '';
          position: absolute;
          top: 0; left: 18%; right: 18%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #E8873A 40%, #C9A96E 60%, transparent);
          border-radius: 0 0 4px 4px;
          pointer-events: none;
          z-index: 2;
        }

        /* ── Logo ── */
        .lit-logo-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 26px;
          animation: fadeSlideUp 0.55s 0.1s cubic-bezier(0.22,1,0.36,1) both;
          position: relative; z-index: 1;
        }
        .lit-logo-wrap img {
          max-width: 190px;
          animation: logoGlow 3.5s ease-in-out infinite;
        }

        /* ── Headings ── */
        .lit-title {
          color: #2a2218;
          font-size: 1.5rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 6px;
          letter-spacing: -0.2px;
          animation: fadeSlideUp 0.55s 0.18s cubic-bezier(0.22,1,0.36,1) both;
          position: relative; z-index: 1;
        }
        .lit-subtitle {
          color: #9a8a78;
          font-size: 0.88rem;
          text-align: center;
          margin-bottom: 20px;
          font-weight: 400;
          animation: fadeSlideUp 0.55s 0.24s cubic-bezier(0.22,1,0.36,1) both;
          position: relative; z-index: 1;
        }

        /* Orange divider accent */
        .lit-divider {
          width: 44px;
          height: 3px;
          background: linear-gradient(90deg, #E8873A, #C9A96E);
          border-radius: 99px;
          margin: 0 auto 30px;
          animation: fadeSlideUp 0.55s 0.28s cubic-bezier(0.22,1,0.36,1) both;
          position: relative; z-index: 1;
        }

        /* ── Input fields ── */
        .lit-field {
          position: relative;
          margin-bottom: 18px;
          z-index: 1;
        }
        .lit-field:nth-child(1) { animation: fadeSlideUp 0.55s 0.32s cubic-bezier(0.22,1,0.36,1) both; }
        .lit-field:nth-child(2) { animation: fadeSlideUp 0.55s 0.38s cubic-bezier(0.22,1,0.36,1) both; }

        .lit-field-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #C9A96E;
          font-size: 1.05rem;
          pointer-events: none;
          z-index: 2;
          display: flex;
          align-items: center;
          transition: color 0.22s;
        }
        .lit-field:focus-within .lit-field-icon {
          color: #E8873A;
        }

        .lit-input {
          width: 100%;
          height: 52px;
          padding: 0 44px 0 46px;
          background: rgba(255,255,255,0.82) !important;
          border: 1.5px solid rgba(201,169,110,0.30) !important;
          border-radius: 14px !important;
          color: #2a2218 !important;
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
          outline: none;
          box-sizing: border-box;
        }
        .lit-input::placeholder { color: #bba898; }
        .lit-input:focus {
          background: rgba(255,255,255,0.98) !important;
          border-color: rgba(232,135,58,0.65) !important;
          box-shadow: 0 0 0 3.5px rgba(232,135,58,0.12) !important;
          color: #2a2218 !important;
        }
        .lit-input:-webkit-autofill,
        .lit-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #fff9f5 inset !important;
          -webkit-text-fill-color: #2a2218 !important;
          border-color: rgba(232,135,58,0.55) !important;
          border-radius: 14px !important;
        }

        .lit-pw-toggle {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #C9A96E;
          cursor: pointer;
          font-size: 1rem;
          z-index: 2;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }
        .lit-pw-toggle:hover { color: #E8873A; }

        /* ── Error ── */
        .lit-error {
          color: #d9534f;
          font-size: 11px;
          font-weight: 500;
          margin-top: 5px;
          padding-left: 4px;
        }

        /* ── Submit button ── */
        .lit-btn {
          width: 100%;
          height: 52px;
          margin-top: 24px;
          border: none;
          border-radius: 14px;
          background: linear-gradient(135deg, #E8873A 0%, #C9A96E 100%);
          color: #ffffff;
          font-family: 'Outfit', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          letter-spacing: 0.4px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: transform 0.18s, box-shadow 0.22s;
          box-shadow: 0 4px 18px rgba(232,135,58,0.30);
          animation: fadeSlideUp 0.55s 0.44s cubic-bezier(0.22,1,0.36,1) both,
                     pulseRing 2.8s 1.5s ease-in-out infinite;
          z-index: 1;
        }
        .lit-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.22), transparent 55%);
          border-radius: inherit;
          pointer-events: none;
        }
        /* Ripple hover sweep */
        .lit-btn::after {
          content: '';
          position: absolute;
          top: 0; bottom: 0;
          left: -75%;
          width: 50%;
          background: linear-gradient(105deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.45s ease;
          pointer-events: none;
        }
        .lit-btn:hover::after { left: 130%; }
        .lit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(232,135,58,0.40);
        }
        .lit-btn:active {
          transform: translateY(0);
          box-shadow: 0 3px 10px rgba(232,135,58,0.22);
        }
      `}</style>

      <section className="lit-auth-bg">
        <div className="lit-orb lit-orb-1" />
        <div className="lit-orb lit-orb-2" />
        <div className="lit-orb lit-orb-3" />
        <div className="lit-orb lit-orb-4" />

        <div className="lit-glass-card">

          <div className="lit-logo-wrap">
            <Link to="/">
              <img src="/assets/images/logo.png" alt="" />
            </Link>
          </div>

          <h4 className="lit-title">Sign In to your Account</h4>
          <p className="lit-subtitle">Welcome back! please enter your detail</p>
          <div className="lit-divider" />

          <form onSubmit={(e) => handleLogin(e)}>

            <div className="lit-field">
              <span className="lit-field-icon">
                <Icon icon="mage:phone" />
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(e)}
                className="lit-input"
                placeholder="Phone"
              />
              {errors.phone && <div className="lit-error">{errors.phone}</div>}
            </div>

            <div className="lit-field">
              <span className="lit-field-icon">
                <Icon icon="solar:lock-password-outline" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="lit-input"
                id="your-password"
                placeholder="Password"
              />
              <span
                onClick={toggleVisibility}
                className={`lit-pw-toggle ${showPassword ? "ri-eye-off-line" : "ri-eye-line"}`}
              />
              {errors.password && <div className="lit-error">{errors.password}</div>}
            </div>

            <button type="submit" className="lit-btn text-center">
              Sign In
            </button>

          </form>
        </div>
      </section>
    </>
  );
};

export default SignInLayer;