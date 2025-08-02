import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEstablishment } from '../contexts/EstablishmentContext';
import { api } from '../utils/api';
import { PhoneInput } from './PhoneInput';

interface Department {
  id: number;
  name: string;
  establishment_id: number;
}

interface InviteDepartmentUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteSent?: () => void;
  preSelectedDepartmentId?: number;
}

const InviteDepartmentUserModal: React.FC<InviteDepartmentUserModalProps> = ({
  isOpen,
  onClose,
  onInviteSent,
  preSelectedDepartmentId,
}) => {
  const { wsToken } = useAuth();
  const { selectedEstablishment } = useEstablishment();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch departments when modal opens
  useEffect(() => {
    if (isOpen && selectedEstablishment?.id) {
      fetchDepartments();
    }
  }, [isOpen, selectedEstablishment?.id]);

  // Set pre-selected department when modal opens
  useEffect(() => {
    if (isOpen && preSelectedDepartmentId) {
      setSelectedDepartmentId(preSelectedDepartmentId);
    }
  }, [isOpen, preSelectedDepartmentId]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPhoneNumber('');
      setSelectedDepartmentId(null);
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  const fetchDepartments = async () => {
    try {
      const response = await api.get(`/departments/${selectedEstablishment?.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      } else {
        console.error('Failed to fetch departments');
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim() || !selectedDepartmentId) {
      setError('Please enter a phone number and select a department');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/requests/invite-department', {
        userPhone: phoneNumber,
        departmentId: selectedDepartmentId,
      });

      if (response.ok) {
        setSuccess(true);
        onInviteSent?.();
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to send invitation');
      }
    } catch (err) {
      setError('Failed to send invitation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Invite User to Department
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Send an invitation to a user to manage this department
          </p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Error/Success Messages */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✅ Invitation sent successfully!
              </p>
            </div>
          )}

          {/* Phone Number Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Phone Number *
            </label>
            <PhoneInput
              value={phoneNumber}
              onChange={setPhoneNumber}
            />
          </div>

          {/* Department Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department *
            </label>
            <select
              value={selectedDepartmentId || ''}
              onChange={(e) => setSelectedDepartmentId(Number(e.target.value) || null)}
              disabled={loading || departments.length === 0}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select a department</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !phoneNumber.trim() || !selectedDepartmentId}
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                'Send Invitation'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteDepartmentUserModal;