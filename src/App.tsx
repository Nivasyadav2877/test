import React, { useState, useEffect, useMemo } from 'react';
import { STATION_DATASET, DISTRICT_AVERAGES } from './data';
import { PARAMETERS, StationData } from './types';

// Component Imports
import { CommandSummary } from './components/CommandSummary';
import { Leaderboard } from './components/Leaderboard';
import { StationScores } from './components/StationScores';
import { ParameterHeatmap } from './components/ParameterHeatmap';
import { RadarProfile } from './components/RadarProfile';
import { CctnsDeepDive } from './components/CctnsDeepDive';
import { ScatterPlot } from './components/ScatterPlot';
import { CitizenCompliance } from './components/CitizenCompliance';
import { StationDetail } from './components/StationDetail';
import { InsightEngine } from './components/InsightEngine';
import { SdpoParameterComparison } from './components/SdpoParameterComparison';
import { LeagueTable } from './components/LeagueTable';

// Icon Imports
import {
  RefreshCw,
  Download,
  Printer,
  Shield,
  Filter,
  AlertTriangle,
  Layers,
  Sliders,
  HelpCircle
} from 'lucide-react';

export default function App() {
  // Global Filters State
  const [selectedSdpo, setSelectedSdpo] = useState<string>('All');
  const [selectedParameter, setSelectedParameter] = useState<string>('All');
  const [scoreThreshold, setScoreThreshold] = useState<number>(100);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);

  // Loading States (Visual Skeletons)
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Artificial load to showcase skeleton loaders
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 750);
    return () => clearTimeout(timer);
  }, []);

  // Filter dataset dynamically based on active filters
  const filteredStations = useMemo(() => {
    return STATION_DATASET.filter((s) => {
      // 1. SDPO division filter
      if (selectedSdpo !== 'All' && s.sdpo !== selectedSdpo) return false;

      // 2. Score slider filter
      if (s.compositeScore > scoreThreshold) return false;

      // 3. Optional parameter selection highlighted filter (if we want to filter out stations with 0 or low value on selected param, or simply highlight, we can let everything through and handle highlighting inside, or filter when a threshold is selected)
      return true;
    });
  }, [selectedSdpo, scoreThreshold]);

  // Set default selected station when division filters change or initial load
  useEffect(() => {
    if (filteredStations.length > 0) {
      // If current selected station is not in the filtered set, reset to the first one in the filtered set
      const stillValid = filteredStations.some((s) => s.id === selectedStationId);
      if (!stillValid) {
        setSelectedStationId(filteredStations[0].id);
      }
    } else {
      setSelectedStationId(null);
    }
  }, [filteredStations, selectedStationId]);

  // Reset all filters function
  const handleResetFilters = () => {
    setSelectedSdpo('All');
    setSelectedParameter('All');
    setScoreThreshold(100);
    if (STATION_DATASET.length > 0) {
      setSelectedStationId(STATION_DATASET[0].id);
    }
  };

  // CSV Export utility
  const handleExportCSV = () => {
    const headers = ['Station', 'Sub-Division', 'DGP Dashboard', 'CCTNS Overall', 'CCTNS Wkly-1', 'CCTNS Wkly-2', 'Zero FIRs', 'Citizen Portal', 'eSakshya SID%', 'CEIR Score', 'eProsecution', 'Composite Score'];
    const rows = filteredStations.map(s => [
      s.name,
      s.sdpo,
      s.dgpDashboard,
      s.cctnsOverall,
      s.cctnsWkly1,
      s.cctnsWkly2,
      s.zeroFirs,
      s.citizenPortal,
      s.eSakshya,
      s.ceirScore,
      s.eProsecution,
      s.compositeScore
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `YSR_Kadapa_Smart_Policing_Report_${selectedSdpo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Printable briefing sheet
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1D1818] p-4 md:p-6 flex flex-col font-mono select-none">
      
      {/* HEADER BAR (Custom Swiss Aesthetic) */}
      <header className="border-b-2 border-[#1D1818] pb-4 mb-6 flex flex-col md:flex-row justify-between items-baseline gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Shield className="w-5 h-5 text-[#E84855] fill-[#E84855]/10" />
            <span className="text-[10px] tracking-widest uppercase font-bold text-[#1D1818]/60">
              POLICE HEADQUARTERS &bull; AP SMART POLICING INITIATIVE
            </span>
          </div>
          <h1 className="font-display font-black text-2xl md:text-3xl text-[#1D1818] leading-none uppercase tracking-tight">
            YSR KADAPA DISTRICT COMMAND CENTER
          </h1>
          <p className="text-[10px] text-[#1D1818]/60 mt-1 font-mono uppercase">
            Superintendent of Police (SP) Executive Performance Benchmarking Dashboard
          </p>
        </div>
        
        {/* Version marker & Quick actions */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-[9px] w-full md:w-auto justify-end">
          <div className="px-2 py-1 border border-[#1D1818]/15 bg-white text-[#1D1818]/60 font-bold uppercase tracking-wider">
            [v.1.1.0]
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1 border border-[#1D1818] hover:bg-[#1D1818] hover:text-[#F8F7F4] transition-colors font-bold uppercase"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT DATA</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1 border border-[#1D1818] bg-[#1D1818] text-[#F8F7F4] hover:bg-[#E84855] hover:border-[#E84855] transition-colors font-bold uppercase"
            title="Print Summary"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PRINT BRIEF</span>
          </button>
        </div>
      </header>

      {/* SKELETON LOADER SCREEN */}
      {isLoading ? (
        <div className="flex-1 flex flex-col justify-center items-center py-24 font-mono text-xs">
          <RefreshCw className="w-8 h-8 text-[#E84855] animate-spin mb-4" />
          <span className="font-bold uppercase tracking-wider text-[#1D1818]">
            Compiling district policing aggregates...
          </span>
          <span className="text-[10px] text-[#1D1818]/50 mt-1">
            Reindexing 56 Stations and calculating weights &amp; ranks
          </span>
        </div>
      ) : (
        <div className="flex-1 grid grid-columns-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* SIDEBAR - STICKY GLOBAL FILTERS & BRIEFING DETAIL CARD (Cols: 3) */}
          <aside className="lg:col-span-3 flex flex-col gap-6 lg:sticky lg:top-4 h-auto">
            
            {/* Filter Panel */}
            <div className="border border-[#1D1818]/15 bg-white p-5 flex flex-col gap-4 relative">
              <div className="flex justify-between items-center border-b border-[#1D1818]/15 pb-2.5">
                <span className="text-[10px] font-bold text-[#1D1818]/60 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <Filter className="w-3.5 h-3.5" /> Control Parameters
                </span>
                <button
                  onClick={handleResetFilters}
                  className="text-[8px] font-bold text-[#E84855] hover:underline uppercase flex items-center gap-1"
                >
                  <RefreshCw className="w-2.5 h-2.5" /> Reset
                </button>
              </div>

              {/* SDPO Dropdown */}
              <div className="flex flex-col gap-1">
                <label className="text-[8.5px] font-bold text-[#1D1818]/60 uppercase font-mono">
                  Sub-Division Filter (SDPO)
                </label>
                <select
                  value={selectedSdpo}
                  onChange={(e) => setSelectedSdpo(e.target.value)}
                  className="w-full bg-[#F8F7F4] border border-[#1D1818]/25 p-2 text-xs font-mono font-bold focus:outline-none focus:border-[#E84855] text-[#1D1818] uppercase"
                >
                  <option value="All">All Sub-Divisions (District)</option>
                  <option value="Jammalamadugu">Jammalamadugu SDPO</option>
                  <option value="Kadapa">Kadapa SDPO</option>
                  <option value="Mydukur">Mydukur SDPO</option>
                  <option value="Proddatur">Proddatur SDPO</option>
                  <option value="Pulivendula">Pulivendula SDPO</option>
                  <option value="Rajampet">Rajampet SDPO</option>
                </select>
              </div>

              {/* Parameter Selection Highlighter */}
              <div className="flex flex-col gap-1">
                <label className="text-[8.5px] font-bold text-[#1D1818]/60 uppercase font-mono">
                  Indicator Focus
                </label>
                <select
                  value={selectedParameter}
                  onChange={(e) => setSelectedParameter(e.target.value)}
                  className="w-full bg-[#F8F7F4] border border-[#1D1818]/25 p-2 text-xs font-mono font-bold focus:outline-none focus:border-[#E84855] text-[#1D1818] uppercase"
                >
                  <option value="All">All Parameters</option>
                  {PARAMETERS.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.label} (w:{p.weight})
                    </option>
                  ))}
                </select>
              </div>

              {/* Score Threshold Slider */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-baseline">
                  <label className="text-[8.5px] font-bold text-[#1D1818]/60 uppercase font-mono">
                    Score Threshold
                  </label>
                  <span className="text-xs font-bold text-[#E84855] font-mono">
                    &le; {scoreThreshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={scoreThreshold}
                  onChange={(e) => setScoreThreshold(parseInt(e.target.value))}
                  className="w-full accent-[#E84855] bg-neutral-200 h-1.5 focus:outline-none"
                />
                <div className="flex justify-between text-[7px] font-mono text-neutral-400">
                  <span>30% Critically Low</span>
                  <span>100% Perfect</span>
                </div>
              </div>

              {/* Weighted Formula display */}
              <div className="border border-dashed border-[#1D1818]/15 p-2 bg-[#F8F7F4] rounded-sm font-mono text-[7px] text-[#1D1818]/70 leading-relaxed">
                <strong className="text-[8px] uppercase block mb-0.5 font-bold">Weighted Formula:</strong>
                Composite = &Sigma;(Score &times; Weight) / &Sigma;(Weights = 0.40)
              </div>
            </div>

            {/* Station Detail Panel (Always visible in sidebar once a station is selected!) */}
            <div className="flex-1">
              <StationDetail
                selectedStationId={selectedStationId}
                allStations={STATION_DATASET}
                onClose={() => {}}
              />
            </div>
          </aside>

          {/* MAIN GRID - PANELS & CHARTS (Cols: 9) */}
          <main className="lg:col-span-9 flex flex-col gap-6">
            
            {/* PANEL 1: District Command Summary top bar */}
            <CommandSummary
              filteredStations={filteredStations}
              allStations={STATION_DATASET}
            />

            {/* 1st Grid block: Leaderboard, Station composite score chart */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Panel 2: Leaderboard */}
              <div className="md:col-span-5 h-full">
                <Leaderboard
                  allStations={STATION_DATASET}
                  selectedSdpo={selectedSdpo}
                  onSelectSdpo={setSelectedSdpo}
                />
              </div>

              {/* Panel 3: Station Scores */}
              <div className="md:col-span-7 h-full">
                <StationScores
                  stations={filteredStations}
                  districtAverage={DISTRICT_AVERAGES.composite}
                  selectedStationId={selectedStationId}
                  onSelectStation={setSelectedStationId}
                  scoreThreshold={scoreThreshold}
                />
              </div>
            </div>

            {/* 2nd Grid block: Matrix Heatmap & Radar profile side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Panel 4: Heatmap */}
              <div className="md:col-span-8 h-full">
                <ParameterHeatmap
                  stations={filteredStations}
                  selectedStationId={selectedStationId}
                  onSelectStation={setSelectedStationId}
                />
              </div>

              {/* Panel 5: Radar Spider chart */}
              <div className="md:col-span-4 h-full">
                <RadarProfile
                  stations={filteredStations.length > 0 ? filteredStations : STATION_DATASET}
                  selectedStationId={selectedStationId}
                  onSelectStation={setSelectedStationId}
                  districtAverages={DISTRICT_AVERAGES}
                />
              </div>
            </div>

            {/* 3rd Grid block: CCTNS Deep Dive & eSakshya/CEIR Scatter Plot */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Panel 6: CCTNS deep dive grouped chart */}
              <div className="md:col-span-6 h-full">
                <CctnsDeepDive stations={filteredStations} />
              </div>

              {/* Panel 7: eSakshya & CEIR Scatter Plot */}
              <div className="md:col-span-6 h-full">
                <ScatterPlot
                  stations={filteredStations.length > 0 ? filteredStations : STATION_DATASET}
                  eSakshyaAverage={DISTRICT_AVERAGES.eSakshya}
                  ceirAverage={DISTRICT_AVERAGES.ceirScore}
                  selectedStationId={selectedStationId}
                  onSelectStation={setSelectedStationId}
                />
              </div>
            </div>

            {/* 4th Grid block: Citizen Portal Compliance & Insight Engine */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Panel 8: Citizen Portal compliance donut & list */}
              <div className="md:col-span-5 h-full">
                <CitizenCompliance
                  stations={filteredStations.length > 0 ? filteredStations : STATION_DATASET}
                  onSelectStation={setSelectedStationId}
                />
              </div>

              {/* Panel 10: Insight Engine briefing sheet */}
              <div className="md:col-span-7 h-full">
                <InsightEngine stations={filteredStations.length > 0 ? filteredStations : STATION_DATASET} />
              </div>
            </div>

            {/* 5th Grid block: SDPO comparison chart & Top/Bottom League Tables */}
            <div className="grid grid-cols-1 gap-6">
              {/* Panel 11: SDPO vs SDPO comparison stack */}
              <SdpoParameterComparison allStations={STATION_DATASET} />

              {/* Panel 12: Bottom 5 / Top 5 league list */}
              <LeagueTable
                stations={filteredStations}
                selectedStationId={selectedStationId}
                onSelectStation={setSelectedStationId}
              />
            </div>

          </main>
        </div>
      )}

      {/* FOOTER BAR */}
      <footer className="border-t border-[#1D1818] mt-12 pt-4 flex flex-col md:flex-row justify-between items-center text-[8px] uppercase tracking-wider text-[#1D1818]/60 gap-3 font-mono">
        <div className="flex items-center gap-1.5 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>POLICING SERVICES SYNCED &bull; OK</span>
        </div>
        <div>
          DISTRICT: YSR KADAPA, ANDHRA PRADESH &bull; LATITUDE: 14.4712° N, LONGITUDE: 78.8243° E
        </div>
        <div className="text-right">
          S.P. OFFICE ANALYTICS DIVISION &copy; 2026
        </div>
      </footer>

    </div>
  );
}
