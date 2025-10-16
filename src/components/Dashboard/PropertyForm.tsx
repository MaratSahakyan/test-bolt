import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Building2, Loader2, AlertCircle, CheckCircle, X } from 'lucide-react';

interface PropertyFormProps {
  onPropertyAdded?: () => void;
  onClose?: () => void;
}

type PropertyType = 'house' | 'apartment' | 'commercial' | 'land' | 'other';

export const PropertyForm = ({ onPropertyAdded, onClose }: PropertyFormProps) => {
  const { user } = useAuth();
  const [propertyName, setPropertyName] = useState('');
  const [address, setAddress] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('house');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: insertError } = await supabase.from('properties').insert({
        owner_id: user.id,
        property_name: propertyName,
        address: address,
        property_type: propertyType,
      });

      if (insertError) throw insertError;

      setSuccess(true);
      setPropertyName('');
      setAddress('');
      setPropertyType('house');

      if (onPropertyAdded) {
        onPropertyAdded();
      }

      setTimeout(() => {
        setSuccess(false);
        if (onClose) {
          onClose();
        }
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to add property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Add New Property</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">Property added successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="propertyName" className="block text-sm font-medium text-gray-700 mb-2">
            Property Name
          </label>
          <input
            id="propertyName"
            type="text"
            value={propertyName}
            onChange={(e) => setPropertyName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Sunset Villa"
            required
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="123 Main Street, City, State, ZIP"
            required
          />
        </div>

        <div>
          <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-2">
            Property Type
          </label>
          <select
            id="propertyType"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value as PropertyType)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="commercial">Commercial</option>
            <option value="land">Land</option>
            <option value="other">Other</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Adding Property...
            </>
          ) : (
            <>
              <Building2 className="w-5 h-5" />
              Add Property
            </>
          )}
        </button>
      </form>
    </div>
  );
};
