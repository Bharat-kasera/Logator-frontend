import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import Webcam from "react-webcam";
import QRScanner from "../components/QRScanner";
import { PhoneInput } from "../components/PhoneInput";
import { isValidLogatorQR, extractQRHash } from "../utils/qrUtils";
import { api } from "../utils/api";

interface AuthorizedGate {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  geofencing: boolean;
  radius: number;
  establishment_id: number;
  establishment_name: string;
}

interface UserInfo {
  id: number;
  firstname: string;
  lastname: string;
  phone: string;
}

interface CheckInData {
  hasActiveCheckIn: boolean;
  activeCheckIn?: {
    id: number;
    check_in_at: string;
    firstname: string;
    lastname: string;
  };
}

interface FaceVerificationData {
  user: UserInfo;
  verificationCount: number;
  needsVerification: boolean;
}

type CheckInStep = 
  | "gate-selection" 
  | "geofence-check" 
  | "method-selection" 
  | "qr" 
  | "phone" 
  | "face" 
  | "manual" 
  | "verification" 
  | "register";

export default function CheckIn() {
  const { wsToken } = useAuth();
  const [step, setStep] = useState<CheckInStep>("gate-selection");
  const [selectedGate, setSelectedGate] = useState<AuthorizedGate | null>(null);
  const [authorizedGates, setAuthorizedGates] = useState<AuthorizedGate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [phone, setPhone] = useState("+91 ");
  const [otp, setOtp] = useState("");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [checkInData, setCheckInData] = useState<CheckInData | null>(null);
  const [faceVerificationData, setFaceVerificationData] = useState<FaceVerificationData | null>(null);
  const [newVisitorName, setNewVisitorName] = useState("");
  const [toMeet, setToMeet] = useState("");
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  
  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    fetchAuthorizedGates();
    getCurrentLocation();
  }, []);

  const fetchAuthorizedGates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/checkin/gates', {
        headers: {
          'Authorization': `Bearer ${wsToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAuthorizedGates(data.authorizedGates);
      } else {
        setError('Failed to fetch authorized gates');
      }
    } catch (error) {
      console.error('Error fetching gates:', error);
      setError('Failed to fetch authorized gates');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get your location. Some features may be limited.');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lng2-lng1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  const handleGateSelection = async (gate: AuthorizedGate) => {
    setSelectedGate(gate);
    
    if (gate.geofencing && currentLocation) {
      const distance = calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        gate.latitude,
        gate.longitude
      );
      
      if (distance > gate.radius) {
        setError(`You are ${Math.round(distance)}m away from ${gate.name}. You need to be within ${gate.radius}m to check in.`);
        setStep("geofence-check");
        return;
      }
    }
    
    setStep("method-selection");
  };

  const checkForDuplicateCheckIn = async (phoneNumber: string) => {
    try {
      const response = await fetch('/api/checkin/check-duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${wsToken}`,
        },
        body: JSON.stringify({
          phone: phoneNumber,
          establishment_id: selectedGate?.establishment_id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCheckInData(data);
        return data.hasActiveCheckIn;
      } else {
        setError('Failed to check for duplicate check-ins');
        return false;
      }
    } catch (error) {
      console.error('Error checking duplicate:', error);
      setError('Failed to check for duplicate check-ins');
      return false;
    }
  };

  const checkFaceVerification = async (phoneNumber: string) => {
    try {
      const response = await fetch(`/api/checkin/face-verification/${encodeURIComponent(phoneNumber)}`, {
        headers: {
          'Authorization': `Bearer ${wsToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFaceVerificationData(data);
        setUserInfo(data.user);
        return data;
      } else if (response.status === 404) {
        // User not found - new visitor
        return null;
      } else {
        setError('Failed to check face verification status');
        return null;
      }
    } catch (error) {
      console.error('Error checking face verification:', error);
      setError('Failed to check face verification status');
      return null;
    }
  };

  const handlePhoneSubmit = async () => {
    if (!phone.trim() || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    // Check for duplicate active check-ins
    const hasDuplicate = await checkForDuplicateCheckIn(phone);
    if (hasDuplicate) {
      return; // Error already set
    }

    // Check face verification status
    const verificationData = await checkFaceVerification(phone);
    if (verificationData === null) {
      // New visitor - go to registration
      setStep("register");
    } else if (verificationData.needsVerification) {
      // Existing user needs verification
      setStep("verification");
    } else {
      // User is verified - proceed with check-in
      alert(`Check-in successful for ${verificationData.user.firstname} ${verificationData.user.lastname}`);
      resetToGateSelection();
    }
  };

  const handleQRScan = async (qrData: string) => {
    try {
      console.log('QR Data scanned:', qrData);
      
      // Check if it's a valid Logator QR code
      if (!isValidLogatorQR(qrData)) {
        setError('Invalid QR code format. Please use a valid Logator QR code.');
        return;
      }

      // Extract hash and resolve to user information
      const qrHash = extractQRHash(qrData);
      if (!qrHash) {
        setError('Failed to process QR code hash.');
        return;
      }

      // Resolve QR hash to user information via backend
      const response = await api.post('/qr/resolve', { qrHash }, {
        headers: {
          Authorization: `Bearer ${wsToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to resolve QR code');
        return;
      }

      const userData = await response.json();
      const phoneNumber = userData.phoneNumber;
      
      console.log('Resolved phone number:', phoneNumber);
      
      // Continue with existing check-in flow using resolved phone number
      const hasDuplicate = await checkForDuplicateCheckIn(phoneNumber);
      if (hasDuplicate) {
        return;
      }

      const verificationData = await checkFaceVerification(phoneNumber);
      if (verificationData === null) {
        setPhone(phoneNumber);
        setStep("register");
      } else if (verificationData.needsVerification) {
        setStep("verification");
      } else {
        alert(`Check-in successful for ${verificationData.user.firstname} ${verificationData.user.lastname}`);
        resetToGateSelection();
      }
    } catch (error) {
      console.error('QR scan error:', error);
      setError('Failed to process QR code. Please try again or use phone number entry.');
    }
  };

  const captureFace = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedPhoto(imageSrc);
      // Here you would typically send this to a face recognition API
      alert('Face captured successfully (mock implementation)');
    }
  };

  const handleManualRegistration = async () => {
    if (!newVisitorName.trim() || !phone.trim() || !toMeet.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (!capturedPhoto) {
      setError('Please capture a photo first');
      return;
    }

    // Here you would create a new user and check them in
    alert(`Registration successful for ${newVisitorName}. Awaiting approval from ${toMeet}.`);
    resetToGateSelection();
  };

  const handleVerificationStep = () => {
    if (faceVerificationData && faceVerificationData.verificationCount < 5) {
      // Need more verifications
      alert(`This user needs ${5 - faceVerificationData.verificationCount} more face verifications from authorized users.`);
    } else {
      // Verification complete
      alert(`Check-in successful for ${userInfo?.firstname} ${userInfo?.lastname}`);
      resetToGateSelection();
    }
  };

  const resetToGateSelection = () => {
    setStep("gate-selection");
    setSelectedGate(null);
    setPhone("+91 ");
    setOtp("");
    setUserInfo(null);
    setCheckInData(null);
    setFaceVerificationData(null);
    setNewVisitorName("");
    setToMeet("");
    setCapturedPhoto(null);
    setError(null);
  };

  const renderContent = () => {
    switch (step) {
      case "gate-selection":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Gate</h2>
            {authorizedGates.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No authorized gates found. Please contact your administrator.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {authorizedGates.map((gate) => (
                  <button
                    key={gate.id}
                    onClick={() => handleGateSelection(gate)}
                    className="text-left p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{gate.name}</div>
                    <div className="text-sm text-gray-500">{gate.establishment_name}</div>
                    {gate.geofencing && (
                      <div className="text-xs text-orange-600 mt-1">
                        Geofencing enabled ({gate.radius}m radius)
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case "geofence-check":
        return (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Location Check Failed</h2>
            <p className="text-gray-600">{error}</p>
            <div className="space-y-2">
              <button
                onClick={() => handleGateSelection(selectedGate!)}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Retry Location Check
              </button>
              <button
                onClick={resetToGateSelection}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Choose Different Gate
              </button>
            </div>
          </div>
        );

      case "method-selection":
        return (
          <div className="space-y-4">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Check-in at {selectedGate?.name}</h2>
              <p className="text-gray-600">{selectedGate?.establishment_name}</p>
            </div>
            
            {checkInData?.hasActiveCheckIn && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                <p className="font-medium">Active Check-in Found</p>
                <p className="text-sm">
                  {checkInData.activeCheckIn?.firstname} {checkInData.activeCheckIn?.lastname} is already checked in since{' '}
                  {checkInData.activeCheckIn?.check_in_at && new Date(checkInData.activeCheckIn.check_in_at).toLocaleString()}
                </p>
              </div>
            )}

            <div className="grid gap-3">
              <button 
                onClick={() => setStep("qr")}
                className="flex items-center justify-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M4 4h5v5H4V4zm11 0h5v5h-5V4zM4 15h5v5H4v-5z" />
                </svg>
                <span className="font-medium">Scan QR Code</span>
              </button>
              
              <button 
                onClick={() => setStep("phone")}
                className="flex items-center justify-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="font-medium">Phone Number Entry</span>
              </button>
              
              <button 
                onClick={() => setStep("face")}
                className="flex items-center justify-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="font-medium">Face Recognition</span>
              </button>
              
              <button 
                onClick={() => setStep("manual")}
                className="flex items-center justify-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="font-medium">Manual Entry</span>
              </button>
            </div>
            
            <button
              onClick={resetToGateSelection}
              className="w-full mt-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Change Gate
            </button>
          </div>
        );

      case "qr":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Scan QR Code</h2>
            <div className="flex justify-center">
              <QRScanner 
                onScan={handleQRScan}
                onError={(error) => setError(`QR Scanner error: ${error}`)}
              />
            </div>
            <button
              onClick={() => setStep("method-selection")}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Methods
            </button>
          </div>
        );

      case "phone":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Phone Number Entry</h2>
            <PhoneInput
              value={phone}
              onChange={setPhone}
              error={!!error}
              helperText={error || undefined}
            />
            <button
              onClick={handlePhoneSubmit}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Continue
            </button>
            <button
              onClick={() => setStep("method-selection")}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Methods
            </button>
          </div>
        );

      case "face":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Face Recognition</h2>
            <div className="flex justify-center">
              <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="rounded-lg" />
            </div>
            <button
              onClick={captureFace}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Capture & Verify
            </button>
            <button
              onClick={() => setStep("method-selection")}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Methods
            </button>
          </div>
        );

      case "verification":
        return (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Face Verification Required</h2>
            <p className="text-gray-600">
              {userInfo?.firstname} {userInfo?.lastname} needs face verification from authorized personnel.
            </p>
            <p className="text-sm text-gray-500">
              Verifications completed: {faceVerificationData?.verificationCount || 0}/5
            </p>
            <div className="space-y-2">
              <button
                onClick={handleVerificationStep}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Continue Verification
              </button>
              <button
                onClick={resetToGateSelection}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        );

      case "register":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">New Visitor Registration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newVisitorName}
                  onChange={(e) => setNewVisitorName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter visitor's full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <PhoneInput
                  value={phone}
                  onChange={setPhone}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Person to Meet *</label>
                <input
                  type="text"
                  value={toMeet}
                  onChange={(e) => setToMeet(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter name of person to meet"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo *</label>
                <div className="space-y-2">
                  <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="w-full rounded-lg" />
                  <button
                    onClick={captureFace}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Capture Photo
                  </button>
                  {capturedPhoto && (
                    <div className="text-center">
                      <p className="text-sm text-green-600">✓ Photo captured successfully</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={handleManualRegistration}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Register & Request Entry
              </button>
              <button
                onClick={() => setStep("method-selection")}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        );

      default:
        return <div>Unknown step</div>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-12 w-12 text-orange-500 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="mt-2 text-gray-600">Loading check-in system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
              Visitor Check-In System
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Secure visitor entry and management
            </p>
          </div>
          
          <div className="p-4 sm:p-6">
            {error && step !== "geofence-check" && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{error}</span>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
