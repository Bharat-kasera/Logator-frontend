import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { useEstablishment } from '../contexts/EstablishmentContext';

const Assets: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { establishments, isLoadingEstablishments, userPlan } = useData();
  const { setSelectedEstablishment } = useEstablishment();
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [assets, setAssets] = useState<any[]>([]);
  
  const loading = isLoadingEstablishments;

  // Fetch establishments and assets for the logged-in user on mount
  // Initialize mock assets data (in real app, this would come from API)
  React.useEffect(() => {
    setAssets([
      { id: 1, name: 'Security Camera System', type: 'Equipment', establishment: 'Main Office', status: 'Active', value: '$15,000', location: 'Lobby' },
      { id: 2, name: 'Badge Printer', type: 'Equipment', establishment: 'Main Office', status: 'Active', value: '$800', location: 'Reception' },
      { id: 3, name: 'Access Control Panel', type: 'System', establishment: 'North Building', status: 'Maintenance', value: '$5,000', location: 'Security Room' },
      { id: 4, name: 'Visitor Management Kiosk', type: 'Equipment', establishment: 'South Branch', status: 'Active', value: '$2,500', location: 'Entrance' },
    ]);
  }, []);

  const handleEstablishmentClick = (est: any) => {
    // Save gst and pan number explicitly along with all details
    setSelectedEstablishment({
      ...est,
      gst: est.gst_number || est.gst || '',
      pan: est.pan_number || est.pan || ''
    });
            navigate('/dashboard');
  };

  // Use centralized plan logic
  const estCount = establishments.length;
  const canCreate = userPlan ? estCount < userPlan.maxEstablishments : false;
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