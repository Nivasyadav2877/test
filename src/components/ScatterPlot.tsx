import React, { useMemo } from 'react';
import { StationData } from '../types';

interface ScatterPlotProps {
  stations: StationData[];
  eSakshyaAverage: number;
  ceirAverage: number;
  selectedStationId: string | null;
  onSelectStation: (id: string) => void;
}

export const ScatterPlot: React.FC<ScatterPlotProps> = ({
  stations,
  eSakshyaAverage,
  ceirAverage,
  selectedStationId,
  onSelectStation,
}) => {
  // Chart layout dimensions
  const width = 400;
  const height = 280;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const usableWidth = width - paddingLeft - paddingRight;
  const usableHeight = height - paddingTop - paddingBottom;

  // Scale functions (0 - 100)
  const getX = (val: number) => paddingLeft + (val / 100) * usableWidth;
  const getY = (val: number) => height - paddingBottom - (val / 100) * usableHeight;

  // Coordinates of District Averages
  const avgX = getX(eSakshyaAverage);
  const avgY = getY(ceirAverage);

  // Group stations by quadrant
  const stats = useMemo(() => {
    let weakBothCount = 0;
    stations.forEach((s) => {
      if (s.eSakshya < eSakshyaAverage && s.ceirScore < ceirAverage) {
        weakBothCount++;
      }
    });
    return { weakBothCount };
  }, [stations, eSakshyaAverage, ceirAverage]);

  return (
    <div id="scatter-plot" className="border border-[#1D1818]/15 bg-[#F8F7F4] p-5 flex flex-col h-full justify-between relative">
      <div>
        <div className="flex justify-between items-start mb-1">
          <div>
            <h3 className="text-sm font-bold font-display uppercase tracking-tight text-[#1D1818]">
              eSakshya &amp; CEIR Correlation
            </h3>
            <p className="text-[10px] text-[#1D1818]/60 mt-0.5 font-mono">
              Identifying structural gaps across two critical digital evidence metrics
            </p>
          </div>
        </div>

        {/* Informative Quadrant Label */}
        <div className="text-[9px] bg-[#E84855]/10 border border-[#E84855]/20 p-2 text-[#E84855] font-mono mb-3 uppercase leading-tight">
          🚨 <strong>{stats.weakBothCount} stations</strong> are weak on BOTH metrics (bottom-left quadrant). Focus areas for SDPOs.
        </div>

        {/* Scatter Plot SVG */}
        <div className="flex justify-center items-center py-2">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            width="100%"
            height={height}
            className="block select-none font-mono"
          >
            {/* Quadrant Zone Backgrounds */}
            {/* Top Right: High-High (Teal zone) */}
            <rect
              x={avgX}
              y={paddingTop}
              width={width - paddingRight - avgX}
              height={avgY - paddingTop}
              fill="rgba(46, 196, 182, 0.02)"
            />
            {/* Bottom Left: Low-Low (Red zone) */}
            <rect
              x={paddingLeft}
              y={avgY}
              width={avgX - paddingLeft}
              height={height - paddingBottom - avgY}
              fill="rgba(232, 72, 85, 0.04)"
            />

            {/* X & Y Axis Lines */}
            <line
              x1={paddingLeft}
              y1={height - paddingBottom}
              x2={width - paddingRight}
              y2={height - paddingBottom}
              stroke="#1D1818"
              strokeWidth="1"
            />
            <line
              x1={paddingLeft}
              y1={paddingTop}
              x2={paddingLeft}
              y2={height - paddingBottom}
              stroke="#1D1818"
              strokeWidth="1"
            />

            {/* Grid line labels (Axis Ticks) */}
            {[25, 50, 75, 100].map((tick) => {
              const x = getX(tick);
              const y = getY(tick);
              return (
                <g key={tick} className="opacity-20 text-[7px] font-bold">
                  {/* Vertical grids */}
                  <line x1={x} y1={paddingTop} x2={x} y2={height - paddingBottom} stroke="#1D1818" strokeWidth="0.5" strokeDasharray="1,2" />
                  <text x={x} y={height - paddingBottom + 10} textAnchor="middle" fill="#1D1818">{tick}%</text>

                  {/* Horizontal grids */}
                  <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#1D1818" strokeWidth="0.5" strokeDasharray="1,2" />
                  <text x={paddingLeft - 6} y={y + 3} textAnchor="end" fill="#1D1818">{tick}%</text>
                </g>
              );
            })}

            {/* Quadrant Separator Lines (Dashed Gray District Averages) */}
            <line
              x1={paddingLeft}
              y1={avgY}
              x2={width - paddingRight}
              y2={avgY}
              stroke="#1D1818"
              strokeWidth="1.2"
              strokeDasharray="4,4"
              className="opacity-45"
            />
            <line
              x1={avgX}
              y1={paddingTop}
              x2={avgX}
              y2={height - paddingBottom}
              stroke="#1D1818"
              strokeWidth="1.2"
              strokeDasharray="4,4"
              className="opacity-45"
            />

            {/* Quadrant Zone Tags */}
            <text x={width - paddingRight - 8} y={paddingTop + 12} fill="#2EC4B6" fontSize="7" fontWeight="bold" textAnchor="end" className="opacity-80">
              ZONE A: BOTH STRONG
            </text>
            <text x={paddingLeft + 8} y={height - paddingBottom - 8} fill="#E84855" fontSize="7" fontWeight="bold" textAnchor="start" className="opacity-80">
              ZONE C: NEGLIGENT AREA
            </text>

            {/* Average Indicator Tags */}
            <text x={avgX + 4} y={paddingTop + 24} fill="#1D1818" fontSize="6.5" fontWeight="bold" className="opacity-50">
              X-AVG: {eSakshyaAverage}%
            </text>
            <text x={width - paddingRight - 8} y={avgY - 4} fill="#1D1818" fontSize="6.5" fontWeight="bold" textAnchor="end" className="opacity-50">
              Y-AVG: {ceirAverage}%
            </text>

            {/* Station Points */}
            {stations.map((station) => {
              const x = getX(station.eSakshya);
              const y = getY(station.ceirScore);
              const isSelected = selectedStationId === station.id;
              
              // Highlight bottom-left quadrant in Red
              const isWeakBoth = station.eSakshya < eSakshyaAverage && station.ceirScore < ceirAverage;
              
              let dotColor = '#1D1818'; // regular dark
              if (isWeakBoth) dotColor = '#E84855'; // red laggard
              else if (station.eSakshya >= eSakshyaAverage && station.ceirScore >= ceirAverage) dotColor = '#2EC4B6'; // green strong

              return (
                <g
                  key={station.id}
                  className="cursor-pointer group"
                  onClick={() => onSelectStation(station.id)}
                >
                  {/* Point aura on select / hover */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 10 : 6}
                    fill={isSelected ? 'rgba(232, 72, 85, 0.2)' : 'transparent'}
                    className="group-hover:fill-black/10 transition-all duration-300"
                  />

                  {/* Core Point dot */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 5.5 : 3.5}
                    fill={dotColor}
                    stroke="#F8F7F4"
                    strokeWidth="1"
                    className="transition-all duration-300"
                  />

                  {/* Floating tooltip/text on hover */}
                  <title>{`${station.name}\nSDPO: ${station.sdpo}\neSakshya: ${station.eSakshya}%\nCEIR Score: ${station.ceirScore}%`}</title>
                  
                  {/* Label on point hover or selected */}
                  {(isSelected) && (
                    <text
                      x={x}
                      y={y - 8}
                      fill="#1D1818"
                      fontSize="7"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="bg-white/90 px-1 py-0.5 rounded shadow"
                    >
                      {station.name.split(' ')[0]}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Axis Titles */}
      <div className="flex justify-between items-center text-[8.5px] font-mono text-[#1D1818]/60 mt-1 border-t border-[#1D1818]/10 pt-2.5">
        <span>&larr; X-Axis: eSakshya App SID%</span>
        <span>Y-Axis: CEIR Utilization &rarr;</span>
      </div>
    </div>
  );
};
