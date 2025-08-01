import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEstablishment } from "../contexts/EstablishmentContext";
import { api } from "../utils/api";

export interface Establishment {
  id: number;
  name: string;
  logo?: string;
  plan: number;
  address1?: string;
  pincode?: string;
}

interface EstablishmentListProps {
  onEstablishmentSelect?: (establishment: Establishment) => void;
  showCreateButton?: boolean;
}

const EstablishmentList: React.FC<EstablishmentListProps> = ({
  onEstablishmentSelect,
  showCreateButton = true,
}) => {
  const navigate = useNavigate();
  const { user, wsToken } = useAuth();
  const { setSelectedEstablishment } = useEstablishment();
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Plan limits - default to Basic (plan 1) if no plan is set
  const userPlan = user?.plan || 1;
  const maxEstablishments = userPlan === 3 ? 10 : 1; // Enterprise: 10, others: 1
  const canCreate = establishments.length < maxEstablishments;

  const fetchEstablishments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/establishments/my-establishments", {
        headers: {
          Authorization: `Bearer ${wsToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch establishments");
      }

      const data = await response.json();
      setEstablishments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch establishments");
    } finally {
      setLoading(false);
    }
  }, [wsToken]);

  useEffect(() => {
    if (!wsToken || !user?.id) return;
    fetchEstablishments();
  }, [wsToken, user?.id, fetchEstablishments]);

  const handleEstablishmentClick = (establishment: Establishment) => {
    setSelectedEstablishment(establishment);
    if (onEstablishmentSelect) {
      onEstablishmentSelect(establishment);
    } else {
      // Default behavior - navigate to establishment details
      navigate(`/dashboard/establishments/${establishment.id}`);
    }
  };

  const getPlanName = (plan: number) => {
    // Default to Basic (plan 1) if plan is undefined, null, or 0
    const validPlan = plan || 1;
    switch (validPlan) {
      case 1:
        return "Basic";
      case 2:
        return "Pro";
      case 3:
        return "Enterprise";
      default:
        return "Basic";
    }
  };

  const getPlanColor = (plan: number) => {
    // Default to Basic (plan 1) if plan is undefined, null, or 0
    const validPlan = plan || 1;
    switch (validPlan) {
      case 1:
        return "bg-gray-100 text-gray-800";
      case 2:
        return "bg-orange-100 text-orange-800";
      case 3:
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
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
        <p className="text-gray-500">Loading establishments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchEstablishments}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Your Establishments
          </h2>
          <p className="text-gray-600 mt-1">
            Manage your business locations and access points
          </p>
        </div>
        {showCreateButton && canCreate && (
          <button
            onClick={() => navigate("/create-establishment")}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center"
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
            Create Establishment
          </button>
        )}
      </div>

      {/* Plan Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              Establishments: {establishments.length} /{" "}
              {maxEstablishments === 10 ? maxEstablishments : "1"}
            </p>
            <div className="w-64 bg-gray-200 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  establishments.length >= maxEstablishments
                    ? "bg-red-500"
                    : "bg-orange-500"
                }`}
                style={{
                  width: `${
                    (establishments.length / maxEstablishments) * 100
                  }%`,
                }}
              ></div>
            </div>
          </div>
          {!canCreate && (
            <span className="text-sm text-gray-500">Plan limit reached</span>
          )}
        </div>
      </div>

      {/* Establishments Grid */}
      {establishments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No establishments yet
          </h3>
          <p className="text-gray-600 mb-4">
            Create your first establishment to get started with visitor
            management
          </p>
          {canCreate && (
            <button
              onClick={() => navigate("/create-establishment")}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Create Your First Establishment
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {establishments.map((establishment) => (
            <div
              key={establishment.id}
              onClick={() => handleEstablishmentClick(establishment)}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-orange-200 transition-colors">
                    {establishment.logo ? (
                      <img
                        src={establishment.logo}
                        alt={establishment.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
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
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(
                    establishment.plan
                  )}`}
                >
                  {getPlanName(establishment.plan)}
                </span>
              </div>

              <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-orange-600 transition-colors">
                {establishment.name}
              </h3>

              {establishment.address1 && (
                <p className="text-sm text-gray-500 mb-2">
                  {establishment.address1}
                  {establishment.pincode && ` - ${establishment.pincode}`}
                </p>
              )}

              <div className="flex items-center text-sm text-gray-400 group-hover:text-orange-500 transition-colors">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                Manage establishment
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EstablishmentList;
