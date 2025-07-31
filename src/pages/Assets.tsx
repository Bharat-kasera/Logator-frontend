import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEstablishment } from '../contexts/EstablishmentContext';

const Assets: React.FC = () => {
  const navigate = useNavigate();
  const { user, wsToken } = useAuth();
  const { setSelectedEstablishment } = useEstablishment();
  const userId = user?.id;
  const userPlan = user?.plan;
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [assets, setAssets] = useState<any[]>([]);

  // Fetch establishments and assets for the logged-in user on mount
  useEffect(() => {
    if (!wsToken || !userId) return;
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch establishments
        const res = await fetch(`/api/establishments/by-user/${userId}`, {
          headers: {
            "Authorization": `Bearer ${wsToken}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch establishments");
        const data = await res.json();
        setEstablishments(data);

        // Mock assets data for now
        setAssets([
          { id: 1, name: 'Security Camera System', type: 'Equipment', establishment: 'Main Office', status: 'Active', value: '$15,000', location: 'Lobby' },
          { id: 2, name: 'Badge Printer', type: 'Equipment', establishment: 'Main Office', status: 'Active', value: '$800', location: 'Reception' },
          { id: 3, name: 'Access Control Panel', type: 'System', establishment: 'North Building', status: 'Maintenance', value: '$5,000', location: 'Security Room' },
          { id: 4, name: 'Visitor Management Kiosk', type: 'Equipment', establishment: 'South Branch', status: 'Active', value: '$2,500', location: 'Entrance' },
        ]);
      } catch (err: any) {
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [wsToken, userId]);

  const handleEstablishmentClick = (est: any) => {
    // Save gst and pan number explicitly along with all details
    setSelectedEstablishment({
      ...est,
      gst: est.gst_number || est.gst || '',
      pan: est.pan_number || est.pan || ''
    });
            navigate('/dashboard');
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