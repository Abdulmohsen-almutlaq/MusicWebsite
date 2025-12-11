import React, { useEffect, useState } from 'react';
import { Check, X, Shield, User, Clock } from 'lucide-react';
import api from '../../utils/api';

const AdminView = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/users/pending-requests');
      setRequests(data);
    } catch (error) {
      console.error("Failed to fetch requests", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (requestId) => {
    try {
      await api.post('/users/approve-access', { requestId });
      // Remove from list locally
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (error) {
      console.error("Failed to approve", error);
      alert("Failed to approve request");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-brand-light">Loading requests...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <header className="mb-8 flex items-center gap-3">
        <div className="p-3 bg-brand-beige/10 rounded-full text-brand-beige">
          <Shield size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-brand-beige">Admin Dashboard</h1>
          <p className="text-brand-light">Manage upload access requests</p>
        </div>
      </header>

      {requests.length === 0 ? (
        <div className="bg-brand-medium/30 rounded-xl p-12 text-center border border-brand-light/10">
          <Check size={48} className="mx-auto text-green-500 mb-4" />
          <h3 className="text-xl font-bold text-brand-beige">All Caught Up!</h3>
          <p className="text-brand-light mt-2">There are no pending access requests.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map(request => (
            <div key={request.id} className="bg-brand-medium p-6 rounded-xl border border-brand-light/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-brand-dark flex items-center justify-center text-brand-beige font-bold">
                    {request.user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-beige text-lg">{request.user.username}</h3>
                    <p className="text-sm text-brand-light">{request.user.email}</p>
                  </div>
                </div>
                
                <div className="bg-brand-dark/50 p-4 rounded-lg mt-3 border border-brand-light/5">
                  <p className="text-sm text-brand-light italic">"{request.reason || 'No reason provided'}"</p>
                </div>
                
                <div className="flex items-center gap-2 mt-3 text-xs text-brand-light/60">
                  <Clock size={12} />
                  <span>Requested on {new Date(request.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Reject Button (Placeholder logic for now, maybe just delete request) */}
                <button 
                  className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                  onClick={() => alert("Rejection logic not implemented yet (Backend needs endpoint)")}
                >
                  <X size={18} />
                  Reject
                </button>
                
                <button 
                  className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold transition-colors flex items-center gap-2 shadow-lg shadow-green-900/20"
                  onClick={() => handleApprove(request.id)}
                >
                  <Check size={18} />
                  Approve Access
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminView;
