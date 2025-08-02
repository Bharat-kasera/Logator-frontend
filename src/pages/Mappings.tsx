import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, List, ListItem, ListItemText, IconButton, Button, Paper, TextField } from '@mui/material';
import { PhoneInput } from '../components/PhoneInput';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

import { useEstablishment } from '../contexts/EstablishmentContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';

const statusColors = {
  '1': 'warning.main', // Pending
  '2': 'success.main', // Accepted
  '3': 'error.main', // Declined
};
const statusLabels = {
  '1': 'Pending',
  '2': 'Accepted',
  '3': 'Declined',
};

interface Department {
  id: number;
  name: string;
  establishment_id: number;
}

interface Gate {
  id: number;
  name: string;
  establishment_id: number;
}

interface UserMapping {
  id: number;
  user_id: number;
  user_phone: string;
  department_id?: number;
  gate_id?: number;
  status: string;
}

const Mappings: React.FC = () => {
  // New state for batch adds/removes
  const [deptAdds, setDeptAdds] = useState<{ [deptId: number]: Set<number> }>({});
  const [deptRemoves, setDeptRemoves] = useState<{ [deptId: number]: Set<number> }>({});
  const [deptPhoneInputs, setDeptPhoneInputs] = useState<{ [deptId: number]: string }>({});
  const [deptPhoneErrors, setDeptPhoneErrors] = useState<{ [deptId: number]: string }>({});
  const { selectedEstablishment, setSelectedEstablishment } = useEstablishment();
  const { wsToken } = useAuth();
  const [tab, setTab] = useState(0);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [gates, setGates] = useState<Gate[]>([]);
  const [deptMappings, setDeptMappings] = useState<UserMapping[]>([]);
  const [gateMappings, setGateMappings] = useState<UserMapping[]>([]);
  const [deptInputs, setDeptInputs] = useState<{ [key: number]: string }>({});
  const [gateInputs, setGateInputs] = useState<{ [key: number]: string }>({});
  const [requestSent, setRequestSent] = useState<{ type: 'dept' | 'gate', idx: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch departments, gates, and mappings on mount (with establishment_id)
  useEffect(() => {
    if (!selectedEstablishment?.id || !wsToken) return;
    setLoading(true);
    setError('');
    const eid = selectedEstablishment.id;
    
    Promise.all([
      api.get(`/departments/${eid}`).then(res => res.json()),
      api.get(`/gates/${eid}`).then(res => res.json()),
      api.get(`/user_department_map?establishment_id=${eid}`).then(res => res.json()),
      api.get(`/user_gate_map?establishment_id=${eid}`).then(res => res.json()),
    ])
      .then(([departments, gates, deptMappings, gateMappings]) => {
        setDepartments(departments || []);
        setGates(gates || []);
        setDeptMappings(deptMappings || []);
        setGateMappings(gateMappings || []);
      })
      .catch((err) => {
        console.error('Failed to fetch mapping data:', err);
        setError(`Failed to fetch mapping data: ${err.message}`);
        // Set empty arrays to prevent map errors
        setDepartments([]);
        setGates([]);
        setDeptMappings([]);
        setGateMappings([]);
      })
      .finally(() => setLoading(false));
  }, [selectedEstablishment, wsToken]);

  // Helper: get users for department
  const getDeptUsers = (deptId: number) =>
    deptMappings.filter((m: UserMapping) => m.department_id === deptId && m.status === '2'); // Only show accepted

  // Helper: get user_id by phone (from mappings)
  const getUserIdByPhone = (phone: string) => {
    for (const mapping of deptMappings) {
      if (mapping.user_phone === phone && mapping.user_id) return mapping.user_id;
    }
    return null;
  };

  // Helper: get users for gate
  const getGateUsers = (gateId: number) =>
    gateMappings.filter((m: UserMapping) => m.gate_id === gateId);

  // Add user to department (status 1 = pending)
  const handleDeptUserAdd = async (deptIdx: number) => {
    const phone = deptInputs[deptIdx]?.trim();
    if (!phone || !selectedEstablishment?.id || !wsToken) return;
    setLoading(true);
    setError('');
    try {
      const deptId = departments[deptIdx].id;
      const res = await api.post('/user_department_map', {
        establishment_id: selectedEstablishment.id, 
        department_id: deptId, 
        user_phone: phone, 
        status: '1'
      }, {
        headers: { 
          'Authorization': `Bearer ${wsToken}`
        }
      });
      if (!res.ok) throw new Error('Failed to map user');
      setRequestSent({ type: 'dept', idx: deptIdx });
      setDeptInputs({ ...deptInputs, [deptIdx]: '' });
      // Refresh mappings
      const updated = await api.get(`/user_department_map?establishment_id=${selectedEstablishment.id}`).then(r => r.json());
      setDeptMappings(updated);
    } catch {
      setError('Failed to map user');
    } finally {
      setLoading(false);
      setTimeout(() => setRequestSent(null), 2000);
    }
  };

  // Add user to gate (status 1 = pending)
  const handleGateUserAdd = async (gateIdx: number) => {
    const phone = gateInputs[gateIdx]?.trim();
    if (!phone || !selectedEstablishment?.id || !wsToken) return;
    setLoading(true);
    setError('');
    try {
      const gateId = gates[gateIdx].id;
      const res = await api.post('/user_gate_map', {
        establishment_id: selectedEstablishment.id, 
        gate_id: gateId, 
        user_phone: phone, 
        status: '1'
      });
      if (!res.ok) throw new Error('Failed to map user');
      setRequestSent({ type: 'gate', idx: gateIdx });
      setGateInputs({ ...gateInputs, [gateIdx]: '' });
      // Refresh mappings
      const updated = await api.get(`/user_gate_map?establishment_id=${selectedEstablishment.id}`).then(r => r.json());
      setGateMappings(updated);
    } catch {
      setError('Failed to map user');
    } finally {
      setLoading(false);
      setTimeout(() => setRequestSent(null), 2000);
    }
  };

  // Stage user for removal from department (batch)
  const handleDeptUserDelete = (deptId: number, userId: number) => {
    setDeptRemoves(prev => ({
      ...prev,
      [deptId]: new Set([...(prev[deptId] || []), userId])
    }));
    // If user was staged for add, undo that
    setDeptAdds(prev => {
      const s = new Set([...(prev[deptId] || [])]);
      s.delete(userId);
      return { ...prev, [deptId]: s };
    });
  };

  // Delete mapping for gate
  const handleGateUserDelete = async (mappingId: number) => {
    if (!selectedEstablishment?.id || !wsToken) return;
    setLoading(true);
    setError('');
    try {
      await api.delete(`/user_gate_map/${mappingId}?establishment_id=${selectedEstablishment.id}`);
      // Refresh mappings
      const updated = await api.get(`/user_gate_map?establishment_id=${selectedEstablishment.id}`).then(r => r.json());
      setGateMappings(updated);
    } catch {
      setError('Failed to delete mapping');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 900, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
      Mappings
      </Typography>
       <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
         Selected Establishment ID: {selectedEstablishment?.id || 'None'}
       </Typography>
       <pre style={{background:'#f5f5f5',padding:'8px',borderRadius:'4px',fontSize:'12px'}}>
         selectedEstablishment: {JSON.stringify(selectedEstablishment, null, 2)}
       </pre>
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Departments" />
          <Tab label="Gates" />
        </Tabs>
      </Paper>
      {error && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'error.light', color: 'error.contrastText', borderRadius: 1 }}>
          <Typography>{error}</Typography>
        </Box>
      )}
      {tab === 0 && (
        <Box>
          {loading && (
            <Typography>Loading departments...</Typography>
          )}
          {!loading && departments.length === 0 && (
            <Typography>No departments found.</Typography>
          )}
          {departments.map((dept, i) => (
            <Paper key={dept.id} sx={{ mb: 3, p: 2 }}>
              <Typography variant="h6">{dept.name}</Typography>
              <List>
                {getDeptUsers(dept.id).map((mapping: UserMapping) => (
                  <ListItem key={mapping.id} secondaryAction={
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeptUserDelete(dept.id, mapping.user_id)}>
                      <RemoveCircleOutlineIcon color="error" />
                    </IconButton>
                  }>
                    <ListItemText
                      primary={mapping.user_phone}
                      secondary={
                        <Typography sx={{ color: statusColors[mapping.status] }}>
                          {statusLabels[mapping.status]}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <PhoneInput
  value={deptPhoneInputs[dept.id] || ''}
  onChange={v => setDeptPhoneInputs({ ...deptPhoneInputs, [dept.id]: v })}
  error={!!deptPhoneErrors[dept.id]}
  helperText={deptPhoneErrors[dept.id] || ''}
/>
<Button variant="contained" onClick={async () => {
  setDeptPhoneErrors(e => ({ ...e, [dept.id]: '' }));
  const phone = (deptPhoneInputs[dept.id] || '').trim();
  if (!phone) return setDeptPhoneErrors(e => ({ ...e, [dept.id]: 'Enter phone' }));
  // Validate phone exists
  setLoading(true);
  try {
    const res = await api.get(`/check-user-exists?phone=${encodeURIComponent(phone)}`);
    const data = await res.json();
    if (!data.exists || !data.user_id) {
      setDeptPhoneErrors(e => ({ ...e, [dept.id]: 'User not found' }));
      setLoading(false);
      return;
    }
    const userId = data.user_id;
    // Prevent duplicate
    if (getDeptUsers(dept.id).some(u => u.user_id === userId) || (deptAdds[dept.id]?.has(userId))) {
      setDeptPhoneErrors(e => ({ ...e, [dept.id]: 'User already added' }));
      setLoading(false);
      return;
    }
    setDeptAdds(prev => ({
      ...prev,
      [dept.id]: new Set([...(prev[dept.id] || []), userId])
    }));
    // If user was staged for removal, undo
    setDeptRemoves(prev => {
      const s = new Set([...(prev[dept.id] || [])]);
      s.delete(userId);
      return { ...prev, [dept.id]: s };
    });
    setDeptPhoneInputs(i => ({ ...i, [dept.id]: '' }));
  } catch {
    setDeptPhoneErrors(e => ({ ...e, [dept.id]: 'Error validating user' }));
  } finally {
    setLoading(false);
  }
}}>
  Send Request
</Button>
                {requestSent?.type === 'dept' && requestSent.idx === i && (
                  <Typography color="green" sx={{ ml: 2, alignSelf: 'center' }}>
                    Request sent!
                  </Typography>
                )}
              </Box>
            </Paper>
          ))}
        </Box>
      )}
      {tab === 1 && (
        <Box>
          {loading && (
            <Typography>Loading gates...</Typography>
          )}
          {!loading && gates.length === 0 && (
            <Typography>No gates found.</Typography>
          )}
          {gates.map((gate, i) => (
            <Paper key={gate.id} sx={{ mb: 3, p: 2 }}>
              <Typography variant="h6">{gate.name}</Typography>
              <List>
                {getGateUsers(gate.id).map((mapping: UserMapping) => (
                  <ListItem key={mapping.id} secondaryAction={
                    <IconButton edge="end" aria-label="delete" onClick={() => handleGateUserDelete(mapping.id)}>
                      <RemoveCircleOutlineIcon color="error" />
                    </IconButton>
                  }>
                    <ListItemText
                      primary={mapping.user_phone}
                      secondary={
                        <Typography sx={{ color: statusColors[mapping.status] }}>
                          {statusLabels[mapping.status]}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <TextField
                  label="User Phone"
                  value={gateInputs[i] || ''}
                  onChange={e => setGateInputs({ ...gateInputs, [i]: e.target.value })}
                  size="small"
                />
                <Button variant="contained" onClick={() => handleGateUserAdd(i)}>
                  Send Request
                </Button>
                {requestSent?.type === 'gate' && requestSent.idx === i && (
                  <Typography color="green" sx={{ ml: 2, alignSelf: 'center' }}>
                    Request sent!
                  </Typography>
                )}
              </Box>
            </Paper>
          ))}
        </Box>
      )}
      {tab === 0 && departments.length > 0 && (
        <Box sx={{ mt: 3, textAlign: 'right' }}>
          <Button
            variant="contained"
            color="primary"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              setError('');
              try {
                for (const dept of departments) {
                  const addArr = Array.from(deptAdds[dept.id] || []);
                  const removeArr = Array.from(deptRemoves[dept.id] || []);
                  if (addArr.length === 0 && removeArr.length === 0) continue;
                  await api.post('/user-department-map/batch-update', {
                    department_id: dept.id,
                    add: addArr,
                    remove: removeArr
                  }, {
                    headers: { 
                      'Authorization': `Bearer ${wsToken}`
                    }
                  });
                }
                // Refresh mappings
                const eid = selectedEstablishment.id;
                const updated = await api.get(`/user_department_map?establishment_id=${eid}`).then(r => r.json());
                setDeptMappings(updated);
                setDeptAdds({});
                setDeptRemoves({});
              } catch {
                setError('Failed to update mappings');
              } finally {
                setLoading(false);
              }
            }}
          >
            Update
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Mappings;
