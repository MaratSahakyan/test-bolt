import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { PropertyForm } from './PropertyForm';
import { PropertyList } from './PropertyList';
import { DocumentUpload } from './DocumentUpload';
import { DocumentList } from './DocumentList';
import { Home, LogOut, Plus, User, Shield } from 'lucide-react';

interface HouseOwner {
  full_name: string;
  verification_status: string;
}

export const Dashboard = () => {
  const { user } = useAuth();
  const [owner, setOwner] = useState<HouseOwner | null>(null);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [propertyRefresh, setPropertyRefresh] = useState(0);
  const [documentRefresh, setDocumentRefresh] = useState(0);

  useEffect(() => {
    const loadOwnerProfile = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('house_owners')
        .select('full_name, verification_status')
        .eq('id', user.id)
        .maybeSingle();

      setOwner(data);
    };

    loadOwnerProfile();
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handlePropertyAdded = () => {
    setPropertyRefresh((prev) => prev + 1);
    setShowPropertyForm(false);
  };

  const handleUploadComplete = () => {
    setDocumentRefresh((prev) => prev + 1);
  };

  const getVerificationBadge = () => {
    if (!owner) return null;

    const statusConfig = {
      verified: { color: 'bg-green-100 text-green-800', text: 'Verified' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
    };

    const config = statusConfig[owner.verification_status as keyof typeof statusConfig];

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Shield className="w-3 h-3" />
        {config.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">PropertyHub</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{owner?.full_name || 'Loading...'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                {getVerificationBadge()}
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {owner?.full_name?.split(' ')[0]}!</h1>
          <p className="text-gray-600">Manage your properties and documents in one place</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Properties</h2>
              <button
                onClick={() => setShowPropertyForm(!showPropertyForm)}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Add Property"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {showPropertyForm && (
              <PropertyForm
                onPropertyAdded={handlePropertyAdded}
                onClose={() => setShowPropertyForm(false)}
              />
            )}

            <PropertyList
              onPropertySelect={setSelectedPropertyId}
              refreshTrigger={propertyRefresh}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedPropertyId ? 'Property Documents' : 'All Documents'}
            </h2>

            <DocumentUpload
              propertyId={selectedPropertyId}
              onUploadComplete={handleUploadComplete}
            />

            <DocumentList
              propertyId={selectedPropertyId}
              refreshTrigger={documentRefresh}
            />
          </div>
        </div>
      </main>
    </div>
  );
};
