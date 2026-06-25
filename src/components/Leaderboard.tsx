import React, { useState } from 'react';
import { StationData, PARAMETERS } from '../types';

interface LeaderboardProps {
  allStations: StationData[];
  selectedSdpo: string;
  onSelectSdpo: (sdpo: string) => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  allStations,
  selectedSdpo,
  onSelectSdpo,
}) => {
  const [hoveredSdpo, setHoveredSdpo] = useState<string | null>(null);

  // Compute stats for the 6 SDPOs
  const sdpoData = React.useMemo(() => {
    const map: Record<string, { sum: number; count: number; paramSums: Record<string, number> }> = {};
    
    allStations.forEach(s => {
      if (!map[s.sdpo]) {
        map[s.sdpo] = {
          sum: 0,
          count: 0,
          paramSums: {}
        };
        PARAMETERS.forEach(p => {
          map[s.sdpo].paramSums[p.key] = 0;
        });
      }
      
      map[s.sdpo].sum += s.compositeScore;
      map[s.sdpo].count += 1;
      
      PARAMETERS.forEach(p => {
        map[s.sdpo].paramSums[p.key] += (s[p.key as keyof StationData] as number);
      });
    });

    return Object.entries(map).map(([name, { sum, count, paramSums }]) => {
      const avg = parseFloat((sum / count).toFixed(1));
      const paramAverages: Record<string, number> = {};
      PARAMETERS.forEach(p => {
        paramAverages[p.key] = parseFloat((paramSums[p.key] / count).toFixed(1));
      });

      return {
        name,
        avg,
        count,
        paramAverages
      };
    }).sort((a, b) => b.avg - a.avg); // Ranked descending
  }, [allStations]);

  // Apply colors to top 2 (green), middle 2 (amber), bottom 2 (red)
  const getSdpoColor = (index: number, isSelected: boolean) => {
    if (index < 2) return isSelected ? 'bg-[#2EC4B6]' : 'bg-[#2EC4B6]/85';
    if (index < 4) return isSelected ? 'bg-[#FF9F1C]' : 'bg-[#FF9F1C]/85';
    return isSelected ? 'bg-[#E84855]' : 'bg-[#E84855]/85';
  };

  const getSdpoBorderColor = (index: number) => {
    if (index < 2) return 'border-[#2EC4B6]';
    if (index < 4) return 'border-[#FF9F1C]';
    return 'border-[#E84855]';
  };

  return (
    <div id="subdivision-leaderboard" className="border border-[#1D1818]/15 bg-white p-5 flex flex-col h-full justify-between relative">
      <div>
        <div className="flex justify-between items-baseline mb-1">
          <h3 className="text-sm font-bold font-display uppercase tracking-tight text-[#1D1818]">
            Sub-Division Leaderboard
          </h3>
          <span className="text-[9px] text-[#1D1818]/50 uppercase font-mono">Ranked Average Score</span>
        </div>
        <p className="text-[10px] text-[#1D1818]/60 mb-4 font-mono leading-relaxed">
          Click on any division bar below to filter the entire command center dashboard to that SDPO.
        </p>

        <div className="space-y-4">
          {sdpoData.map((sdpo, index) => {
            const isSelected = selectedSdpo === sdpo.name || selectedSdpo === 'All';
            const widthPct = Math.min(Math.max(sdpo.avg, 20), 100);

            return (
              <div
                key={sdpo.name}
                className={`relative group cursor-pointer p-2 transition-all border ${
                  selectedSdpo === sdpo.name
                    ? 'border-[#1D1818] bg-black/5'
                    : 'border-transparent hover:bg-black/3'
                }`}
                onClick={() => onSelectSdpo(selectedSdpo === sdpo.name ? 'All' : sdpo.name)}
                onMouseEnter={() => setHoveredSdpo(sdpo.name)}
                onMouseLeave={() => setHoveredSdpo(null)}
              >
                <div className="flex justify-between text-xs font-bold font-mono mb-1 text-[#1D1818]">
                  <div className="flex items-center space-x-2">
                    <span className="opacity-50 text-[10px]">#{index + 1}</span>
                    <span className="uppercase">{sdpo.name}</span>
                    <span className="text-[9px] px-1 bg-[#1D1818]/5 font-normal text-[#1D1818]/70">
                      {sdpo.count} Stations
                    </span>
                  </div>
                  <span className="font-bold">{sdpo.avg}%</span>
                </div>

                {/* Progress bar container */}
                <div className="w-full h-3 bg-[#1D1818]/5 border border-[#1D1818]/10 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${getSdpoColor(index, isSelected)}`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>

                {/* Contribution Tooltip (visible on hover) */}
                {hoveredSdpo === sdpo.name && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-[#1D1818] text-[#F8F7F4] text-[9px] p-3 z-30 font-mono shadow-md border border-[#F8F7F4]/10 space-y-1 max-w-sm">
                    <div className="text-[10px] border-b border-[#F8F7F4]/20 pb-1 mb-1 font-bold uppercase flex justify-between">
                      <span>{sdpo.name} Performance Profile</span>
                      <span className="text-red-400">{sdpo.avg}% Avg</span>
                    </div>
                    {PARAMETERS.map((p) => (
                      <div key={p.key} className="flex justify-between items-center">
                        <span className="text-[#F8F7F4]/70">{p.label}:</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold">{sdpo.paramAverages[p.key]}%</span>
                        </div>
                      </div>
                    ))}
                    <div className="text-[8px] text-yellow-400/80 pt-1 border-t border-[#F8F7F4]/10 italic">
                      Weighted Contribution: Σ(Score × Weight)
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#1D1818]/10 flex justify-between text-[10px] font-mono text-[#1D1818]/50">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2.5 h-2.5 bg-[#2EC4B6]" />
          <span>Top Performance</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2.5 h-2.5 bg-[#FF9F1C]" />
          <span>Mid Tier</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2.5 h-2.5 bg-[#E84855]" />
          <span>Laggards</span>
        </div>
      </div>
    </div>
  );
};
