import React from 'react';
import { StationData, PARAMETERS } from '../types';

interface RadarProfileProps {
  stations: StationData[];
  selectedStationId: string | null;
  onSelectStation: (id: string) => void;
  districtAverages: Record<string, number>;
}

export const RadarProfile: React.FC<RadarProfileProps> = ({
  stations,
  selectedStationId,
  onSelectStation,
  districtAverages,
}) => {
  // Find current selected station or default to the first one
  const selectedStation = stations.find((s) => s.id === selectedStationId) || stations[0];

  // Radar parameters
  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const r = 95; // max radius for score 100
  const numAxes = PARAMETERS.length;

  // Compute angle-based coordinates
  const getCoordinates = (value: number, index: number) => {
    const angle = (2 * Math.PI * index) / numAxes - Math.PI / 2;
    const distance = (value / 100) * r;
    const x = cx + distance * Math.cos(angle);
    const y = cy + distance * Math.sin(angle);
    return { x, y };
  };

  // Generate polygon points
  const stationPoints = PARAMETERS.map((p, i) => {
    const val = selectedStation ? (selectedStation[p.key as keyof StationData] as number) : 0;
    const { x, y } = getCoordinates(val, i);
    return `${x},${y}`;
  }).join(' ');

  const avgPoints = PARAMETERS.map((p, i) => {
    const val = districtAverages[p.key] || 0;
    const { x, y } = getCoordinates(val, i);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div id="radar-profile" className="border border-[#1D1818]/15 bg-[#F8F7F4] p-5 flex flex-col h-full justify-between relative">
      <div>
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-sm font-bold font-display uppercase tracking-tight text-[#1D1818]">
              Parameter Compliance Profile
            </h3>
            <p className="text-[10px] text-[#1D1818]/60 mt-0.5 font-mono">
              Spider polygon displaying structural deficits
            </p>
          </div>
        </div>

        {/* Station Select Dropdown */}
        <div className="mb-4">
          <label className="block text-[8px] font-bold text-[#1D1818]/60 uppercase mb-1 font-mono">
            Select Station for Profiling
          </label>
          <select
            className="w-full bg-white border border-[#1D1818]/25 text-[10px] font-mono p-1.5 focus:outline-none focus:border-[#E84855] text-[#1D1818] uppercase"
            value={selectedStation?.id || ''}
            onChange={(e) => onSelectStation(e.target.value)}
          >
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} [{s.sdpo}]
              </option>
            ))}
          </select>
        </div>

        {/* Custom Radar SVG */}
        <div className="flex justify-center items-center py-2 relative">
          <svg width={size} height={size} className="block select-none font-mono">
            {/* Concentric rings (20, 40, 60, 80, 100) */}
            {[20, 40, 60, 80, 100].map((level) => {
              const radius = (level / 100) * r;
              // Generate polygon vertices for concentric grids
              const ringPoints = PARAMETERS.map((_, i) => {
                const angle = (2 * Math.PI * i) / numAxes - Math.PI / 2;
                const x = cx + radius * Math.cos(angle);
                const y = cy + radius * Math.sin(angle);
                return `${x},${y}`;
              }).join(' ');

              return (
                <g key={level}>
                  <polygon
                    points={ringPoints}
                    fill="none"
                    stroke="#1D1818"
                    strokeWidth="0.5"
                    className="opacity-15"
                  />
                  {/* Grid text */}
                  <text
                    x={cx}
                    y={cy - radius + 3}
                    fill="#1D1818"
                    fontSize="6"
                    textAnchor="middle"
                    className="opacity-40 select-none font-bold"
                  >
                    {level}
                  </text>
                </g>
              );
            })}

            {/* Axis Lines and Axis Labels */}
            {PARAMETERS.map((p, i) => {
              const angle = (2 * Math.PI * i) / numAxes - Math.PI / 2;
              const outerX = cx + r * Math.cos(angle);
              const outerY = cy + r * Math.sin(angle);

              // Position label a bit further out
              const labelRadius = r + 14;
              const labelX = cx + labelRadius * Math.cos(angle);
              const labelY = cy + labelRadius * Math.sin(angle);

              // Calculate clean text anchors based on side of circle
              let textAnchor = 'middle';
              if (Math.cos(angle) > 0.1) textAnchor = 'start';
              if (Math.cos(angle) < -0.1) textAnchor = 'end';

              return (
                <g key={p.key}>
                  {/* Axis Line */}
                  <line
                    x1={cx}
                    y1={cy}
                    x2={outerX}
                    y2={outerY}
                    stroke="#1D1818"
                    strokeWidth="0.5"
                    className="opacity-15"
                  />

                  {/* Parameter Axis Label (Tiny index text or abbreviated label) */}
                  <text
                    x={labelX}
                    y={labelY + 2}
                    fill="#1D1818"
                    fontSize="7"
                    fontWeight="bold"
                    textAnchor={textAnchor}
                    className="opacity-85"
                  >
                    {p.label.substring(0, 14)}
                  </text>
                </g>
              );
            })}

            {/* Overlapping Polygons */}
            {/* 1. District Average Polygon (Dashed Charcoal) */}
            <polygon
              points={avgPoints}
              fill="none"
              stroke="#1D1818"
              strokeWidth="1.5"
              strokeDasharray="3,3"
              className="opacity-60"
            />

            {/* 2. Selected Station Polygon (Teal Filled with opacity) */}
            <polygon
              points={stationPoints}
              fill="rgba(46, 196, 182, 0.2)"
              stroke="#2EC4B6"
              strokeWidth="2.5"
              className="transition-all duration-500"
            />

            {/* Dots on Selected Station Polygon Vertices */}
            {PARAMETERS.map((p, i) => {
              const val = selectedStation ? (selectedStation[p.key as keyof StationData] as number) : 0;
              const { x, y } = getCoordinates(val, i);
              return (
                <circle
                  key={p.key}
                  cx={x}
                  cy={y}
                  r="3.5"
                  fill="#2EC4B6"
                  stroke="#F8F7F4"
                  strokeWidth="1"
                  className="transition-all duration-500"
                  title={`${p.label}: ${val}%`}
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* Legend & Details */}
      <div className="mt-2 pt-3 border-t border-[#1D1818]/10 flex flex-col space-y-1.5">
        <div className="flex justify-between items-center text-[9px] font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="inline-block w-3 h-3 bg-[#2EC4B6]/20 border border-[#2EC4B6] rounded-sm" />
            <span className="uppercase font-bold text-[#1D1818]">
              {selectedStation?.name.substring(0, 15)}
            </span>
          </div>
          <span className="font-bold text-[#2EC4B6]">{selectedStation?.compositeScore}% Comp</span>
        </div>
        <div className="flex justify-between items-center text-[9px] font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="inline-block w-3 h-0 border-t-2 border-dashed border-[#1D1818]/60" />
            <span className="uppercase text-[#1D1818]/60">District Average</span>
          </div>
          <span className="font-bold text-[#1D1818]/60">{districtAverages.composite}%</span>
        </div>
      </div>
    </div>
  );
};
