import React, { useState, useMemo } from 'react';
import { StationData } from '../types';
import { CheckCircle2, ShieldAlert } from 'lucide-react';

interface CitizenComplianceProps {
  stations: StationData[];
  onSelectStation: (id: string) => void;
}

export const CitizenCompliance: React.FC<CitizenComplianceProps> = ({
  stations,
  onSelectStation,
}) => {
  // We can filter between 'all', 'perfect', 'under'
  const [activeSegmentFilter, setActiveSegmentFilter] = useState<'all' | 'perfect' | 'under'>('all');

  // Compute stats
  const perfectStations = useMemo(() => stations.filter((s) => s.citizenPortal === 100), [stations]);
  const underperformingStations = useMemo(() => stations.filter((s) => s.citizenPortal < 100), [stations]);

  const total = stations.length;
  const perfectCount = perfectStations.length;
  const underCount = underperformingStations.length;

  const perfectPct = total > 0 ? (perfectCount / total) * 100 : 0;
  const underPct = total > 0 ? (underCount / total) * 100 : 0;

  // Render SVG Donut Chart segment details
  // SVG size is 120, center (60,60), radius 40, strokeWidth 12, circumference = 2 * PI * r = 251.3
  const r = 40;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * r;

  // Let's draw standard stroke dasharray offset values
  const perfectDash = (perfectCount / total) * circumference;
  const perfectOffset = 0;

  const underDash = (underCount / total) * circumference;
  const underOffset = -perfectDash;

  // List to display under active segment filter
  const listToDisplay = useMemo(() => {
    if (activeSegmentFilter === 'perfect') return perfectStations;
    if (activeSegmentFilter === 'under') return underperformingStations;
    return underperformingStations; // Default to underperforming to highlight the gaps immediately as requested!
  }, [activeSegmentFilter, perfectStations, underperformingStations]);

  return (
    <div id="citizen-portal-compliance" className="border border-[#1D1818]/15 bg-[#F8F7F4] p-5 flex flex-col h-full justify-between relative">
      <div>
        <div className="flex justify-between items-baseline mb-2">
          <h3 className="text-sm font-bold font-display uppercase tracking-tight text-[#1D1818]">
            Citizen Portal Compliance
          </h3>
          <span className="text-[9px] text-[#1D1818]/50 uppercase font-mono">Service Gaps</span>
        </div>
        <p className="text-[10px] text-[#1D1818]/60 mb-4 font-mono leading-tight">
          Click donut segments to toggle between perfect compliance and critical citizen-facing gaps.
        </p>

        {/* Donut and Statistics Row */}
        <div className="flex items-center justify-around py-2 border-b border-[#1D1818]/10 pb-4 mb-4">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg width="100%" height="100%" viewBox="0 0 120 120" className="transform -rotate-90 select-none">
              {/* Perfect compliance circle */}
              <circle
                cx="60"
                cy="60"
                r={r}
                fill="transparent"
                stroke="#2EC4B6"
                strokeWidth={strokeWidth}
                strokeDasharray={`${perfectDash} ${circumference}`}
                strokeDashoffset={perfectOffset}
                className={`cursor-pointer transition-all hover:opacity-85 ${
                  activeSegmentFilter === 'perfect' ? 'stroke-[18]' : ''
                }`}
                onClick={() => setActiveSegmentFilter(activeSegmentFilter === 'perfect' ? 'all' : 'perfect')}
              />

              {/* Underperforming segment */}
              {underCount > 0 && (
                <circle
                  cx="60"
                  cy="60"
                  r={r}
                  fill="transparent"
                  stroke="#E84855"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${underDash} ${circumference}`}
                  strokeDashoffset={underOffset}
                  className={`cursor-pointer transition-all hover:opacity-85 ${
                    activeSegmentFilter === 'under' ? 'stroke-[18]' : ''
                  }`}
                  onClick={() => setActiveSegmentFilter(activeSegmentFilter === 'under' ? 'all' : 'under')}
                />
              )}
            </svg>

            {/* Middle percentage display */}
            <div className="absolute flex flex-col items-center justify-center font-mono">
              <span className="text-sm font-bold text-[#1D1818] leading-none">
                {perfectPct.toFixed(0)}%
              </span>
              <span className="text-[6.5px] text-[#1D1818]/50 uppercase font-bold tracking-tight">
                COMPLIANT
              </span>
            </div>
          </div>

          {/* Interactive Legend with counts */}
          <div className="space-y-1.5 font-mono text-[9px]">
            <div
              className={`flex items-center space-x-2 p-1.5 cursor-pointer border ${
                activeSegmentFilter === 'perfect'
                  ? 'bg-[#2EC4B6]/10 border-[#2EC4B6]'
                  : 'border-transparent hover:bg-black/3'
              }`}
              onClick={() => setActiveSegmentFilter('perfect')}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2EC4B6]" />
              <div className="flex flex-col">
                <span className="font-bold text-[#1D1818]">100% PERFECT</span>
                <span className="text-[7.5px] text-[#1D1818]/60">{perfectCount} Stations ({perfectPct.toFixed(1)}%)</span>
              </div>
            </div>

            <div
              className={`flex items-center space-x-2 p-1.5 cursor-pointer border ${
                activeSegmentFilter === 'under'
                  ? 'bg-[#E84855]/10 border-[#E84855]'
                  : 'border-transparent hover:bg-black/3'
              }`}
              onClick={() => setActiveSegmentFilter('under')}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-[#E84855]" />
              <div className="flex flex-col">
                <span className="font-bold text-[#1D1818]">BELOW 100%</span>
                <span className="text-[7.5px] text-[#1D1818]/60">{underCount} Stations ({underPct.toFixed(1)}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stations List displaying the filtered result */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[8px] font-bold text-[#1D1818]/70 uppercase tracking-wider font-mono">
              {activeSegmentFilter === 'perfect' ? 'Perfect Compliance Stations' : 'Gaps Needing Remediation'}
            </span>
            <span className="text-[8px] font-bold text-red-500 font-mono">
              {listToDisplay.length} listed
            </span>
          </div>

          <div className="max-h-24 overflow-y-auto border border-[#1D1818]/10 bg-white font-mono text-[9px] divide-y divide-[#1D1818]/5">
            {listToDisplay.map((s) => (
              <div
                key={s.id}
                className="p-1.5 hover:bg-neutral-50 flex justify-between items-center cursor-pointer transition-colors"
                onClick={() => onSelectStation(s.id)}
              >
                <div className="flex items-center space-x-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${s.citizenPortal === 100 ? 'bg-[#2EC4B6]' : 'bg-[#E84855]'}`} />
                  <span className="uppercase font-bold text-[#1D1818]">{s.name}</span>
                </div>
                <span className={`font-bold ${s.citizenPortal === 100 ? 'text-[#2EC4B6]' : 'text-[#E84855]'}`}>
                  {s.citizenPortal}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 text-[8px] text-[#1D1818]/45 font-mono italic">
        * Gap stations: Vontimitta (90.9%), Mannur UPS (94.1%), Pulivendula UPS (97.8%).
      </div>
    </div>
  );
};
