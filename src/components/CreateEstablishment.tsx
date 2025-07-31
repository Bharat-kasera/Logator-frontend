import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Paper,
  CircularProgress,
  Avatar,
  Stack,
  Alert
} from "@mui/material";

interface CreateEstablishmentProps {
  onCreated: () => void;
  userId: string;
  plan: string;
  token: string;
}

const CreateEstablishment: React.FC<CreateEstablishmentProps> = ({ onCreated, userId, plan, token }) => {
  const [name, setName] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [pincode, setPincode] = useState("");
  const [gst, setGst] = useState("");
  const [pan, setPan] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoBase64, setLogoBase64] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setLogoFile(file || null);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    // Plan logic:
    // if user plan is "1", establishment plan is "1"
    // if user plan is "3", establishment plan is "2"
    let estPlan = plan;
    if (plan === "1") estPlan = "1";
    else if (plan === "3") estPlan = "2";
    const payload = {
      user_id: userId,
      name,
      address1,
      address2,
      pincode,
      gst,
      pan,
      logo: logoBase64,
      plan: estPlan,
    };
    try {
      const res = await fetch("/api/establishments/create-establishment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // Handle 401 Unauthorized (token expired)
      if (res.status === 401) {
        localStorage.removeItem("wsToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        throw new Error("Session expired. Please log in again.");
      }
      if (!res.ok) {
        // Try to parse JSON error, fallback to text, fallback to generic
        let errMsg = "Failed to create establishment";
        try {
          const errData = await res.json();
          errMsg = errData.message || errMsg;
        } catch {
          try {
            const errText = await res.text();
            errMsg = errText || errMsg;
          } catch {}
        }
        throw new Error(errMsg);
      }
      setMessage("✅ Establishment created successfully!");
      setName("");
      setAddress1("");
      setAddress2("");
      setPincode("");
      setGst("");
      setPan("");
      setLogoFile(null);
      setLogoBase64("");
      onCreated();
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box mt={4}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField label="Name" value={name} onChange={e => setName(e.target.value)} required />
            <TextField label="Address 1" value={address1} onChange={e => setAddress1(e.target.value)} required />
            <TextField label="Address 2" value={address2} onChange={e => setAddress2(e.target.value)} />
            <TextField label="Pincode" value={pincode} onChange={e => setPincode(e.target.value)} required />
            <TextField label="GST Number" value={gst} onChange={e => setGst(e.target.value)} />
            <TextField label="PAN Number" value={pan} onChange={e => setPan(e.target.value)} />
            <Box display="flex" alignItems="center">
              <Button variant="contained" component="label">
                Upload Logo
                <input type="file" accept="image/*" hidden onChange={handleLogoChange} />
              </Button>
              {logoBase64 && (
                <Avatar src={logoBase64} alt="Logo Preview" sx={{ width: 64, height: 64, ml: 2, display: "inline-flex", verticalAlign: "middle" }} />
              )}
            </Box>
            <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} size="large" sx={{ fontWeight: 600 }} startIcon={loading ? <CircularProgress size={20} /> : null}>
              {loading ? "Creating..." : "Create Establishment"}
            </Button>
            {message && <Alert severity={message.startsWith("✅") ? "success" : "error"}>{message}</Alert>}
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateEstablishment;