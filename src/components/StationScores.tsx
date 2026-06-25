import React, { useRef, useMemo } from 'react';
import { StationData } from '../types';

interface StationScoresProps {
  stations: StationData[];
  districtAverage: number;
  selectedStationId: string | null;
  onSelectStation: (id: string) => void;
  scoreThreshold: number;
}

export const StationScores: React.FC<StationScoresProps> = ({
  stations,
  districtAverage,
  selectedStationId,
  onSelectStation,
  scoreThreshold,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter & sort stations descending
  const sortedStations = useMemo(() => {
    return [...stations]
      .filter((s) => s.compositeScore <= scoreThreshold)
      .sort((a, b) => b.compositeScore - a.compositeScore);
  }, [stations, scoreThreshold]);

  // SVG parameters
  const height = 220;
  const paddingLeft = 40;
  const paddingRight = 10;
  const paddingTop = 15;
  const paddingBottom = 65;
  const barWidth = 14;
  const barGap = 6;

  const chartWidth = Math.max(
    sortedStations.length * (barWidth + barGap) + paddingLeft + paddingRight,
    600
  );

  // Scale Y to fit composite scores (0 - 100)
  const scaleY = (score: number) => {
    const usableHeight = height - paddingTop - paddingBottom;
    return height - paddingBottom - (score / 100) * usableHeight;
  };

  const getBarColor = (score: number, isSelected: boolean) => {
    if (isSelected) return '#E84855'; // Select accent
    return score >= districtAverage ? '#2EC4B6' : '#E84855'; // above/below average
  };

  const avgY = scaleY(districtAverage);

  return (
    <div id="station-scores" className="border border-[#1D1818]/15 bg-white p-5 flex flex-col h-full relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline mb-2">
        <div>
          <h3 className="text-sm font-bold font-display uppercase tracking-tight text-[#1D1818]">
            Station-Level Composite Scores
          </h3>
          <p className="text-[10px] text-[#1D1818]/60 mt-0.5 font-mono">
            Comparing overall performance against District Average ({districtAverage}%)
          </p>
        </div>
        <div className="text-[9px] text-[#1D1818]/50 uppercase font-mono mt-1 sm:mt-0 flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <span className="inline-block w-2.5 h-1.5 bg-[#2EC4B6]" />
            <span>&ge; Avg</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="inline-block w-2.5 h-1.5 bg-[#E84855]" />
            <span>&lt; Avg</span>
          </span>
        </div>
      </div>

      {sortedStations.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-[#1D1818]/10 bg-[#1D1818]/3 p-8 font-mono text-[10px] text-center min-h-[220px]">
          <span>No stations match the current score threshold ({scoreThreshold}%).</span>
          <span className="opacity-60 mt-1">Adjust the filter slider to display stations.</span>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto border border-[#1D1818]/10 bg-white/40" ref={containerRef}>
          <div style={{ width: `${chartWidth}px`, height: `${height}px` }} className="relative">
            <svg width={chartWidth} height={height} className="block select-none font-mono">
              {/* Grid lines (20%, 40%, 60%, 80%, 100%) */}
              {[20, 40, 60, 80, 100].map((tick) => {
                const y = scaleY(tick);
                return (
                  <g key={tick} className="opacity-20">
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={chartWidth - paddingRight}
                      y2={y}
                      stroke="#1D1818"
                      strokeWidth="0.5"
                      strokeDasharray="2,2"
                    />
                    <text
                      x={paddingLeft - 8}
                      y={y + 3}
                      fill="#1D1818"
                      fontSize="8"
                      textAnchor="end"
                      className="font-bold"
                    >
                      {tick}
                    </text>
                  </g>
                );
              })}

              {/* District Average Line (Dashed Red Line) */}
              <line
                x1={paddingLeft}
                y1={avgY}
                x2={chartWidth - paddingRight}
                y2={avgY}
                stroke="#E84855"
                strokeWidth="1.5"
                strokeDasharray="4,3"
                className="opacity-90"
              />
              <text
                x={chartWidth - paddingRight - 10}
                y={avgY - 4}
                fill="#E84855"
                fontSize="8"
                textAnchor="end"
                fontWeight="bold"
                className="bg-white"
              >
                DISTRICT AVG: {districtAverage}%
              </text>

              {/* Station bars */}
              {sortedStations.map((station, i) => {
                const x = paddingLeft + i * (barWidth + barGap);
                const y = scaleY(station.compositeScore);
                const barHeight = Math.max(height - paddingBottom - y, 2);
                const isSelected = selectedStationId === station.id;

                return (
                  <g
                    key={station.id}
                    className="cursor-pointer group"
                    onClick={() => onSelectStation(station.id)}
                  >
                    {/* Hover highlights background */}
                    <rect
                      x={x - barGap / 2}
                      y={paddingTop}
                      width={barWidth + barGap}
                      height={height - paddingTop - paddingBottom}
                      fill={isSelected ? 'rgba(232, 72, 85, 0.05)' : 'rgba(29, 24, 24, 0)'}
                      className="group-hover:fill-black/3 transition-colors"
                    />

                    {/* Performance Bar */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      fill={getBarColor(station.compositeScore, isSelected)}
                      className="transition-all duration-300 group-hover:opacity-90"
                    />

                    {/* Tooltip on hover */}
                    <title>{`${station.name}\nSDPO: ${station.sdpo}\nScore: ${station.compositeScore}%`}</title>

                    {/* Text values on top of bars if enough space */}
                    {station.compositeScore > 0 && (
                      <text
                        x={x + barWidth / 2}
                        y={y - 4}
                        fill="#1D1818"
                        fontSize="7"
                        fontWeight="bold"
                        textAnchor="middle"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {station.compositeScore}
                      </text>
                    )}

                    {/* Station label (45deg rotated) */}
                    <text
                      x={x + barWidth / 2}
                      y={height - paddingBottom + 10}
                      fill={isSelected ? '#E84855' : '#1D1818'}
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      fontSize="7"
                      textAnchor="end"
                      transform={`rotate(-45, ${x + barWidth / 2}, ${height - paddingBottom + 10})`}
                      className="origin-top-right transition-colors"
                    >
                      {station.name.substring(0, 16)}
                      {station.name.length > 16 ? '..' : ''}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}
      
      <div className="mt-2 text-[8px] font-mono text-[#1D1818]/50 flex justify-between">
        <span>* Horizontal scroll of {sortedStations.length} stations.</span>
        <span>Click any bar to drill down to Station Detail.</span>
      </div>
    </div>
  );
};
