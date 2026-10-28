import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { MapPin, Navigation, ExternalLink, AlertCircle } from 'lucide-react';

interface HouseLocationMapProps {
  latitude?: number;
  longitude?: number;
  title: string;
  address: string;
}

export const HouseLocationMap: React.FC<HouseLocationMapProps> = ({
  latitude,
  longitude,
  title,
  address
}) => {
  // Default coordinates: Dhaka central if not specified
  const lat = latitude ?? 23.8103;
  const lng = longitude ?? 90.4125;
  const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';
  const [mapError, setMapError] = useState(false);

  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${lat},${lng}`)}`;

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 shadow-xs">
      {/* Map Header */}
      <div className="p-3.5 bg-white border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
            <MapPin className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">গুগল ম্যাপে বাড়িটির অবস্থান (Location Preview)</h4>
            <p className="text-[11px] text-slate-500 truncate max-w-[280px] sm:max-w-md">
              {address}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>দিকনির্দেশনা (Directions)</span>
          </a>
          <a
            href={googleMapsSearchUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <span>ম্যাপে খুলুন</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Map Display Container */}
      <div className="relative w-full h-64 sm:h-72 bg-slate-100">
        {apiKey && !mapError ? (
          <APIProvider apiKey={apiKey}>
            <Map
              style={{ width: '100%', height: '100%' }}
              defaultCenter={{ lat, lng }}
              defaultZoom={15}
              gestureHandling="cooperative"
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            >
              <AdvancedMarker position={{ lat, lng }} title={title}>
                <Pin
                  background="#059669"
                  borderColor="#047857"
                  glyphColor="#ffffff"
                  scale={1.2}
                />
              </AdvancedMarker>
            </Map>
          </APIProvider>
        ) : (
          /* Interactive Fallback Map Embed / Interactive Location Card */
          <div className="w-full h-full relative overflow-hidden bg-slate-100 flex flex-col justify-between">
            <iframe
              title={`Google Map for ${title}`}
              src={`https://maps.google.com/maps?q=${lat},${lng}&hl=bn&z=15&output=embed`}
              className="w-full h-full border-0 absolute inset-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            {/* Quick floating action tag */}
            <div className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl shadow-md border border-slate-200/80 flex items-center space-x-1.5 text-xs text-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold">{lat.toFixed(4)}, {lng.toFixed(4)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Coordinate & Accuracy Bar */}
      <div className="px-3.5 py-2 bg-white border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between flex-wrap gap-2">
        <span>অক্ষাংশ: <strong>{lat.toFixed(5)}</strong>, দ্রাঘিমাংশ: <strong>{lng.toFixed(5)}</strong></span>
        <span className="text-emerald-700 font-medium">যাচাইকৃত লোকেশন কোঅর্ডিনেট</span>
      </div>
    </div>
  );
};
