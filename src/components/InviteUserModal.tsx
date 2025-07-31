import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEstablishment } from '../contexts/EstablishmentContext';
import { api } from '../utils/api';
import PhoneInput from './PhoneInput';

interface Gate {
  id: number;
  name: string;
  establishment_id: number;
}

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteSent?: () => void;
  preSelectedGateId?: number;
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({
  isOpen,
  onClose,
  onInviteSent,
  preSelectedGateId,
}) => {
  const { wsToken } = useAuth();
  const { selectedEstablishment } = useEstablishment();
  const [gates, setGates] = useState<Gate[]>([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedGateId, setSelectedGateId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch gates when modal opens
  useEffect(() => {
    if (isOpen && selectedEstablishment?.id) {
      fetchGates();
    }
  }, [isOpen, selectedEstablishment?.id]);

  // Set pre-selected gate when modal opens
  useEffect(() => {
    if (isOpen && preSelectedGateId) {
      setSelectedGateId(preSelectedGateId);
    }
  }, [isOpen, preSelectedGateId]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPhoneNumber('');
      setSelectedGateId(null);
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  const fetchGates = async () => {
    try {
      const response = await fetch(`/api/gates/${selectedEstablishment?.id}`, {
        headers: {
          'Authorization': `Bearer ${wsToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGates(data);
      } else {
        setError('Failed to fetch gates');
      }
    } catch (err) {
      console.error('Error fetching gates:', err);
      setError('Failed to fetch gates');
    }
  };

  const validatePhone = (phone: string): boolean => {
    // Basic validation - should have country code and digits
    const phoneRegex = /^\+\d{1,4}\s?\d{6,14}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phoneNumber.trim()) {
      setError('Phone number is required');
      return;
    }

    if (!validatePhone(phoneNumber)) {
      setError('Please enter a valid phone number with country code');
      return;
    }

    if (!selectedGateId) {
      setError('Please select a gate');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/requests/invite', {
        userPhone: phoneNumber.trim(),
        gateId: selectedGateId,
      }, {
        headers: {
          'Authorization': `Bearer ${wsToken}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          onInviteSent?.();
        }, 1500);
      } else {
        setError(data.message || 'Failed to send invitation');
      }
    } catch (err) {
      console.error('Error sending invitation:', err);
      setError('Failed to send invitation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">Invite User as Receptionist</h2>

        {success ? (
          <div className="text-center py-4">
            <div className="text-green-600 text-lg mb-2">✓ Invitation sent successfully!</div>
            <p className="text-gray-600">The user will receive a notification about your invitation.</p>
          </div>
        ) : (
          <form onSubmit={handleInvite} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                User Phone Number
              </label>
              <PhoneInput
                value={phoneNumber}
                onChange={setPhoneNumber}
                error={!!error && error.includes('phone')}
                helperText="Enter the phone number of the user you want to invite"
                placeholder="+1 555-123-4567"
              />
            </div>

            <div>
              <label htmlFor="gate" className="block text-sm font-medium text-gray-700 mb-1">
                Select Gate
              </label>
              <select
                id="gate"
                value={selectedGateId || ''}
                onChange={(e) => setSelectedGateId(Number(e.target.value) || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a gate...</option>
                {gates.map((gate) => (
                  <option key={gate.id} value={gate.id}>
                    {gate.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default InviteUserModal;