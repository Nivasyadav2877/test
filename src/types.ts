export interface StationData {
  id: string;
  name: string;
  sdpo: string; // Jammalamadugu, Kadapa, Mydukur, Proddatur, Pulivendula, Rajampet
  dgpDashboard: number; // 0 - 100
  cctnsOverall: number; // 0 - 100
  cctnsWkly1: number; // 0 - 100 (except Duvvur has 11 for special note/CCTNS metric) Let's make it standard 0-100 or metric specific
  cctnsWkly2: number; // 0 - 100
  zeroFirs: number; // 0 - 100
  citizenPortal: number; // 0 - 100
  eSakshya: number; // 0 - 100
  ceirScore: number; // 0 - 100
  eProsecution: number; // 0 - 100
  compositeScore: number; // Weighted composite score scaled out of 100
}

export type SDPOType = 'Jammalamadugu' | 'Kadapa' | 'Mydukur' | 'Proddatur' | 'Pulivendula' | 'Rajampet';

export interface DashboardFilters {
  sdpo: string; // 'All' | SDPOType
  selectedParameter: string; // 'All' | keyof StationData parameters
  scoreThreshold: number; // 0 - 100
}

export const PARAMETERS = [
  { key: 'dgpDashboard', label: 'DGP Dashboard', weight: 0.05, desc: 'Compliance & data entry on DGP portal' },
  { key: 'cctnsOverall', label: 'CCTNS Overall', weight: 0.05, desc: 'Overall score on Crime & Criminal Tracking Network System' },
  { key: 'cctnsWkly1', label: 'CCTNS Weekly M1', weight: 0.025, desc: 'Weekly CCTNS update compliance' },
  { key: 'cctnsWkly2', label: 'CCTNS Weekly M2', weight: 0.025, desc: 'Weekly CCTNS data quality metric' },
  { key: 'zeroFirs', label: 'Zero FIRs', weight: 0.05, desc: 'Stations with zero unregistered FIRs (100 = perfect)' },
  { key: 'citizenPortal', label: 'Citizen Portal', weight: 0.05, desc: 'Citizen service portal usage and response score' },
  { key: 'eSakshya', label: 'eSakshya SID%', weight: 0.05, desc: 'Digital evidence submission (eSakshya app) rate' },
  { key: 'ceirScore', label: 'CEIR Score', weight: 0.05, desc: 'CEIR (mobile tracking system) utilization score' },
  { key: 'eProsecution', label: 'eProsecution', weight: 0.05, desc: 'Digital case prosecution filing score' },
] as const;

export const SUM_OF_WEIGHTS = 0.40;
