import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCompany } from "../contexts/CompanyContext";
import CompanySidePanel from "../components/CompanySidePanel";
import LoadingSpinner from "../components/LoadingSpinner";
import { api } from "../utils/api";

interface Company {
  id: number;
  name: string;
  description?: string;
  logo_url?: string;
  address1?: string;
  address2?: string;
  pincode?: string;
  gst_number?: string;
  pan_number?: string;
  website?: string;
  phone?: string;
  email?: string;
  uuid: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

const CompanySettings: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const { selectedCompany, setSelectedCompany } = useCompany();
  
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("general");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address1: "",
    address2: "",
    pincode: "",
    gst_number: "",
    pan_number: "",
    website: "",
    phone: "",
    email: "",
    logo_url: ""
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    fetchCompanyDetails();
  }, [companyId]);

  const fetchCompanyDetails = async () => {
    if (!companyId) return;
    
    try {
      setLoading(true);
      setError("");
      
      const response = await api.get(`/companies/${companyId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch company details");
      }
      
      const data = await response.json();
      setCompany(data);
      
      // Populate form with current data
      setFormData({
        name: data.name || "",
        description: data.description || "",
        address1: data.address1 || "",
        address2: data.address2 || "",
        pincode: data.pincode || "",
        gst_number: data.gst_number || "",
        pan_number: data.pan_number || "",
        website: data.website || "",
        phone: data.phone || "",
        email: data.email || "",
        logo_url: data.logo_url || ""
      });
    } catch (err: any) {
      console.error("Error fetching company details:", err);
      setError(err.message || "Failed to fetch company details");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setLogoFile(file || null);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logo_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !company) return;

    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        address1: formData.address1,
        address2: formData.address2,
        pincode: formData.pincode,
        gst_number: formData.gst_number,
        pan_number: formData.pan_number,
        website: formData.website,
        phone: formData.phone,
        email: formData.email,
        logo_url: formData.logo_url
      };

      const response = await api.put(`/companies/${companyId}`, payload);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update company");
      }

      const updatedCompany = await response.json();
      setCompany(updatedCompany);
      
      // Update context if this is the selected company
      if (selectedCompany?.uuid === companyId) {
        setSelectedCompany(updatedCompany);
      }
      
      setSuccessMessage("Company settings updated successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      console.error("Error updating company:", err);
      setError(err.message || "Failed to update company");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCompany = async () => {
    if (!companyId || !company) return;

    try {
      setSaving(true);
      
      const response = await api.delete(`/companies/${companyId}`);
      
      if (!response.ok) {
        throw new Error("Failed to delete company");
      }
      
      // Redirect to companies list
      navigate('/dashboard/companies');
    } catch (err: any) {
      console.error("Error deleting company:", err);
      setError(err.message || "Failed to delete company");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex">
        <CompanySidePanel companyName={selectedCompany?.name} />
        <main className="flex-1 mt-10 lg:mt-0 lg:ml-5 p-4 sm:p-6 lg:p-8 overflow-auto">
          <LoadingSpinner size="lg" color="green" message="Loading company settings..." fullScreen={false} />
        </main>
      </div>
    );
  }

  if (error && !company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex">
        <CompanySidePanel companyName={selectedCompany?.name} />
        <main className="flex-1 mt-10 lg:mt-0 lg:ml-5 p-4 sm:p-6 lg:p-8 overflow-auto">
          <div className="text-center py-12">
            <div className="text-red-600 text-lg mb-4">{error}</div>
            <button
              onClick={fetchCompanyDetails}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!company) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex">
      <CompanySidePanel companyName={company.name} />
      
      <main className="flex-1 mt-10 lg:mt-0 lg:ml-5 p-4 sm:p-6 lg:p-8 overflow-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-800 mb-2">Company Settings</h1>
          <p className="text-green-600">Configure your company information and preferences</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
            <button 
              onClick={() => setError("")}
              className="ml-3 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab("general")}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === "general"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                General Information
              </button>
              <button
                onClick={() => setActiveTab("contact")}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === "contact"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Contact & Address
              </button>
              <button
                onClick={() => setActiveTab("business")}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === "business"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Business Details
              </button>
              <button
                onClick={() => setActiveTab("danger")}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === "danger"
                    ? "border-red-500 text-red-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Danger Zone
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "general" && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    placeholder="Brief description of your company"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  />
                  {formData.logo_url && (
                    <div className="mt-2">
                      <img src={formData.logo_url} alt="Logo preview" className="w-20 h-20 object-cover rounded-lg" />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}

            {activeTab === "contact" && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    placeholder="https://example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                  <input
                    type="text"
                    value={formData.address1}
                    onChange={(e) => setFormData(prev => ({ ...prev, address1: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                  <input
                    type="text"
                    value={formData.address2}
                    onChange={(e) => setFormData(prev => ({ ...prev, address2: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}

            {activeTab === "business" && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                  <input
                    type="text"
                    value={formData.gst_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, gst_number: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    placeholder="GST registration number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
                  <input
                    type="text"
                    value={formData.pan_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, pan_number: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    placeholder="PAN card number"
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Company Information</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">Company ID:</span> {company.uuid}</p>
                    <p><span className="font-medium">Created:</span> {new Date(company.created_at).toLocaleDateString()}</p>
                    <p><span className="font-medium">Last Updated:</span> {new Date(company.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}

            {activeTab === "danger" && (
              <div className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-red-900 mb-2">Delete Company</h3>
                  <p className="text-sm text-red-700 mb-4">
                    Once you delete your company, all associated data including establishments, gates, departments, 
                    visitor logs, and pending requests will be permanently removed. This action cannot be undone.
                  </p>
                  
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete Company
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-red-900">
                        Are you absolutely sure? Type the company name "{company.name}" to confirm:
                      </p>
                      <input
                        type="text"
                        placeholder={`Type "${company.name}" to confirm`}
                        className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                        onChange={(e) => {
                          // Enable delete button only if company name matches
                          const deleteBtn = document.getElementById('confirm-delete') as HTMLButtonElement;
                          if (deleteBtn) {
                            deleteBtn.disabled = e.target.value !== company.name;
                          }
                        }}
                      />
                      <div className="flex items-center gap-3">
                        <button
                          id="confirm-delete"
                          onClick={handleDeleteCompany}
                          disabled={saving}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? "Deleting..." : "I understand, delete this company"}
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompanySettings;