import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { generateQRValue } from '../utils/qrUtils';

const MyQRCode: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qrRef = useRef<SVGSVGElement | null>(null);

  const [options, setOptions] = useState({
    download: false,
    whatsapp: false,
    email: false,
  });

  const userId = user?.id;
  const qrValue = userId ? generateQRValue(userId) : 'INVALID-USER';

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOptions({ ...options, [event.target.name]: event.target.checked });
  };

  const handleSubmit = () => {
    if (options.download && qrRef.current) {
      const svg = qrRef.current;
      const serializer = new XMLSerializer();
      const source = serializer.serializeToString(svg);
      const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'my-qrcode.svg';
      a.click();
      URL.revokeObjectURL(url);
    }
    if (options.whatsapp) {
      const whatsappUrl = `https://wa.me/?text=Here%20is%20my%20QR%20code:%20${encodeURIComponent(qrValue)}`;
      window.open(whatsappUrl, '_blank');
    }
    if (options.email) {
      const mailto = `mailto:?subject=My%20QR%20Code&body=Here%20is%20my%20QR%20code:%20${encodeURIComponent(qrValue)}`;
      window.open(mailto, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M4 4h5v5H4V4zm11 0h5v5h-5V4zM4 15h5v5H4v-5z"
                    />
                  </svg>
                </div>
                <span 
                  onClick={() => navigate('/dashboard')} 
                  className="ml-3 text-xl font-bold text-gray-900 cursor-pointer"
                >
                  Logator.io
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-orange-600 hover:text-orange-700 font-medium transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            My <span className="text-orange-500">QR Code</span>
          </h1>
          <p className="text-lg text-gray-600">
            Your personal QR code for quick visitor check-ins
          </p>
        </div>

        {/* QR Code Card */}
        <div className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100">
            <h2 className="text-xl font-semibold text-gray-900">Personal QR Code</h2>
            <p className="text-sm text-gray-600 mt-1">Share this code for easy visitor registration</p>
          </div>
          
          <div className="p-8">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* QR Code */}
              <div className="flex-shrink-0">
                <div className="bg-white p-6 rounded-xl shadow-md border-2 border-gray-200">
                  <QRCodeSVG
                    ref={qrRef}
                    value={qrValue}
                    size={200}
                    level="M"
                    includeMargin={true}
                  />
                </div>
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-600">Secure QR Code</p>
                  <p className="text-xs text-gray-500 mt-1">Personal identification code</p>
                  <div className="flex items-center justify-center mt-2">
                    <svg className="w-3 h-3 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-xs text-green-600 font-medium">Encrypted</span>
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="flex-1 w-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Share Options</h3>
                
                <div className="space-y-4 mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="download"
                      checked={options.download}
                      onChange={handleChange}
                      className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-gray-700">Download QR code as SVG</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="whatsapp"
                      checked={options.whatsapp}
                      onChange={handleChange}
                      className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-gray-700">Share via WhatsApp</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="email"
                      checked={options.email}
                      onChange={handleChange}
                      className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-gray-700">Share via Email</span>
                  </label>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!options.download && !options.whatsapp && !options.email}
                  className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-orange-500"
                >
                  Share QR Code
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
            <h3 className="text-xl font-semibold text-gray-900">How to Use</h3>
            <p className="text-sm text-gray-600 mt-1">Instructions for visitors</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Step 1</h4>
                <p className="text-sm text-gray-600">Visitors scan your QR code with their phone camera</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Step 2</h4>
                <p className="text-sm text-gray-600">They fill out their visitor information</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Step 3</h4>
                <p className="text-sm text-gray-600">You receive instant notification of their visit</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyQRCode;
