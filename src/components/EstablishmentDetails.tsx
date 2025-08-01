import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEstablishment } from "../contexts/EstablishmentContext";
import GateForm from "./GateForm";
import { api } from "../utils/api";

interface Department {
  id: number;
  establishment_id: number;
  name: string;
}

interface Gate {
  id: number;
  name: string;
  geofencing: boolean;
  latitude?: number | null;
  longitude?: number | null;
  radius?: number | null;
}

interface EstablishmentDetailsProps {
  establishmentId?: string;
}

const EstablishmentDetails: React.FC<EstablishmentDetailsProps> = ({
  establishmentId,
}) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { wsToken } = useAuth();
  const { selectedEstablishment, setSelectedEstablishment } =
    useEstablishment();

  const currentEstablishmentId = establishmentId || id;

  const [activeTab, setActiveTab] = useState<"departments" | "gates">(
    "departments"
  );
  const [establishment, setEstablishment] = useState<any>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [gates, setGates] = useState<Gate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Department form state
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [departmentLoading, setDepartmentLoading] = useState(false);

  // Gate form state
  const [showGateForm, setShowGateForm] = useState(false);
  const [editingGate, setEditingGate] = useState<Gate | null>(null);

  // Plan limits
  const plan = establishment?.plan || selectedEstablishment?.plan;
  const maxDepartments = plan === 1 ? 1 : plan === 2 ? 10 : Infinity;
  const maxGates = plan === 1 ? 2 : plan === 2 ? 10 : Infinity;

  useEffect(() => {
    if (currentEstablishmentId) {
      fetchEstablishmentDetails();
    }
  }, [currentEstablishmentId, wsToken]);

  const fetchEstablishmentDetails = async () => {
    if (!currentEstablishmentId || !wsToken) return;

    setLoading(true);
    setError("");

    try {
      // If we have selectedEstablishment and it matches, use it
      if (
        selectedEstablishment &&
        selectedEstablishment.id.toString() === currentEstablishmentId
      ) {
        setEstablishment(selectedEstablishment);
      } else {
        // Fetch establishment details using the new endpoint
        const response = await fetch(
          `/api/establishments/${currentEstablishmentId}`,
          {
            headers: { Authorization: `Bearer ${wsToken}` },
          }
        );

        if (!response.ok) {
          throw new Error("Establishment not found");
        }

        const establishment = await response.json();
        setEstablishment(establishment);
        setSelectedEstablishment(establishment);
      }

      // Fetch departments and gates
      await Promise.all([fetchDepartments(), fetchGates()]);
    } catch (err: any) {
      setError(err.message || "Failed to fetch establishment details");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch(
        `/api/departments/${currentEstablishmentId}`,
        {
          headers: { Authorization: `Bearer ${wsToken}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (err) {
      console.error("Failed to fetch departments:", err);
    }
  };

  const fetchGates = async () => {
    try {
      const response = await fetch(`/api/gates/${currentEstablishmentId}`, {
        headers: { Authorization: `Bearer ${wsToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setGates(data);
      }
    } catch (err) {
      console.error("Failed to fetch gates:", err);
    }
  };

  const handleAddDepartment = async () => {
    if (!newDepartmentName.trim() || departments.length >= maxDepartments)
      return;

    setDepartmentLoading(true);
    try {
      const response = await api.post("/departments", {
        establishment_id: currentEstablishmentId,
        name: newDepartmentName.trim(),
      }, {
        headers: {
          Authorization: `Bearer ${wsToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add department");
      }

      const newDepartment = await response.json();
      setDepartments([...departments, newDepartment]);
      setNewDepartmentName("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDepartmentLoading(false);
    }
  };

  const handleDeleteDepartment = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this department?"))
      return;

    try {
      const response = await fetch(`/api/departments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${wsToken}` },
      });

      if (!response.ok) {
        throw new Error("Failed to delete department");
      }

      setDepartments(departments.filter((d) => d.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGateCreated = (newGate: Gate) => {
    setGates([...gates, newGate]);
    setShowGateForm(false);
  };

  const handleGateUpdated = (updatedGate: Gate) => {
    setGates(gates.map((g) => (g.id === updatedGate.id ? updatedGate : g)));
    setEditingGate(null);
    setShowGateForm(false);
  };

  const handleDeleteGate = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this gate?")) return;

    try {
      const response = await fetch(`/api/gates/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${wsToken}` },
      });

      if (!response.ok) {
        throw new Error("Failed to delete gate");
      }

      setGates(gates.filter((g) => g.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getPlanName = (plan: number) => {
    switch (plan) {
      case 1:
        return "Basic";
      case 2:
        return "Pro";
      case 3:
        return "Enterprise";
      default:
        return "Unknown";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
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
          <p className="text-gray-500">Loading establishment details...</p>
        </div>
      </div>
    );
  }

  if (error || !establishment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <svg
            className="w-16 h-16 text-red-300 mx-auto mb-4"
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
          <p className="text-red-600 mb-4">
            {error || "Establishment not found"}
          </p>
          <button
            onClick={() => navigate("/dashboard/establishments")}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Back to Establishments
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
              <button
                onClick={() => navigate("/dashboard/establishments")}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {establishment.name}
                </h1>
                <span className="text-sm text-gray-500">
                  {getPlanName(establishment.plan)} Plan
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("departments")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "departments"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center">
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  Departments ({departments.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab("gates")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "gates"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center">
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
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Gates ({gates.length})
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "departments" && (
              <div className="space-y-6">
                {/* Add Department Form */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Add New Department
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={newDepartmentName}
                        onChange={(e) => setNewDepartmentName(e.target.value)}
                        placeholder="Enter department name"
                        disabled={departments.length >= maxDepartments}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>
                    <button
                      onClick={handleAddDepartment}
                      disabled={
                        departments.length >= maxDepartments ||
                        !newDepartmentName.trim() ||
                        departmentLoading
                      }
                      className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
                    >
                      {departmentLoading ? (
                        <svg
                          className="animate-spin h-5 w-5"
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
                  <p className="text-sm text-gray-600 mt-2">
                    Departments: {departments.length} /{" "}
                    {maxDepartments === Infinity ? "∞" : maxDepartments}
                  </p>
                </div>

                {/* Departments List */}
                <div className="space-y-4">
                  {departments.length === 0 ? (
                    <div className="text-center py-8">
                      <svg
                        className="w-12 h-12 text-gray-300 mx-auto mb-4"
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
                      <p className="text-gray-500">No departments yet</p>
                    </div>
                  ) : (
                    departments.map((department) => (
                      <div
                        key={department.id}
                        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
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
                          onClick={() => handleDeleteDepartment(department.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "gates" && (
              <div className="space-y-6">
                {/* Add Gate Button */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Manage Gates
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Gates: {gates.length} /{" "}
                      {maxGates === Infinity ? "∞" : maxGates}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowGateForm(true)}
                    disabled={gates.length >= maxGates}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
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
                    Add Gate
                  </button>
                </div>

                {/* Gate Form */}
                {showGateForm && (
                  <GateForm
                    establishmentId={currentEstablishmentId!}
                    editingGate={editingGate}
                    onGateCreated={handleGateCreated}
                    onGateUpdated={handleGateUpdated}
                    onCancel={() => {
                      setShowGateForm(false);
                      setEditingGate(null);
                    }}
                  />
                )}

                {/* Gates List */}
                <div className="space-y-4">
                  {gates.length === 0 ? (
                    <div className="text-center py-8">
                      <svg
                        className="w-12 h-12 text-gray-300 mx-auto mb-4"
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
                      <p className="text-gray-500">No gates yet</p>
                    </div>
                  ) : (
                    gates.map((gate) => (
                      <div
                        key={gate.id}
                        className="p-4 bg-white border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                              <svg
                                className="w-6 h-6 text-orange-600"
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
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-lg">
                                {gate.name}
                              </h4>
                              <div className="mt-2 space-y-1">
                                <div className="flex items-center">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      gate.geofencing
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {gate.geofencing
                                      ? "✓ Geofencing Enabled"
                                      : "Geofencing Disabled"}
                                  </span>
                                </div>
                                {gate.geofencing && (
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3 text-sm text-gray-600">
                                    <div>
                                      <span className="font-medium">
                                        Latitude:
                                      </span>{" "}
                                      {gate.latitude}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Longitude:
                                      </span>{" "}
                                      {gate.longitude}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Radius:
                                      </span>{" "}
                                      {gate.radius}m
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingGate(gate);
                                setShowGateForm(true);
                              }}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Edit gate"
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
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteGate(gate.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete gate"
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
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstablishmentDetails;
