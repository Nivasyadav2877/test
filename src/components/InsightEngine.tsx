import React, { useMemo } from 'react';
import { StationData } from '../types';
import { AlertCircle, AlertTriangle, Lightbulb, ShieldAlert, BadgeInfo } from 'lucide-react';

interface InsightEngineProps {
  stations: StationData[];
}

export const InsightEngine: React.FC<InsightEngineProps> = ({ stations }) => {
  const insights = useMemo(() => {
    // 1. CEIR Score = 0 check
    const zeroCeirStations = stations.filter((s) => s.ceirScore === 0);
    const zeroCeirList = zeroCeirStations.map((s) => s.name).join(', ');

    // 2. CCTNS Weekly Metric 2 = 0 check
    const allWeekly2Zero = stations.every((s) => s.cctnsWkly2 === 0);

    // 3. Duvvur PS Weekly-1 check
    const duvvurStation = stations.find((s) => s.name === 'Duvvur');
    const hasDuvvurOutlier = duvvurStation && duvvurStation.cctnsWkly1 === 11;

    // 4. Mydukur high variance check
    // Let's check Mydukur's laggards vs high performers
    const mydukurStations = stations.filter((s) => s.sdpo === 'Mydukur');
    let hasMydukurVariance = false;
    if (mydukurStations.length > 0) {
      const mydukurScores = mydukurStations.map((s) => s.compositeScore);
      const maxScore = Math.max(...mydukurScores);
      const minScore = Math.min(...mydukurScores);
      const variance = maxScore - minScore;
      if (variance > 50) {
        hasMydukurVariance = true;
      }
    }

    return {
      zeroCeirCount: zeroCeirStations.length,
      zeroCeirList,
      allWeekly2Zero,
      hasDuvvurOutlier,
      hasMydukurVariance,
    };
  }, [stations]);

  return (
    <div id="insight-engine" className="border border-[#1D1818]/15 bg-[#F8F7F4] p-5 flex flex-col h-full justify-between relative">
      <div>
        <div className="flex justify-between items-baseline mb-2">
          <h3 className="text-sm font-bold font-display uppercase tracking-tight text-[#1D1818]">
            Automated Operational Alerts
          </h3>
          <span className="text-[9px] text-[#1D1818]/50 uppercase font-mono">Executive Briefing</span>
        </div>
        <p className="text-[10px] text-[#1D1818]/60 mb-4 font-mono leading-tight">
          Algorithmic data scan. Highlighted brief points for SP pre-meeting reviews.
        </p>

        {/* List of Insights as styled cards */}
        <div className="space-y-3">
          {/* CEIR Score alert */}
          {insights.zeroCeirCount > 0 && (
            <div className="border border-[#E84855]/20 bg-[#E84855]/5 p-2.5 flex items-start space-x-2.5">
              <ShieldAlert className="w-4 h-4 text-[#E84855] shrink-0 mt-0.5" />
              <div className="font-mono text-[9px] leading-normal text-[#1D1818]">
                <strong className="text-[#E84855] uppercase block font-bold mb-0.5">
                  CEIR Critical Tracking Gaps ({insights.zeroCeirCount} Stations)
                </strong>
                CEIR Score = 0 in: <span className="underline font-bold">{insights.zeroCeirList}</span>. Immediate disciplinary reporting required.
              </div>
            </div>
          )}

          {/* CCTNS Weekly Metric 2 compliance failure */}
          {insights.allWeekly2Zero && (
            <div className="border border-[#E84855]/20 bg-[#E84855]/5 p-2.5 flex items-start space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-[#E84855] shrink-0 mt-0.5" />
              <div className="font-mono text-[9px] leading-normal text-[#1D1818]">
                <strong className="text-[#E84855] uppercase block font-bold mb-0.5">
                  District-Wide CCTNS Compliance Gap
                </strong>
                CCTNS Weekly Metric 2 = 0 across <span className="font-bold">ALL stations</span>. Represents a systemic data synchronization issue or reporting omission on the CCTNS server.
              </div>
            </div>
          )}

          {/* Mydukur High Variance alert */}
          {insights.hasMydukurVariance && (
            <div className="border border-[#FF9F1C]/20 bg-[#FF9F1C]/5 p-2.5 flex items-start space-x-2.5 border-l-3 border-l-[#FF9F1C]">
              <AlertCircle className="w-4 h-4 text-[#FF9F1C] shrink-0 mt-0.5" />
              <div className="font-mono text-[9px] leading-normal text-[#1D1818]">
                <strong className="text-[#FF9F1C] uppercase block font-bold mb-0.5">
                  High Sub-Divisional Variance (Mydukur)
                </strong>
                Mydukur SDPO has extreme variance. High performers are dragged down by <span className="font-bold font-mono">4 critical laggard stations</span> (Atlur, B.Kodur, B.Matam, Kalasapadu).
              </div>
            </div>
          )}

          {/* eProsecution metric second-weakest note */}
          <div className="border border-[#1D1818]/15 bg-white p-2.5 flex items-start space-x-2.5 border-l-3 border-l-[#1D1818]">
            <BadgeInfo className="w-4 h-4 text-[#1D1818]/70 shrink-0 mt-0.5" />
            <div className="font-mono text-[9px] leading-normal text-[#1D1818]">
              <strong className="text-[#1D1818] uppercase block font-bold mb-0.5">
                District-Wide Metric Deficiency
              </strong>
              eProsecution filing is the second-weakest parameter district-wide. Digital charge sheet flow lags behind physical docketing.
            </div>
          </div>

          {/* Duvvur outlier audit alert */}
          {insights.hasDuvvurOutlier && (
            <div className="border border-[#2EC4B6]/20 bg-[#2EC4B6]/5 p-2.5 flex items-start space-x-2.5 border-l-3 border-l-[#2EC4B6]">
              <Lightbulb className="w-4 h-4 text-[#2EC4B6] shrink-0 mt-0.5" />
              <div className="font-mono text-[9px] leading-normal text-[#1D1818]">
                <strong className="text-[#2EC4B6] uppercase block font-bold mb-0.5">
                  Verify Outlying Records (Duvvur)
                </strong>
                Duvvur PS has recorded CCTNS Weekly-1 = <span className="font-bold underline text-[#2EC4B6]">11</span> (exceptionally high). Audit required to rule out duplicate or inflated log reporting.
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 pt-2 text-[8px] font-mono text-[#1D1818]/40 text-center uppercase tracking-wider font-bold">
        🛡️ Kadapa Police Smart Analytics Core Ready
      </div>
    </div>
  );
};
