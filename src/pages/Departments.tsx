import React, { useEffect, useState } from "react";
import { useEstablishment } from "../contexts/EstablishmentContext";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface Department {
  id: number;
  establishment_id: number;
  name: string;
}

const Departments: React.FC = () => {
  const { selectedEstablishment } = useEstablishment();
  const { wsToken } = useAuth();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [dept, setDept] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Plan logic
  const plan = selectedEstablishment?.plan;
  const maxDepartments = plan === 1 ? 1 : plan === 2 ? 10 : Infinity;
  const isBasic = plan === 1;
  const isPro = plan === 2;
  const isEnterprise = plan === 3;

  useEffect(() => {
    if (!selectedEstablishment) return;
    fetchDepartments();
  }, [selectedEstablishment, wsToken]);

  const fetchDepartments = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/departments/${selectedEstablishment.id}`,
        {
          headers: { Authorization: `Bearer ${wsToken}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      } else {
        throw new Error("Failed to fetch departments");
      }
    } catch (err) {
      setError("Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!dept.trim() || departments.length >= maxDepartments) return;
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${wsToken}`,
        },
        body: JSON.stringify({
          establishment_id: selectedEstablishment.id,
          name: dept.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add department");
      }

      const newDept = await response.json();
      setDepartments([...departments, newDept]);
      setDept("");
      setSuccess("✅ Department added successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this department?"))
      return;
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/departments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${wsToken}` },
      });

      if (!response.ok) {
        throw new Error("Failed to delete department");
      }

      setDepartments(departments.filter((d) => d.id !== id));
      setSuccess("✅ Department deleted successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getPlanName = () => {
    if (isBasic) return "Basic";
    if (isPro) return "Pro";
    if (isEnterprise) return "Enterprise";
    return "Unknown";
  };

  const getPlanDescription = () => {
    if (isBasic) return "Basic plan allows only 1 department";
    if (isPro) return "Pro plan allows up to 10 departments";
    if (isEnterprise) return "Enterprise plan allows unlimited departments";
    return "Unknown plan limits";
  };

  if (!selectedEstablishment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <p className="text-gray-500 mb-4">No establishment selected</p>
          <button
            onClick={() => navigate("/create-establishment")}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Create Establishment
          </button>
        </div>
      </div>
    );
  }

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
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
                <span onClick={() => navigate('/dashboard')} className="ml-3 text-xl font-bold text-gray-900 cursor-pointer">
                  Logator.io
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
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
            Manage <span className="text-orange-500">Departments</span>
          </h1>
          <p className="text-lg text-gray-600">
            Organize your establishment with departments for{" "}
            {selectedEstablishment.name}
          </p>
        </div>

        {/* Plan Information */}
        <div className="bg-white rounded-xl shadow-lg border border-orange-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Plan Information
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                isBasic
                  ? "bg-gray-100 text-gray-800"
                  : isPro
                  ? "bg-orange-100 text-orange-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {getPlanName()} Plan
            </span>
          </div>
          <p className="text-gray-600 mb-4">{getPlanDescription()}</p>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Departments used:</span>
              <span className="font-medium text-gray-900">
                {departments.length} /{" "}
                {maxDepartments === Infinity ? "∞" : maxDepartments}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  departments.length >= maxDepartments
                    ? "bg-red-500"
                    : "bg-orange-500"
                }`}
                style={{
                  width:
                    maxDepartments === Infinity
                      ? "20%"
                      : `${(departments.length / maxDepartments) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-800 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-800 border border-green-200 rounded-lg">
            {success}
          </div>
        )}

        {/* Add Department Form */}
        <div className="bg-white rounded-xl shadow-lg border border-orange-100 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Add New Department
          </h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                placeholder="Enter department name"
                disabled={departments.length >= maxDepartments}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <button
              onClick={handleAdd}
              disabled={
                departments.length >= maxDepartments || !dept.trim() || loading
              }
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center min-w-[140px]"
            >
              {loading ? (
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Department
                </>
              )}
            </button>
          </div>
          {departments.length >= maxDepartments && (
            <p className="mt-3 text-sm text-gray-500">
              You have reached the maximum number of departments for your plan.
            </p>
          )}
        </div>

        {/* Departments List */}
        <div className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Your Departments
            </h3>
          </div>

          {loading && departments.length === 0 ? (
            <div className="p-6 text-center">
              <svg
                className="animate-spin h-8 w-8 text-orange-500 mx-auto mb-4"
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="text-gray-500">Loading departments...</p>
            </div>
          ) : departments.length === 0 ? (
            <div className="p-6 text-center">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p className="text-gray-500 mb-4">No departments yet</p>
              <p className="text-sm text-gray-400">
                Create your first department to get started
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {departments.map((department) => (
                <div
                  key={department.id}
                  className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                      <svg
                        className="w-5 h-5 text-orange-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {department.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Department ID: {department.id}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(department.id)}
                    disabled={loading}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete department"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Departments;
