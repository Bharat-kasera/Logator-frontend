import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../contexts/DataContext";
import LoadingSpinner from "../components/LoadingSpinner";

const GatesRedirect: React.FC = () => {
  const navigate = useNavigate();
  const { companies, isLoadingCompanies } = useData();

  useEffect(() => {
    if (!isLoadingCompanies) {
      if (companies.length > 0) {
        // Redirect to the first company's dashboard where they can manage establishments and their gates
        const primaryCompany = companies[0];
        if (primaryCompany.uuid) {
          navigate(`/company/${primaryCompany.uuid}/dashboard`, { replace: true });
        } else {
          // Fallback: redirect to companies list
          navigate("/dashboard/companies", { replace: true });
        }
      } else {
        // No companies found, redirect to companies list
        navigate("/dashboard/companies", { replace: true });
      }
    }
  }, [companies, isLoadingCompanies, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
      <LoadingSpinner 
        size="lg" 
        color="orange" 
        message="Redirecting to your company dashboard..." 
        fullScreen={false}
      />
    </div>
  );
};

export default GatesRedirect;