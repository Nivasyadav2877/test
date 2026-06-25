import React, { useMemo } from 'react';
import { StationData, PARAMETERS } from '../types';
import { X, Trophy, AlertTriangle, CheckSquare, Target, Sparkles } from 'lucide-react';

interface StationDetailProps {
  selectedStationId: string | null;
  allStations: StationData[];
  onClose: () => void;
}

export const StationDetail: React.FC<StationDetailProps> = ({
  selectedStationId,
  allStations,
  onClose,
}) => {
  // Find current station
  const station = useMemo(() => {
    return allStations.find((s) => s.id === selectedStationId) || allStations[0];
  }, [allStations, selectedStationId]);

  if (!station) return null;

  // Calculate ranks
  const ranks = useMemo(() => {
    // 1. District Rank
    const sortedDistrict = [...allStations].sort((a, b) => b.compositeScore - a.compositeScore);
    const districtRank = sortedDistrict.findIndex((s) => s.id === station.id) + 1;

    // 2. SDPO Rank
    const sdpoStations = allStations.filter((s) => s.sdpo === station.sdpo);
    const sortedSdpo = [...sdpoStations].sort((a, b) => b.compositeScore - a.compositeScore);
    const sdpoRank = sortedSdpo.findIndex((s) => s.id === station.id) + 1;

    return {
      districtRank,
      totalDistrict: allStations.length,
      sdpoRank,
      totalSdpo: sdpoStations.length,
    };
  }, [allStations, station]);

  // Color coding for each metric score
  const getProgressColor = (score: number) => {
    if (score < 30) return 'bg-[#E84855]'; // Red
    if (score <= 70) return 'bg-[#FF9F1C]'; // Amber
    return 'bg-[#2EC4B6]'; // Green
  };

  const getTextColor = (score: number) => {
    if (score < 30) return 'text-[#E84855]';
    if (score <= 70) return 'text-[#FF9F1C]';
    return 'text-[#2EC4B6]';
  };

  // Identify parameters needing urgent attention (scores < 50)
  const urgentAttentionParams = useMemo(() => {
    const list: string[] = [];
    PARAMETERS.forEach((p) => {
      const val = station[p.key as keyof StationData] as number;
      if (val < 50) {
        list.push(p.label);
      }
    });
    return list;
  }, [station]);

  return (
    <div
      id="station-detail-panel"
      className="border border-[#1D1818]/15 bg-[#F8F7F4] p-5 flex flex-col h-full justify-between relative"
    >
      <div>
        {/* Header with Close option */}
        <div className="flex justify-between items-start border-b border-[#1D1818]/10 pb-3 mb-4">
          <div className="leading-tight">
            <span className="text-[9px] uppercase tracking-wider font-bold text-[#1D1818]/60 font-mono">
              STATION REPORT CARD
            </span>
            <h3 className="text-base font-bold font-display uppercase tracking-tight text-[#1D1818] mt-0.5">
              {station.name}
            </h3>
            <span className="text-[10px] text-white bg-[#1D1818] px-1.5 py-0.5 uppercase tracking-wide font-mono inline-block mt-1">
              SDPO: {station.sdpo}
            </span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-[#1D1818]/50 hover:text-[#1D1818] p-1 border border-transparent hover:border-[#1D1818]/15"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* High-Level composite scores & Ranks */}
        <div className="grid grid-cols-3 gap-2 mb-4 border-b border-[#1D1818]/10 pb-4">
          <div className="bg-white border border-[#1D1818]/10 p-2 text-center flex flex-col justify-center">
            <span className="text-[7.5px] uppercase font-bold text-[#1D1818]/50 font-mono">COMPOSITE</span>
            <span className="text-xl font-bold font-mono tracking-tight text-[#1D1818]">
              {station.compositeScore}%
            </span>
          </div>

          <div className="bg-white border border-[#1D1818]/10 p-2 text-center flex flex-col justify-center">
            <span className="text-[7.5px] uppercase font-bold text-[#1D1818]/50 font-mono flex items-center justify-center gap-0.5">
              <Trophy className="w-2.5 h-2.5 text-[#FF9F1C]" /> DISTRICT RANK
            </span>
            <span className="text-base font-bold font-mono tracking-tight text-[#1D1818]">
              #{ranks.districtRank} <span className="text-[8px] font-normal text-neutral-500">/{ranks.totalDistrict}</span>
            </span>
          </div>

          <div className="bg-white border border-[#1D1818]/10 p-2 text-center flex flex-col justify-center">
            <span className="text-[7.5px] uppercase font-bold text-[#1D1818]/50 font-mono flex items-center justify-center gap-0.5">
              <Target className="w-2.5 h-2.5 text-[#2EC4B6]" /> SDPO RANK
            </span>
            <span className="text-base font-bold font-mono tracking-tight text-[#1D1818]">
              #{ranks.sdpoRank} <span className="text-[8px] font-normal text-neutral-500">/{ranks.totalSdpo}</span>
            </span>
          </div>
        </div>

        {/* 9 Parameter scores as progress bars */}
        <div className="space-y-2.5 max-h-[190px] overflow-y-auto pr-1">
          <span className="text-[8px] uppercase tracking-wider font-bold text-[#1D1818]/60 font-mono block">
            Parameter Score Breakdown
          </span>

          {PARAMETERS.map((p) => {
            const val = station[p.key as keyof StationData] as number;
            return (
              <div key={p.key} className="space-y-1">
                <div className="flex justify-between text-[9px] font-mono">
                  <span className="uppercase text-[#1D1818] font-bold truncate max-w-[160px]" title={p.desc}>
                    {p.label}
                  </span>
                  <span className={`font-bold ${getTextColor(val)}`}>
                    {val.toFixed(1)}%
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full h-1.5 bg-neutral-200 border border-neutral-300/30 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getProgressColor(val)}`}
                    style={{ width: `${val}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Prompt Panel / Urgent Attention */}
      <div className="mt-4 pt-3 border-t border-[#1D1818]/10 font-mono">
        {urgentAttentionParams.length > 0 ? (
          <div className="bg-[#E84855]/10 border border-[#E84855]/20 p-2.5 text-[#E84855] text-[9px] leading-relaxed">
            <div className="font-bold uppercase flex items-center gap-1.5 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-[#E84855]" />
              URGENT COMPLIANCE ACTION REQUIRED
            </div>
            <p className="text-[#1D1818]/85 mb-1.5">
              The station has underperformed in the following critical parameters:
            </p>
            <div className="flex flex-wrap gap-1">
              {urgentAttentionParams.map((pName) => (
                <span
                  key={pName}
                  className="px-1.5 py-0.5 bg-[#E84855] text-white text-[7.5px] uppercase font-bold"
                >
                  {pName}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-[#2EC4B6]/10 border border-[#2EC4B6]/20 p-2.5 text-[#2EC4B6] text-[9px] leading-relaxed">
            <div className="font-bold uppercase flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#2EC4B6]" />
              OUTSTANDING COMPLIANCE RECORD
            </div>
            <p className="text-[#1D1818]/85">
              This station is meeting all compliance standards beautifully. Maintain this strict protocol.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
