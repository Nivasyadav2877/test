import React from 'react';
import { StationData } from '../types';

interface CctnsDeepDiveProps {
  stations: StationData[];
}

export const CctnsDeepDive: React.FC<CctnsDeepDiveProps> = ({ stations }) => {
  // Let's sort stations by CCTNS overall descending
  const sortedStations = [...stations].sort((a, b) => b.cctnsOverall - a.cctnsOverall);

  // SVG Dimension Constants
  const height = 260;
  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 65;
  
  // Group Width details
  const barWidth = 8;
  const barSpacing = 2; // spacing between bars inside a group
  const groupGap = 10; // gap between groups (stations)
  const groupWidth = barWidth * 3 + barSpacing * 2;

  const chartWidth = Math.max(
    sortedStations.length * (groupWidth + groupGap) + paddingLeft + paddingRight,
    600
  );

  // Scale Y (0 - 100)
  const scaleY = (score: number) => {
    const usableHeight = height - paddingTop - paddingBottom;
    return height - paddingBottom - (score / 100) * usableHeight;
  };

  return (
    <div id="cctns-deep-dive" className="border border-[#1D1818]/15 bg-[#F8F7F4] p-5 flex flex-col h-full relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline mb-3">
        <div>
          <h3 className="text-sm font-bold font-display uppercase tracking-tight text-[#1D1818]">
            CCTNS Deep Dive Analyzer
          </h3>
          <p className="text-[10px] text-[#1D1818]/60 mt-0.5 font-mono">
            Evaluating overall track records vs. weekly update routines (M1 & M2)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-1.5 sm:mt-0 font-mono text-[8px] uppercase font-bold">
          <span className="flex items-center space-x-1">
            <span className="inline-block w-2.5 h-2.5 bg-[#1D1818]" />
            <span>Overall Score</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="inline-block w-2.5 h-2.5 bg-[#FF9F1C]" />
            <span>Weekly M1</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="inline-block w-2.5 h-2.5 bg-[#E84855]" />
            <span>Weekly M2 (All 0)</span>
          </span>
        </div>
      </div>

      {sortedStations.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-[#1D1818]/10 bg-[#1D1818]/3 p-8 font-mono text-[10px] text-center min-h-[200px]">
          <span>No stations available for the selected sub-division.</span>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto border border-[#1D1818]/10 bg-white/40">
          <div style={{ width: `${chartWidth}px`, height: `${height}px` }} className="relative">
            <svg width={chartWidth} height={height} className="block select-none font-mono">
              {/* Y Axis Grid Lines */}
              {[25, 50, 75, 100].map((level) => {
                const y = scaleY(level);
                return (
                  <g key={level} className="opacity-15">
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
                      {level}
                    </text>
                  </g>
                );
              })}

              {/* Render Stations Grouped Bars */}
              {sortedStations.map((station, i) => {
                const groupX = paddingLeft + i * (groupWidth + groupGap);

                const overallY = scaleY(station.cctnsOverall);
                const overallH = Math.max(height - paddingBottom - overallY, 1);

                const wkly1Y = scaleY(station.cctnsWkly1);
                const wkly1H = Math.max(height - paddingBottom - wkly1Y, 1);

                const wkly2Y = scaleY(station.cctnsWkly2);
                const wkly2H = Math.max(height - paddingBottom - wkly2Y, 1); // will be 0/minimal

                return (
                  <g key={station.id} className="group">
                    {/* Hover highlights group background */}
                    <rect
                      x={groupX - groupGap / 2}
                      y={paddingTop}
                      width={groupWidth + groupGap}
                      height={height - paddingTop - paddingBottom}
                      fill="rgba(29, 24, 24, 0)"
                      className="group-hover:fill-black/3 transition-colors"
                    />

                    {/* Bar 1: Overall CCTNS (Ink Black) */}
                    <rect
                      x={groupX}
                      y={overallY}
                      width={barWidth}
                      height={overallH}
                      fill="#1D1818"
                      className="transition-all duration-300"
                    />

                    {/* Bar 2: Weekly Metric 1 (Amber) */}
                    <rect
                      x={groupX + barWidth + barSpacing}
                      y={wkly1Y}
                      width={barWidth}
                      height={wkly1H}
                      fill="#FF9F1C"
                      className="transition-all duration-300"
                    />

                    {/* Bar 3: Weekly Metric 2 (Red - always 0) */}
                    <rect
                      x={groupX + (barWidth + barSpacing) * 2}
                      y={wkly2Y}
                      width={barWidth}
                      height={wkly2H}
                      fill="#E84855"
                      className="transition-all duration-300"
                    />

                    {/* Hover tooltips */}
                    <title>
                      {`${station.name}\nOverall CCTNS: ${station.cctnsOverall}%\nWeekly Metric 1: ${station.cctnsWkly1}%\nWeekly Metric 2: ${station.cctnsWkly2}%`}
                    </title>

                    {/* Floating score tags on group hover */}
                    <text
                      x={groupX + groupWidth / 2}
                      y={Math.min(overallY, wkly1Y) - 5}
                      fill="#1D1818"
                      fontSize="7"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                    >
                      {station.cctnsOverall}/{station.cctnsWkly1}/{station.cctnsWkly2}
                    </text>

                    {/* Station Name Label rotated */}
                    <text
                      x={groupX + groupWidth / 2}
                      y={height - paddingBottom + 10}
                      fill="#1D1818"
                      fontSize="7"
                      textAnchor="end"
                      transform={`rotate(-45, ${groupX + groupWidth / 2}, ${height - paddingBottom + 10})`}
                      className="origin-top-right uppercase"
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
        <span>* Showing {sortedStations.length} station compliance stacks.</span>
        <span>Operational Note: Critical weekly metrics highlight reporting gaps.</span>
      </div>
    </div>
  );
};
