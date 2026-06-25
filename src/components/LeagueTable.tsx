import React, { useMemo } from 'react';
import { StationData } from '../types';
import { Medal, ShieldAlert, Award, Star } from 'lucide-react';

interface LeagueTableProps {
  stations: StationData[];
  onSelectStation: (id: string) => void;
  selectedStationId: string | null;
}

export const LeagueTable: React.FC<LeagueTableProps> = ({
  stations,
  onSelectStation,
  selectedStationId,
}) => {
  // Sort entire list of active stations descending
  const sorted = useMemo(() => {
    return [...stations].sort((a, b) => b.compositeScore - a.compositeScore);
  }, [stations]);

  // Extract Top 5 & Bottom 5
  const top5 = useMemo(() => sorted.slice(0, 5), [sorted]);
  const bottom5 = useMemo(() => {
    if (sorted.length <= 5) return [];
    return sorted.slice(-5).reverse(); // show worst first (reverse order)
  }, [sorted]);

  return (
    <div id="league-table-panels" className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Top 5 Performers Panel */}
      <div className="border border-[#1D1818]/15 bg-[#F8F7F4] p-4 flex flex-col justify-between relative">
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <h3 className="text-xs font-bold font-display uppercase tracking-tight text-[#1D1818] flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#2EC4B6]" />
              Top 5 Performers (Leaderboard)
            </h3>
            <span className="text-[8px] text-[#2EC4B6] uppercase font-mono font-bold">Excellent</span>
          </div>
          <p className="text-[10px] text-[#1D1818]/60 mb-3 font-mono">
            Stations leading the district in smart policing standards.
          </p>

          <div className="divide-y divide-[#1D1818]/10 border border-[#1D1818]/10 bg-white">
            {top5.map((s, idx) => {
              const isSelected = selectedStationId === s.id;
              return (
                <div
                  key={s.id}
                  className={`p-2 flex justify-between items-center cursor-pointer font-mono text-[9px] transition-colors hover:bg-neutral-50 ${
                    isSelected ? 'bg-[#2EC4B6]/5 text-[#2EC4B6]' : 'text-[#1D1818]'
                  }`}
                  onClick={() => onSelectStation(s.id)}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span className="font-bold text-[#2EC4B6] w-3 text-center">#{idx + 1}</span>
                    <div className="truncate">
                      <span className="uppercase font-bold block truncate">{s.name}</span>
                      <span className="text-[7px] text-neutral-500 font-normal uppercase">{s.sdpo}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="font-bold text-[10px] text-neutral-800">{s.compositeScore}%</span>
                    <Star className="w-3 h-3 text-[#2EC4B6] fill-[#2EC4B6]" />
                  </div>
                </div>
              );
            })}
            {top5.length === 0 && (
              <div className="p-4 text-center text-neutral-400 italic">No stations available.</div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom 5 Performers Panel */}
      <div className="border border-[#1D1818]/15 bg-[#F8F7F4] p-4 flex flex-col justify-between border-l-4 border-l-[#E84855] relative">
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <h3 className="text-xs font-bold font-display uppercase tracking-tight text-red-700 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-[#E84855]" />
              Bottom 5 Laggards (Red Alerts)
            </h3>
            <span className="text-[8px] text-[#E84855] uppercase font-mono font-bold">Deficient</span>
          </div>
          <p className="text-[10px] text-[#1D1818]/60 mb-3 font-mono">
            Stations requiring urgent attention and immediate compliance intervention.
          </p>

          <div className="divide-y divide-[#1D1818]/10 border border-[#1D1818]/10 bg-white">
            {bottom5.map((s, idx) => {
              const isSelected = selectedStationId === s.id;
              return (
                <div
                  key={s.id}
                  className={`p-2 flex justify-between items-center cursor-pointer font-mono text-[9px] transition-colors hover:bg-neutral-50 ${
                    isSelected ? 'bg-[#E84855]/5 text-[#E84855]' : 'text-[#1D1818]'
                  }`}
                  onClick={() => onSelectStation(s.id)}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span className="font-bold text-[#E84855] w-3 text-center">#{idx + 1}</span>
                    <div className="truncate">
                      <span className="uppercase font-bold block truncate">{s.name}</span>
                      <span className="text-[7px] text-neutral-500 font-normal uppercase">{s.sdpo}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="font-bold text-[10px] text-[#E84855]">{s.compositeScore}%</span>
                    <Medal className="w-3 h-3 text-[#E84855] fill-[#E84855]/20" />
                  </div>
                </div>
              );
            })}
            {bottom5.length === 0 && (
              <div className="p-4 text-center text-neutral-400 italic">No laggards found in current filter.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
