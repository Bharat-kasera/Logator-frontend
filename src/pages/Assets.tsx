import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import CreateEstablishment from "../components/CreateEstablishment";
import { useEstablishment } from '../contexts/EstablishmentContext';
import {
  Box,
  Button,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemText
} from "@mui/material";

const Assets: React.FC = () => {
  const navigate = useNavigate();
  const { user, wsToken } = useAuth();
  const { setSelectedEstablishment } = useEstablishment();
  const userId = user?.id;
  // Use plan as string for all logic
  const userPlan = user?.plan;
  // If you want to debug, uncomment:
  // console.log('userPlan', userPlan, typeof userPlan);


  const [establishments, setEstablishments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch establishments for the logged-in user on mount
  useEffect(() => {
    if (!wsToken || !userId) return;
    const fetchEstablishments = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/establishments/by-user/${userId}`, {
          headers: {
            "Authorization": `Bearer ${wsToken}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch establishments");
        const data = await res.json();
        setEstablishments(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch establishments");
      } finally {
        setLoading(false);
      }
    };
    fetchEstablishments();
  }, [wsToken, userId, successMsg]);

  const handleEstablishmentClick = (est: any) => {
    // Save gst and pan number explicitly along with all details
    setSelectedEstablishment({
      ...est,
      gst: est.gst_number || est.gst || '',
      pan: est.pan_number || est.pan || ''
    });
    navigate('/dashboard2');
  };

  // Determine if user can create a new establishment based on plan and count
  const estCount = establishments.length;
  let canCreate = false;
  if (userPlan === "1") {
    canCreate = estCount === 0;
  } else if (userPlan === "3") {
    canCreate = estCount < 10;
  }
  // fallback: allow if plan is unknown, for debugging
  // else if (!userPlan) canCreate = true;


  return (
    <Box maxWidth={600} mx="auto" mt={6}>
      <Typography variant="h4" fontWeight={700} align="center" mb={3}>
        My Assets
      </Typography>

      {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
      {/* Existing asset list and create logic below (untouched) */}
      <Box mt={4}>
        <List>
          {establishments.map((est, idx) => {
            let planLabel = '';
            switch (est.plan) {
              case "1":
                planLabel = 'Basic Plan';
                break;
              case "2":
                planLabel = 'Pro Plan';
                break;
              case "3":
                planLabel = 'Enterprise Plan';
                break;
              default:
                planLabel = 'Unknown Plan';
            }
            return (
              <ListItem button key={est.id} onClick={() => handleEstablishmentClick(est)}>
                <ListItemText
                  primary={
                    <span>
                      {`${idx + 1}. ${est.name}`}
                      <span style={{ marginLeft: 12, color: '#888', fontWeight: 500, fontSize: 14 }}>
                        {planLabel}
                      </span>
                    </span>
                  }
                />
              </ListItem>
            );
          })}
        </List>
        <Button
          variant="contained"
          color="primary"
          sx={{ mb: 2, mt: 2, fontWeight: 600 }}
          disabled={!canCreate}
          onClick={() => setShowCreate((v) => !v)}
        >
          {showCreate ? "Cancel" : "Create Establishment"}
        </Button>
        {!canCreate && (
          <Typography variant="body2" color="text.secondary">
            Your plan does not allow creating more establishments.
          </Typography>
        )}
        {showCreate && canCreate && (
          <CreateEstablishment
            onCreated={() => { setSuccessMsg("Establishment created!"); setShowCreate(false); }}
            userId={userId}
            plan={userPlan}
            token={wsToken}
          />
        )}
      </Box>
    </Box>
  );
};

export default Assets;