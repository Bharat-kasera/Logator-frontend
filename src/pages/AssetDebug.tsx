import React, { useState } from "react";
import { useAuth } from '../contexts/AuthContext';

const AssetDebug: React.FC = () => {
  const [userId, setUserId] = useState("");
  const [establishment, setEstablishment] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rawResponse, setRawResponse] = useState<string>("");

  // Get auth context
  const auth = useAuth();
  const user = auth?.user;
  const wsToken = auth?.wsToken;
  const isAuthenticated = auth?.isAuthenticated;

  // Fetch establishment from real backend
  const fetchEstablishment = async () => {
    setLoading(true);
    setError("");
    setEstablishment(null);
    setRawResponse("");
    try {
      const res = await fetch(`/api/establishments/by-user/${userId}`, {
        headers: {
          'Authorization': wsToken ? `Bearer ${wsToken}` : '',
        },
      });
      let text = await res.text();
      setRawResponse(text);
      try {
        const data = JSON.parse(text);
        setEstablishment(data);
        if (!res.ok) {
          throw new Error(data.message || "Unknown error");
        }
      } catch (jsonErr) {
        setError("Response is not valid JSON (see raw response below)");
      }
    } catch (e: any) {
      setError(e.message || "Failed to fetch establishment details.");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", padding: 24, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>Asset Debug</h2>
      <div style={{ marginBottom: 16, background: '#f5f5f5', padding: 10, borderRadius: 4 }}>
        <strong>Frontend Auth State:</strong>
        <pre style={{ fontSize: 13, margin: 0 }}>{JSON.stringify({ isAuthenticated, wsToken, user }, null, 2)}</pre>
      </div>
      <div style={{ marginBottom: 12 }}>
        <input
          type="text"
          placeholder="Enter User ID"
          value={userId}
          onChange={e => setUserId(e.target.value)}
          style={{ width: "100%", padding: 8, fontSize: 16 }}
        />
      </div>
      <button onClick={fetchEstablishment} disabled={!userId || loading} style={{ padding: "8px 16px", fontSize: 16 }}>
        {loading ? "Loading..." : "Fetch Establishment"}
      </button>
      {error && <div style={{ color: "red", marginTop: 12 }}>{error}</div>}
      {establishment && (
        <div style={{ marginTop: 24 }}>
          <h3>Establishment Details</h3>
          <pre style={{ background: "#f5f5f5", padding: 12, borderRadius: 4 }}>
            {JSON.stringify(establishment, null, 2)}
          </pre>
        </div>
      )}
      {rawResponse && (
        <div style={{ marginTop: 24 }}>
          <h4>Raw Backend Response</h4>
          <pre style={{ background: '#eee', padding: 10, borderRadius: 4, fontSize: 13 }}>{rawResponse}</pre>
        </div>
      )}
    </div>
  );
};

export default AssetDebug;
