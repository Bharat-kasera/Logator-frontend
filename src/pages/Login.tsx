import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { PhoneInput } from "../components/PhoneInput";
import { api } from "../utils/api";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [formData, setFormData] = useState({
    phone: "+91",
    otp: "",
  });
  const [error, setError] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countryCode] = useState<string>("+91");

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
      return;
    }
    const wsToken = localStorage.getItem("wsToken");
    if (wsToken) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!showOtp) {
        // Check if user exists and send OTP
        let cc = countryCode;
        let ph = formData.phone;
        if (formData.phone.includes(" ")) {
          [cc, ph] = formData.phone.split(" ");
        }

        const res = await api.post("/check-user", {
          country_code: cc,
          phone: ph,
        });
        const data = await res.json();

        if (!data.exists) {
          setError("This phone number is not registered.");
          return;
        }

        // Send OTP via Twilio
        console.log("🚀 Sending OTP to:", cc + ph);
        const otpRes = await api.post("/otp/send-otp", {
          country_code: cc,
          phone: ph,
        });

        if (!otpRes.ok) {
          const errorData = await otpRes.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to send OTP");
        }

        const otpData = await otpRes.json();
        console.log("✅ OTP sent successfully:", otpData);

        setShowOtp(true);
        setError(""); // Clear any previous errors
        return;
      }

      // Verify OTP and login
      await login(formData.phone, formData.otp);
      navigate("/dashboard");
    } catch (err: any) {
      console.error("❌ Login error:", err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          {showOtp ? "Enter OTP" : "Sign in to your account"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {showOtp
            ? "We sent a verification code to your phone"
            : "Welcome back! Please sign in to continue"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <svg
                  className="h-5 w-5 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <p className="ml-2 text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!showOtp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <PhoneInput
                  value={formData.phone}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      phone: value,
                    }))
                  }
                  error={!!error}
                  helperText={error}
                />
              </div>
            )}

            {showOtp && (
              <div>
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600">
                    Verification code sent to{" "}
                    <span className="font-medium">{formData.phone}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowOtp(false)}
                    className="text-xs text-orange-600 hover:text-orange-500 font-medium"
                  >
                    Change phone number
                  </button>
                </div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Enter OTP
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  maxLength={6}
                  value={formData.otp}
                  onChange={handleInputChange}
                  placeholder="Enter 6-digit code"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-center text-lg tracking-widest"
                />
                <p className="mt-1 text-xs text-gray-500 text-center">
                  For demo purposes, use: 123456
                </p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {showOtp ? "Verifying..." : "Sending OTP..."}
                  </div>
                ) : showOtp ? (
                  "Verify OTP"
                ) : (
                  "Send OTP"
                )}
              </button>
            </div>

            {showOtp && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowOtp(false);
                    setFormData((prev) => ({ ...prev, otp: "" }));
                    setError("");
                  }}
                  className="text-sm text-gray-600 hover:text-gray-500"
                >
                  Back to phone number
                </button>
              </div>
            )}

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-sm text-orange-600 hover:text-orange-500 font-medium"
              >
                Don't have an account? Sign up
              </button>
            </div>
          </form>

          {/* Features Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Secure Login with OTP
              </h3>
              <div className="flex justify-center space-x-6 text-xs text-gray-500">
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 text-orange-500 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  SMS Verification
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 text-orange-500 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Secure Access
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
