import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCompany } from "../contexts/CompanyContext";
import CompanySidePanel from "../components/CompanySidePanel";
import LoadingSpinner from "../components/LoadingSpinner";
import { api } from "../utils/api";

interface Establishment {
  id: number;
  name: string;
  address1?: string;
  address2?: string;
  pincode?: string;
  gst_number?: string;
  pan_number?: string;
  logo_url?: string;
  plan: number;
  company_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

const CompanyEstablishments: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedCompany } = useCompany();
  
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEstablishment, setEditingEstablishment] = useState<Establishment | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    address1: "",
    address2: "",
    pincode: "",
    gst: "",
    pan: "",
    logo: ""
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Plan limits - Basic: 1, Pro: 1, Enterprise: 10
  const userPlan = user?.plan || 1;
  const establishmentLimit = userPlan === 3 ? 10 : 1; // Basic & Pro: 1, Enterprise: 10
  const canCreate = establishments.length < establishmentLimit;

  useEffect(() => {
    fetchEstablishments();
  }, [companyId]);

  const fetchEstablishments = async () => {
    if (!companyId) return;
    
    try {
      setLoading(true);
      setError("");
      
      const response = await api.get(`/companies/${companyId}/establishments`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch establishments");
      }
      
      const data = await response.json();
      setEstablishments(data);
    } catch (err: any) {
      console.error("Error fetching establishments:", err);
      setError(err.message || "Failed to fetch establishments");
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
        setFormData(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address1: "",
      address2: "",
      pincode: "",
      gst: "",
      pan: "",
      logo: ""
    });
    setLogoFile(null);
    setEditingEstablishment(null);
    setShowCreateForm(false);
  };

  const handleEdit = (establishment: Establishment) => {
    setFormData({
      name: establishment.name,
      address1: establishment.address1 || "",
      address2: establishment.address2 || "",
      pincode: establishment.pincode || "",
      gst: establishment.gst_number || "",
      pan: establishment.pan_number || "",
      logo: establishment.logo_url || ""
    });
    setEditingEstablishment(establishment);
    setShowCreateForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        name: formData.name,
        address1: formData.address1,
        address2: formData.address2,
        pincode: formData.pincode,
        gst: formData.gst,
        pan: formData.pan,
        logo: formData.logo
      };

      let response;
      if (editingEstablishment) {
        // Update existing establishment
        response = await api.put(`/companies/${companyId}/establishments/${editingEstablishment.id}`, payload);
      } else {
        // Create new establishment
        response = await api.post(`/companies/${companyId}/establishments`, payload);
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save establishment");
      }

      // Refresh the list
      await fetchEstablishments();
      resetForm();
    } catch (err: any) {
      console.error("Error saving establishment:", err);
      setError(err.message || "Failed to save establishment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (establishment: Establishment) => {
    if (!companyId) return;
    
    if (!confirm(`Are you sure you want to delete "${establishment.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await api.delete(`/companies/${companyId}/establishments/${establishment.id}`);
      
      if (!response.ok) {
        throw new Error("Failed to delete establishment");
      }

      // Refresh the list
      await fetchEstablishments();
    } catch (err: any) {
      console.error("Error deleting establishment:", err);
      setError(err.message || "Failed to delete establishment");
    }
  };

  const getPlanName = (plan: number) => {
    switch (plan) {
      case 1: return "Basic";
      case 2: return "Pro";
      case 3: return "Enterprise";
      default: return "Basic";
    }
  };

  const getPlanColor = (plan: number) => {
    switch (plan) {
      case 1: return "bg-gray-100 text-gray-800";
      case 2: return "bg-green-100 text-green-800";
      case 3: return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex">
        <CompanySidePanel companyName={selectedCompany?.name} />
        <main className="flex-1 mt-10 lg:mt-0 lg:ml-5 p-4 sm:p-6 lg:p-8 overflow-auto">
          <LoadingSpinner size="lg" color="green" message="Loading establishments..." fullScreen={false} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex">
      <CompanySidePanel companyName={selectedCompany?.name} />
      
      <main className="flex-1 mt-10 lg:mt-0 lg:ml-5 p-4 sm:p-6 lg:p-8 overflow-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-800 mb-2">Establishments</h1>
          <p className="text-green-600">Manage your company locations</p>
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

        {/* Header with Create Button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Establishments</h2>
            <p className="text-gray-600 mt-1">Manage your business locations and access points</p>
          </div>
          {canCreate && !showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Establishment
            </button>
          )}
        </div>

        {/* Plan Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Establishments: {establishments.length} / {establishmentLimit}
              </p>
              <div className="w-64 bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    establishments.length >= establishmentLimit ? "bg-red-500" : "bg-green-500"
                  }`}
                  style={{
                    width: `${(establishments.length / establishmentLimit) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
            {!canCreate && (
              <span className="text-sm text-gray-500">Plan limit reached</span>
            )}
          </div>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingEstablishment ? "Edit Establishment" : "Create New Establishment"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    value={formData.pincode}
                    onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address 1 *</label>
                  <input
                    type="text"
                    required
                    value={formData.address1}
                    onChange={(e) => setFormData(prev => ({ ...prev, address1: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address 2</label>
                  <input
                    type="text"
                    value={formData.address2}
                    onChange={(e) => setFormData(prev => ({ ...prev, address2: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                  <input
                    type="text"
                    value={formData.gst}
                    onChange={(e) => setFormData(prev => ({ ...prev, gst: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
                  <input
                    type="text"
                    value={formData.pan}
                    onChange={(e) => setFormData(prev => ({ ...prev, pan: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                />
                {formData.logo && (
                  <img src={formData.logo} alt="Logo preview" className="mt-2 w-16 h-16 object-cover rounded-lg" />
                )}
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingEstablishment ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Establishments List */}
        {establishments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No establishments yet</h3>
            <p className="text-gray-600 mb-4">Create your first establishment to get started with visitor management</p>
            {canCreate && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Create Your First Establishment
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {establishments.map((establishment) => (
              <div key={establishment.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:border-green-300 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      {establishment.logo_url ? (
                        <img src={establishment.logo_url} alt={establishment.name} className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(establishment.plan)}`}>
                    {getPlanName(establishment.plan)}
                  </span>
                </div>

                <h3 className="font-semibold text-gray-900 text-lg mb-2">{establishment.name}</h3>

                {establishment.address1 && (
                  <p className="text-sm text-gray-500 mb-2">
                    {establishment.address1}
                    {establishment.pincode && ` - ${establishment.pincode}`}
                  </p>
                )}

                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={() => handleEdit(establishment)}
                    className="text-sm text-green-600 hover:text-green-700 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(establishment)}
                    className="text-sm text-red-600 hover:text-red-700 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CompanyEstablishments;