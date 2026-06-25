import React from 'react';
import { StationData, SDPOType } from '../types';
import { AlertTriangle, Award, CheckCircle, TrendingDown, ShieldAlert } from 'lucide-react';

interface CommandSummaryProps {
  filteredStations: StationData[];
  allStations: StationData[];
}

export const CommandSummary: React.FC<CommandSummaryProps> = ({ filteredStations, allStations }) => {
  // 1. District overall Smart Policing Score (weighted average)
  const averageScore = filteredStations.length > 0
    ? parseFloat((filteredStations.reduce((sum, s) => sum + s.compositeScore, 0) / filteredStations.length).toFixed(1))
    : 0;

  // 2. Total stations at 100% compliance (e.g. perfect score on Citizen Portal, which is the key 100% benchmark, or very high composite)
  // Let's define "Perfect Citizen Portal Compliance" as 100%, and show that since Citizen Portal is a critical metric.
  const perfectCitizenPortal = filteredStations.filter(s => s.citizenPortal === 100).length;

  // 3. Total stations below 50% (red alert)
  const redAlertStations = filteredStations.filter(s => s.compositeScore < 50).length;

  // 4. Best & Weakest Sub-Division calculations
  const sdpoAverages = React.useMemo(() => {
    const map: Record<string, { sum: number; count: number }> = {};
    allStations.forEach(s => {
      if (!map[s.sdpo]) {
        map[s.sdpo] = { sum: 0, count: 0 };
      }
      map[s.sdpo].sum += s.compositeScore;
      map[s.sdpo].count += 1;
    });

    return Object.entries(map).map(([name, { sum, count }]) => ({
      name,
      avg: parseFloat((sum / count).toFixed(1)),
      count
    })).sort((a, b) => b.avg - a.avg);
  }, [allStations]);

  const bestSDPO = sdpoAverages[0] || { name: 'N/A', avg: 0 };
  const weakestSDPO = sdpoAverages[sdpoAverages.length - 1] || { name: 'N/A', avg: 0 };

  return (
    <div id="district-command-summary" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      {/* Card 1: District Average */}
      <div className="border border-[#1D1818]/15 bg-white p-5 flex flex-col justify-between relative overflow-hidden border-b-4 border-b-[#1D1818]">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] uppercase tracking-wider text-[#1D1818]/60 font-bold font-mono">
            District Score (Avg)
          </span>
          <Award className="w-4 h-4 text-[#E84855]" />
        </div>
        <div>
          <div className="text-4xl font-black tracking-tight text-[#1D1818] mb-1">
            {averageScore}%
          </div>
          <p className="text-[10px] text-[#1D1818]/50 font-mono uppercase">
            {filteredStations.length} of {allStations.length} Stations Active
          </p>
        </div>
      </div>

      {/* Card 2: 100% Citizen Portal Compliance */}
      <div className="border border-[#1D1818]/15 bg-white p-5 flex flex-col justify-between relative overflow-hidden border-b-4 border-b-[#2EC4B6]">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] uppercase tracking-wider text-[#1D1818]/60 font-bold font-mono">
            Citizen Portal 100%
          </span>
          <CheckCircle className="w-4 h-4 text-[#2EC4B6]" />
        </div>
        <div>
          <div className="text-4xl font-black tracking-tight text-[#2EC4B6] mb-1">
            {perfectCitizenPortal}
          </div>
          <p className="text-[10px] text-[#1D1818]/50 font-mono uppercase">
            Stations with Perfect Status
          </p>
        </div>
      </div>

      {/* Card 3: Red Alert Stations (<= 50%) */}
      <div className="border border-[#1D1818]/15 bg-white p-5 flex flex-col justify-between relative overflow-hidden border-b-4 border-b-[#E84855]">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] uppercase tracking-wider text-[#1D1818]/60 font-bold font-mono">
            Critically Low (&le;50%)
          </span>
          <ShieldAlert className="w-4 h-4 text-[#E84855]" />
        </div>
        <div>
          <div className="text-4xl font-black tracking-tight text-[#E84855] mb-1">
            {redAlertStations}
          </div>
          <p className="text-[10px] text-[#1D1818]/50 font-mono uppercase">
            Stations in Red Alert Zone
          </p>
        </div>
      </div>

      {/* Card 4: Best Sub-Division */}
      <div className="border border-[#1D1818]/15 bg-white p-5 flex flex-col justify-between relative overflow-hidden border-b-4 border-b-[#1D1818]/30">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] uppercase tracking-wider text-[#1D1818]/60 font-bold font-mono">
            Top Sub-Division
          </span>
          <TrendingDown className="w-4 h-4 text-[#2EC4B6] transform rotate-180" />
        </div>
        <div>
          <div className="text-xl font-extrabold tracking-tight text-[#1D1818] mb-1 truncate">
            {bestSDPO.name}
          </div>
          <p className="text-[10px] font-mono uppercase text-[#1D1818]/50">
            <span className="text-[#2EC4B6] font-bold">{bestSDPO.avg}%</span> Avg Score
          </p>
        </div>
      </div>

      {/* Card 5: Weakest Sub-Division */}
      <div className="border border-[#1D1818]/15 bg-white p-5 flex flex-col justify-between relative overflow-hidden border-l-4 border-l-[#E84855] border-b-4 border-b-[#E84855]">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] uppercase tracking-wider text-[#E84855] font-black font-mono">
            Weakest Sub-Division
          </span>
          <AlertTriangle className="w-4 h-4 text-[#E84855]" />
        </div>
        <div>
          <div className="text-xl font-mono font-black text-[#E84855] mb-1 truncate">
            {weakestSDPO.name}
          </div>
          <p className="text-[10px] font-mono uppercase text-[#1D1818]/50">
            <span className="text-[#E84855] font-bold">{weakestSDPO.avg}%</span> Avg Score
          </p>
        </div>
      </div>
    </div>
  );
};
