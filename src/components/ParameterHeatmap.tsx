import React, { useState, useMemo } from 'react';
import { StationData, PARAMETERS } from '../types';
import { Search } from 'lucide-react';

interface ParameterHeatmapProps {
  stations: StationData[];
  onSelectStation: (id: string) => void;
  selectedStationId: string | null;
}

export const ParameterHeatmap: React.FC<ParameterHeatmapProps> = ({
  stations,
  onSelectStation,
  selectedStationId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter stations based on search query
  const searchedStations = useMemo(() => {
    return stations.filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [stations, searchQuery]);

  // Color generator for heatmap cells
  // 0% -> deep red (#E84855), 50% -> pale neutral cream/white (#F8F7F4), 100% -> deep teal (#2EC4B6)
  const getCellColor = (score: number) => {
    if (score === 0) return '#E84855';

    // Let's do a beautiful discrete color scale or continuous hex interpolation.
    // Discrete steps are actually much cleaner and easier to read:
    if (score < 20) return '#E84855'; // Critically Low
    if (score < 40) return 'rgba(232, 72, 85, 0.7)'; // Low-mid
    if (score < 60) return 'rgba(232, 72, 85, 0.35)'; // Dragging
    if (score < 80) return 'rgba(255, 159, 28, 0.3)'; // Amber/Medium compliance
    if (score < 95) return 'rgba(46, 196, 182, 0.4)'; // Good compliance
    return '#2EC4B6'; // Full/Perfect compliance
  };

  const getCellTextColor = (score: number) => {
    if (score < 30 || score === 100) return '#F8F7F4'; // High contrast light text on dark background
    return '#1D1818';
  };

  return (
    <div id="parameter-heatmap" className="border border-[#1D1818]/15 bg-[#F8F7F4] p-5 flex flex-col h-[480px] relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold font-display uppercase tracking-tight text-[#1D1818]">
            Parameter-wise Performance Matrix
          </h3>
          <p className="text-[10px] text-[#1D1818]/60 mt-0.5 font-mono">
            Full compliance grid of stations vs. 9 Smart Policing indicators
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-48">
          <input
            type="text"
            placeholder="FIND STATION..."
            className="w-full bg-white border border-[#1D1818]/20 px-2 py-1 text-[9px] font-mono tracking-wider focus:outline-none focus:border-[#E84855] text-[#1D1818] placeholder-[#1D1818]/40"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute right-2 top-1.5 w-3 h-3 text-[#1D1818]/40 pointer-events-none" />
        </div>
      </div>

      {/* Heatmap table wrapper with scroll */}
      <div className="flex-1 overflow-auto border border-[#1D1818]/10 bg-white">
        <table className="w-full border-collapse font-mono text-[9px]">
          <thead className="sticky top-0 bg-[#1D1818] text-[#F8F7F4] z-20">
            <tr>
              <th className="p-2 border border-[#1D1818]/20 text-left uppercase font-bold sticky left-0 bg-[#1D1818] min-w-[120px] shadow-[2px_0_5px_rgba(0,0,0,0.1)]">
                Station [SDPO]
              </th>
              {PARAMETERS.map((p) => (
                <th
                  key={p.key}
                  className="p-2 border border-[#1D1818]/20 text-center font-bold font-mono tracking-tighter whitespace-nowrap"
                  title={p.desc}
                >
                  <span className="block text-[8px] opacity-75">{p.label}</span>
                  <span className="block text-[7px] text-yellow-400 font-normal">w:{p.weight}</span>
                </th>
              ))}
              <th className="p-2 border border-[#1D1818]/20 text-center font-bold bg-[#E84855] text-white whitespace-nowrap">
                COMP.
              </th>
            </tr>
          </thead>
          <tbody>
            {searchedStations.length === 0 ? (
              <tr>
                <td colSpan={11} className="p-8 text-center text-neutral-400 uppercase italic">
                  No matching police stations found.
                </td>
              </tr>
            ) : (
              searchedStations.map((station) => {
                const isSelected = selectedStationId === station.id;

                return (
                  <tr
                    key={station.id}
                    className={`hover:bg-[#1D1818]/5 transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#E84855]/5 border-y-2 border-y-[#1D1818]' : ''
                    }`}
                    onClick={() => onSelectStation(station.id)}
                  >
                    {/* Station Name */}
                    <td className={`p-2 border border-[#1D1818]/10 font-bold sticky left-0 bg-[#F8F7F4] hover:bg-[#F8F7F4] z-10 whitespace-nowrap shadow-[2px_0_5px_rgba(0,0,0,0.03)] ${
                      isSelected ? 'text-[#E84855] bg-red-50/50' : 'text-[#1D1818]'
                    }`}>
                      <div className="flex flex-col leading-tight">
                        <span className="uppercase">{station.name}</span>
                        <span className="text-[7px] opacity-50 font-normal">{station.sdpo}</span>
                      </div>
                    </td>

                    {/* Parameter Cells */}
                    {PARAMETERS.map((p) => {
                      const val = station[p.key as keyof StationData] as number;
                      return (
                        <td
                          key={p.key}
                          className="p-1 border border-[#1D1818]/10 text-center text-[10px] font-bold select-none transition-all duration-200"
                          style={{
                            backgroundColor: getCellColor(val),
                            color: getCellTextColor(val),
                          }}
                          title={`${station.name} - ${p.label}: ${val}%`}
                        >
                          {val === 0 ? '0' : val.toFixed(0)}
                        </td>
                      );
                    })}

                    {/* Composite Score */}
                    <td className={`p-1 border border-[#1D1818]/15 text-center font-bold text-[10px] bg-neutral-200/50 ${
                      station.compositeScore < 50 ? 'text-[#E84855]' : 'text-neutral-800'
                    }`}>
                      {station.compositeScore}%
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap justify-between items-center text-[8px] font-mono gap-2">
        <div className="flex items-center space-x-2">
          <span>Heatmap Scale:</span>
          <span className="inline-block px-1 bg-[#E84855] text-white text-[7px] rounded-sm font-bold">0-20% Red</span>
          <span className="inline-block px-1 bg-[#E84855]/35 text-neutral-800 text-[7px] rounded-sm font-bold">20-60% Light Red</span>
          <span className="inline-block px-1 bg-[#FF9F1C]/30 text-neutral-800 text-[7px] rounded-sm font-bold">60-80% Amber</span>
          <span className="inline-block px-1 bg-[#2EC4B6]/40 text-neutral-800 text-[7px] rounded-sm font-bold">80-95% Light Teal</span>
          <span className="inline-block px-1 bg-[#2EC4B6] text-white text-[7px] rounded-sm font-bold">95-100% Teal</span>
        </div>
        <span className="text-[#1D1818]/40 text-right font-bold uppercase">
          * Showing {searchedStations.length} of {stations.length} stations
        </span>
      </div>
    </div>
  );
};
