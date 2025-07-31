import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const CreateEstablishment: React.FC = () => {
  const { user, wsToken } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    address1: '',
    address2: '',
    pincode: '',
    gst: '',
    pan: '',
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      let logoBase64 = '';
      if (logoFile) {
        const reader = new FileReader();
        await new Promise((resolve) => {
          reader.onloadend = () => {
            logoBase64 = reader.result as string;
            resolve(true);
          };
          reader.readAsDataURL(logoFile);
        });
      }

      const response = await fetch('/api/establishments/create-establishment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${wsToken}`,
        },
        body: JSON.stringify({
          ...formData,
          logo: logoBase64,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create establishment');
      }

      await response.json();
      setMessage('✅ Establishment created successfully!');
      
      // Reset form
      setFormData({
        name: '',
        address1: '',
        address2: '',
        pincode: '',
        gst: '',
        pan: '',
      });
      setLogoFile(null);
      setLogoPreview('');

      // Navigate to dashboard after a delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      if (errorMessage.includes('Session expired') || errorMessage.includes('expired')) {
        setMessage('❌ Your session has expired. Redirecting to login...');
        // The API utility will handle the redirect automatically
      } else {
        setMessage(`❌ ${errorMessage}`);
      }
    } finally {
      setLoading(false);
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
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <span onClick={() => navigate('/dashboard')} className="ml-3 text-xl font-bold text-gray-900 cursor-pointer">Logator.io</span>
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
            Create Your <span className="text-orange-500">Establishment</span>
          </h1>
          <p className="text-lg text-gray-600">
            Set up your company profile to start managing visitors and access control
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Establishment Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Enter establishment name"
                />
              </div>

              <div>
                <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode *
                </label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Enter pincode"
                />
              </div>
            </div>

            {/* Address Information */}
            <div>
              <label htmlFor="address1" className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 1 *
              </label>
              <input
                type="text"
                id="address1"
                name="address1"
                value={formData.address1}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                placeholder="Enter address line 1"
              />
            </div>

            <div>
              <label htmlFor="address2" className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 2
              </label>
              <input
                type="text"
                id="address2"
                name="address2"
                value={formData.address2}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                placeholder="Enter address line 2 (optional)"
              />
            </div>

            {/* Business Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="gst" className="block text-sm font-medium text-gray-700 mb-2">
                  GST Number
                </label>
                <input
                  type="text"
                  id="gst"
                  name="gst"
                  value={formData.gst}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Enter GST number (optional)"
                />
              </div>

              <div>
                <label htmlFor="pan" className="block text-sm font-medium text-gray-700 mb-2">
                  PAN Number
                </label>
                <input
                  type="text"
                  id="pan"
                  name="pan"
                  value={formData.pan}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Enter PAN number (optional)"
                />
              </div>
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo Upload
              </label>
              <div className="flex items-center space-x-4">
                <label className="cursor-pointer bg-orange-50 border-2 border-dashed border-orange-300 rounded-lg p-6 hover:border-orange-400 transition-colors text-center flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <svg className="w-8 h-8 text-orange-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm text-gray-600">Click to upload logo</p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </label>
                
                {logoPreview && (
                  <div className="flex-shrink-0">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Plan Information */}
            {user && (
              <div className="bg-orange-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Plan Information</h3>
                <p className="text-sm text-gray-600">
                  Current user plan: <span className="font-medium">
                    {user.plan == 1 || user.plan === '1' ? 'Basic' : 
                     user.plan == 2 || user.plan === '2' ? 'Pro' : 
                     user.plan == 3 || user.plan === '3' ? 'Enterprise' : 
                     user.plan ? `Unknown (${user.plan})` : 'Basic (Default)'}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Establishment plan: <span className="font-medium">
                    {user.plan == 3 || user.plan === '3' ? 'Pro (Auto-upgraded from Enterprise)' : 
                     user.plan == 2 || user.plan === '2' ? 'Pro' : 
                     (user.plan == 1 || user.plan === '1' || !user.plan) ? 'Basic' : `Unknown (${user.plan})`}
                  </span>
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-4 bg-orange-500 text-white rounded-xl hover:bg-orange-600 font-semibold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Establishment...
                  </div>
                ) : (
                  'Create Establishment'
                )}
              </button>
            </div>

            {/* Message */}
            {message && (
              <div className={`p-4 rounded-lg ${
                message.startsWith('✅') 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message}
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateEstablishment; 