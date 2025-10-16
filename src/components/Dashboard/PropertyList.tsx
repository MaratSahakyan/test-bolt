import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Building2, MapPin, Loader2, AlertCircle } from 'lucide-react';

interface Property {
  id: string;
  property_name: string;
  address: string;
  property_type: string;
  created_at: string;
}

interface PropertyListProps {
  onPropertySelect?: (propertyId: string) => void;
  refreshTrigger?: number;
}

export const PropertyList = ({ onPropertySelect, refreshTrigger }: PropertyListProps) => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  const loadProperties = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setProperties(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, [user, refreshTrigger]);

  const handlePropertyClick = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    if (onPropertySelect) {
      onPropertySelect(propertyId);
    }
  };

  const formatPropertyType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        My Properties ({properties.length})
      </h3>

      {properties.length === 0 ? (
        <div className="text-center py-8">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No properties added yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {properties.map((property) => (
            <button
              key={property.id}
              onClick={() => handlePropertyClick(property.id)}
              className={`w-full text-left p-4 border rounded-lg transition-all ${
                selectedPropertyId === property.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">
                    {property.property_name}
                  </h4>
                  <div className="flex items-start gap-2 text-xs text-gray-600 mb-2">
                    <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{property.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {formatPropertyType(property.property_type)}
                    </span>
                    <span className="text-xs text-gray-500">
                      Added {new Date(property.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
