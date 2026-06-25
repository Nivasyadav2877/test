import React, { useState, useMemo } from 'react';
import { StationData, PARAMETERS, SDPOType } from '../types';

interface SdpoParameterComparisonProps {
  allStations: StationData[];
}

export const SdpoParameterComparison: React.FC<SdpoParameterComparisonProps> = ({ allStations }) => {
  const [viewMode, setViewMode] = useState<'absolute' | 'rank'>('absolute');

  const sdpoNames: SDPOType[] = [
    'Jammalamadugu',
    'Kadapa',
    'Mydukur',
    'Proddatur',
    'Pulivendula',
    'Rajampet',
  ];

  // Colors for the 6 SDPOs to easily distinguish them
  const sdpoColors: Record<SDPOType, string> = {
    Jammalamadugu: '#1D1818', // ink
    Kadapa: '#FF9F1C',       // amber
    Mydukur: '#E84855',      // red / accent
    Proddatur: '#2EC4B6',     // green
    Pulivendula: '#8D99AE',   // muted gray-blue
    Rajampet: '#D81159',      // deep pink/ruby
  };

  // Compute parameter averages per SDPO
  const comparisonData = useMemo(() => {
    // 1. Calculate absolute averages
    const averages: Record<string, Record<SDPOType, number>> = {};
    
    PARAMETERS.forEach((p) => {
      averages[p.key] = {} as Record<SDPOType, number>;
      
      sdpoNames.forEach((sdpo) => {
        const matching = allStations.filter((s) => s.sdpo === sdpo);
        const sum = matching.reduce((acc, s) => acc + (s[p.key as keyof StationData] as number), 0);
        averages[p.key][sdpo] = matching.length > 0 ? parseFloat((sum / matching.length).toFixed(1)) : 0;
      });
    });

    // 2. Calculate ranks (1 is best, 6 is worst) per parameter
    const ranks: Record<string, Record<SDPOType, number>> = {};
    
    PARAMETERS.forEach((p) => {
      ranks[p.key] = {} as Record<SDPOType, number>;
      
      // Sort SDPOs by their score descending
      const sorted = [...sdpoNames]
        .map((sdpo) => ({ sdpo, score: averages[p.key][sdpo] }))
        .sort((a, b) => b.score - a.score);

      sorted.forEach((item, index) => {
        ranks[p.key][item.sdpo] = index + 1; // Rank 1 = best
      });
    });

    return { averages, ranks };
  }, [allStations]);

  // Chart rendering parameters
  const height = 240;
  const paddingLeft = 40;
  const paddingRight = 15;
  const paddingTop = 25;
  const paddingBottom = 45;

  const numParams = PARAMETERS.length;
  const numSdpos = sdpoNames.length;
  
  // Group metrics
  const barWidth = 4;
  const barSpacing = 1;
  const groupGap = 16;
  const groupWidth = (barWidth + barSpacing) * numSdpos;
  const width = numParams * (groupWidth + groupGap) + paddingLeft + paddingRight;

  const scaleYAbsolute = (score: number) => {
    const usableHeight = height - paddingTop - paddingBottom;
    return height - paddingBottom - (score / 100) * usableHeight;
  };

  const scaleYRank = (rank: number) => {
    const usableHeight = height - paddingTop - paddingBottom;
    // For ranks: Rank 1 (best) should have the tallest bar, Rank 6 (worst) should have the shortest bar.
    // Inverse scale: Rank 1 -> 100% height, Rank 6 -> 15% height
    const normalizedVal = ((7 - rank) / 6) * 100;
    return height - paddingBottom - (normalizedVal / 100) * usableHeight;
  };

  return (
    <div id="sdpo-parameter-comparison" className="border border-[#1D1818]/15 bg-[#F8F7F4] p-5 flex flex-col h-full justify-between relative">
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
          <div>
            <h3 className="text-sm font-bold font-display uppercase tracking-tight text-[#1D1818]">
              SDPO Cross-Parameter Evaluation
            </h3>
            <p className="text-[10px] text-[#1D1818]/60 mt-0.5 font-mono">
              Comparing Sub-Division averages on specific indexes side-by-side
            </p>
          </div>

          {/* Toggle buttons for absolute vs rank view */}
          <div className="flex border border-[#1D1818]/25 p-0.5 bg-white shrink-0">
            <button
              onClick={() => setViewMode('absolute')}
              className={`px-2 py-0.5 text-[8px] font-mono font-bold uppercase transition-all ${
                viewMode === 'absolute' ? 'bg-[#1D1818] text-[#F8F7F4]' : 'text-[#1D1818] hover:bg-black/5'
              }`}
            >
              Abs Score
            </button>
            <button
              onClick={() => setViewMode('rank')}
              className={`px-2 py-0.5 text-[8px] font-mono font-bold uppercase transition-all ${
                viewMode === 'rank' ? 'bg-[#1D1818] text-[#F8F7F4]' : 'text-[#1D1818] hover:bg-black/5'
              }`}
            >
              Rank Order
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 mb-4 border border-dashed border-[#1D1818]/10 p-2 font-mono text-[7.5px] uppercase font-bold bg-white/40">
          {sdpoNames.map((name) => (
            <div key={name} className="flex items-center space-x-1">
              <span className="w-2 h-2" style={{ backgroundColor: sdpoColors[name] }} />
              <span className="text-[#1D1818]">{name}</span>
            </div>
          ))}
        </div>

        {/* SVG Scroll Container */}
        <div className="overflow-x-auto border border-[#1D1818]/10 bg-white/40">
          <div style={{ width: `${width}px`, height: `${height}px` }} className="relative">
            <svg width={width} height={height} className="block select-none font-mono">
              {/* Grid Lines */}
              {viewMode === 'absolute' ? (
                [25, 50, 75, 100].map((level) => {
                  const y = scaleYAbsolute(level);
                  return (
                    <g key={level} className="opacity-15">
                      <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#1D1818" strokeWidth="0.5" strokeDasharray="1,2" />
                      <text x={paddingLeft - 8} y={y + 3} fill="#1D1818" fontSize="8" textAnchor="end" className="font-bold">{level}%</text>
                    </g>
                  );
                })
              ) : (
                [1, 2, 3, 4, 5, 6].map((r) => {
                  const y = scaleYRank(r);
                  return (
                    <g key={r} className="opacity-15">
                      <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#1D1818" strokeWidth="0.5" strokeDasharray="1,2" />
                      <text x={paddingLeft - 8} y={y + 3} fill="#1D1818" fontSize="8" textAnchor="end" className="font-bold">R#{r}</text>
                    </g>
                  );
                })
              )}

              {/* Render metrics group */}
              {PARAMETERS.map((p, pIndex) => {
                const groupX = paddingLeft + pIndex * (groupWidth + groupGap);

                return (
                  <g key={p.key}>
                    {/* Render a bar for each SDPO */}
                    {sdpoNames.map((sdpo, sdpoIndex) => {
                      const barX = groupX + sdpoIndex * (barWidth + barSpacing);
                      
                      const score = comparisonData.averages[p.key][sdpo];
                      const rank = comparisonData.ranks[p.key][sdpo];

                      const y = viewMode === 'absolute' ? scaleYAbsolute(score) : scaleYRank(rank);
                      const barHeight = Math.max(height - paddingBottom - y, 2);

                      return (
                        <g key={sdpo}>
                          <rect
                            x={barX}
                            y={y}
                            width={barWidth}
                            height={barHeight}
                            fill={sdpoColors[sdpo]}
                            className="transition-all duration-300 hover:opacity-80"
                          />
                          <title>
                            {`${sdpo} Sub-Division\nParameter: ${p.label}\nAvg Score: ${score}%\nRank: #${rank} / 6`}
                          </title>
                        </g>
                      );
                    })}

                    {/* Group Label (Parameter name rotated or tight) */}
                    <text
                      x={groupX + groupWidth / 2}
                      y={height - paddingBottom + 12}
                      fill="#1D1818"
                      fontSize="7.5"
                      fontWeight="bold"
                      textAnchor="end"
                      transform={`rotate(-35, ${groupX + groupWidth / 2}, ${height - paddingBottom + 12})`}
                      className="origin-top-right uppercase font-bold"
                    >
                      {p.label.substring(0, 15)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      <div className="mt-3 text-[8px] font-mono text-[#1D1818]/50 flex justify-between">
        <span>* Horizontal scroll of 9 smart performance channels.</span>
        <span>Rank View: Tallest represents Rank #1 (best). Shortest is Rank #6 (worst).</span>
      </div>
    </div>
  );
};
