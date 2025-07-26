import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import CheckIn from './CheckIn';
import CheckOut from './CheckOut';
import CheckedOut from './CheckedOut';

const tabs = [
  { label: 'Check-In', component: <CheckIn /> },
  { label: 'Check-Out', component: <CheckOut /> },
  { label: 'Checked-Out', component: <CheckedOut /> },
];

const VisGateEntry: React.FC = () => {
  const location = useLocation();
  const establishment = location.state?.establishment || 'Establishment';
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">{establishment}</h2>
      <div className="flex space-x-2 mb-6 justify-center">
        {tabs.map((tab, idx) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(idx)}
            className={`px-6 py-2 rounded-t-lg font-semibold border-b-2 transition-colors ${activeTab === idx ? "bg-blue-600 text-white border-blue-600" : "bg-blue-100 text-blue-700 border-transparent hover:bg-blue-200"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-b-lg shadow p-6 border-t-0">
        {tabs[activeTab].component}
      </div>
    </div>
  );
};

export default VisGateEntry;
