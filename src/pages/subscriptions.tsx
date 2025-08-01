import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

const Subscriptions: React.FC = () => {
  const { user, wsToken } = useAuth();
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState(user?.plan || 1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const plans = [
    {
      id: 1,
      name: 'Basic',
      price: 'Free',
      description: 'Perfect for small businesses',
      features: [
        '1 Establishment',
        '1 Department per establishment',
        '2 Gates per establishment',
        '100 Visitors per month',
        'Basic Analytics',
      ],
      color: 'bg-gray-50 border-gray-200',
      buttonColor: 'bg-gray-600 hover:bg-gray-700',
    },
    {
      id: 2,
      name: 'Pro',
      price: '$29/month',
      description: 'For growing businesses',
      features: [
        '1 Establishment',
        '10 Departments',
        '10 Gates',
        '1,000 Visitors per month',
        'Advanced Analytics',
        'Custom Branding',
        'Priority Support',
      ],
      color: 'bg-orange-50 border-orange-200',
      buttonColor: 'bg-orange-500 hover:bg-orange-600',
      popular: true,
    },
    {
      id: 3,
      name: 'Enterprise',
      price: '$99/month',
      description: 'For large organizations',
      features: [
        '10 Establishments',
        '10 Departments per establishment',
        '10 Gates per establishment',
        'Unlimited Visitors',
        'Enterprise Analytics',
        'Custom Integrations',
        'Dedicated Support',
        'SLA Guarantee',
      ],
      color: 'bg-blue-50 border-blue-200',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
    },
  ];

  const handlePlanChange = async (planId: number) => {
    setLoading(true);
    setMessage('');

    try {
      // For beta testing - manual plan change
      // In production, this would integrate with a payment gateway
      
      if (planId > 1) {
        // Simulate payment gateway integration
        setMessage('⚠️ Payment gateway integration will be activated for production. For beta testing, contact admin to change plans.');
        setLoading(false);
        return;
      }

      // For downgrading to basic, we can allow it for testing
      const response = await api.post('/update-plan', { plan: planId }, {
        headers: {
          'Authorization': `Bearer ${wsToken}`,
        },
      });

      if (response.ok) {
        setCurrentPlan(planId);
        setMessage('✅ Plan updated successfully!');
        // Update user context would go here
      } else {
        throw new Error('Failed to update plan');
      }
    } catch (error: any) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <span onClick={() => navigate('/dashboard')} className="ml-3 text-xl font-bold text-gray-900 cursor-pointer">Logator.io</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-orange-600 hover:text-orange-700 font-medium transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your <span className="text-orange-500">Plan</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Select the perfect plan for your visitor management needs
          </p>
          
          {/* Current Plan Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium mb-8">
            Current Plan: {plans.find(p => p.id === currentPlan)?.name}
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`max-w-2xl mx-auto mb-8 p-4 rounded-lg ${
            message.startsWith('✅') 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : message.startsWith('⚠️')
              ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-8 shadow-xl border-2 ${plan.color} ${
                plan.popular ? 'ring-2 ring-orange-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.price !== 'Free' && <span className="text-gray-600">/month</span>}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePlanChange(plan.id)}
                disabled={loading || currentPlan === plan.id}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  currentPlan === plan.id
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : `${plan.buttonColor} text-white`
                } disabled:opacity-50`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : currentPlan === plan.id ? (
                  'Current Plan'
                ) : (
                  'Select Plan'
                )}
              </button>
            </div>
          ))}
        </div>


        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Can I change my plan anytime?</h3>
              <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-2">What happens if I exceed my visitor limit?</h3>
              <p className="text-gray-600">You'll receive notifications as you approach your limit. We'll work with you to find the best solution for your needs.</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Is there a setup fee?</h3>
              <p className="text-gray-600">No setup fees! You only pay the monthly subscription cost for your chosen plan.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Subscriptions; 