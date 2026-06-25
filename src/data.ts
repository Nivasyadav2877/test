import { StationData, PARAMETERS, SUM_OF_WEIGHTS } from './types';

// Raw definitions of police stations by SDPO
const rawStations: { sdpo: string; names: string[] }[] = [
  {
    sdpo: 'Jammalamadugu',
    names: [
      'Jammalamadugu UPS',
      'Muddanur UPS',
      'Yerraguntla UPS',
      'Mylavaram', // Will have CEIR = 0
      'Peddamudium',
      'Talamanchipatnam',
      'Kondapuram',
      'Tallaproddatur',
      'Kalamalla',
    ],
  },
  {
    sdpo: 'Kadapa',
    names: [
      'CCS Kadapa',
      'Chennur UPS',
      'Chinna Chowk UPS',
      'Chintakomma Dinne UPS',
      'Kadapa I Town',
      'Kadapa II Town',
      'Kadapa Rural',
      'Kadapa Traffic',
      'RIMS UPS',
      'Gangireddipalli',
      'Pendlimarri', // Will have CEIR = 0
      'Kamalapuram',
      'Vallur',
    ],
  },
  {
    sdpo: 'Mydukur',
    names: [
      'Badvel UPS',
      'Khajipet UPS',
      'Mydukur UPS',
      'Atlur', // Laggard 1
      'B.Kodur', // Laggard 2
      'Badvel Rural',
      'B.Matam', // Laggard 3
      'Chapadu',
      'Duvvur', // Has CCTNS Weekly 1 = 11 (verify accuracy)
      'Kalasapadu', // Laggard 4
      'Porumamilla',
      'S.A.Kasinayana',
    ],
  },
  {
    sdpo: 'Proddatur',
    names: [
      'Proddatur I Town',
      'Proddatur II Town',
      'Proddatur III Town',
      'Proddatur Traffic',
      'Proddatur Rural',
      'Rajupalem',
    ],
  },
  {
    sdpo: 'Pulivendula',
    names: [
      'Pulivendula Traffic',
      'Pulivendula UPS', // Citizen portal = 97.8
      'Vempalli UPS',
      'Lingala',
      'Simhadripuram',
      'Thondur', // Will have CEIR = 0
      'Chekrayapet',
      'RK Valley',
      'Vemula',
    ],
  },
  {
    sdpo: 'Rajampet',
    names: [
      'Mannur UPS', // Citizen portal = 94.1
      'Rajampet UPS',
      'T.Sundupalli',
      'Veeraballi',
      'Nandalur',
      'Sidhout',
      'Vontimitta', // Citizen portal = 90.9
    ],
  },
];

// Seed data function to generate realistic and precise performance numbers
const STATION_TARGET_SCORES: Record<string, number> = {
  // Rajampet (7 stations, sum = 484.4, avg = 69.2)
  'mannur-ups': 65.5,
  'rajampet-ups': 73.2,
  't-sundupalli': 68.4,
  'veeraballi': 69.8,
  'nandalur': 71.0,
  'sidhout': 70.5,
  'vontimitta': 66.0,

  // Kadapa (13 stations, sum = 882.7, avg = 67.9)
  'ccs-kadapa': 70.2,
  'chennur-ups': 68.5,
  'chinna-chowk-ups': 74.0,
  'chintakomma-dinne-ups': 65.8,
  'kadapa-i-town': 71.5,
  'kadapa-ii-town': 69.2,
  'kadapa-rural': 68.0,
  'kadapa-traffic': 64.0,
  'rims-ups': 67.5,
  'gangireddipalli': 66.2,
  'pendlimarri': 61.3,
  'kamalapuram': 68.5,
  'vallur': 68.0,

  // Pulivendula (9 stations, sum = 595.8, avg = 66.2)
  'pulivendula-traffic': 65.2,
  'pulivendula-ups': 69.8,
  'vempalli-ups': 68.5,
  'lingala': 67.2,
  'simhadripuram': 66.0,
  'thondur': 61.4,
  'chekrayapet': 64.8,
  'rk-valley': 70.5,
  'vemula': 62.4,

  // Jammalamadugu (9 stations, sum = 591.3, avg = 65.7)
  'jammalamadugu-ups': 70.5,
  'muddanur-ups': 68.2,
  'yerraguntla-ups': 72.0,
  'mylavaram': 56.4,
  'peddamudium': 63.5,
  'talamanchipatnam': 62.8,
  'kondapuram': 64.2,
  'tallaproddatur': 65.5,
  'kalamalla': 68.2,

  // Proddatur (6 stations, sum = 393.6, avg = 65.6)
  'proddatur-i-town': 71.2,
  'proddatur-ii-town': 68.5,
  'proddatur-iii-town': 69.0,
  'proddatur-traffic': 55.4,
  'proddatur-rural': 65.5,
  'rajupalem': 64.0,

  // Mydukur (12 stations, sum = 750.0, avg = 62.5)
  'atlur': 44.5,
  'b-kodur': 45.0,
  'b-matam': 46.0,
  'kalasapadu': 46.5,
  'badvel-ups': 78.5,
  'khajipet-ups': 74.0,
  'mydukur-ups': 76.5,
  'badvel-rural': 68.0,
  'chapadu': 67.5,
  'duvvur': 66.5,
  'porumamilla': 71.0,
  's-a-kasinayana': 66.0
};

const generateStationData = (): StationData[] => {
  const stations: StationData[] = [];

  rawStations.forEach(({ sdpo, names }) => {
    names.forEach((name) => {
      const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const targetScore = STATION_TARGET_SCORES[id] || 65.0;

      // 1. Fixed / constrained parameters
      const cctnsWkly1 = name === 'Duvvur' ? 11 : ((id.charCodeAt(0) % 3) + 2);
      const cctnsWkly2 = 0;

      let citizenPortal = 100;
      if (name === 'Mannur UPS') {
        citizenPortal = 94.1;
      } else if (name === 'Pulivendula UPS') {
        citizenPortal = 97.8;
      } else if (name === 'Vontimitta') {
        citizenPortal = 90.9;
      }

      const zeroFirs = targetScore < 50 ? 60 : 100;

      // Determine ceirScore fixed or not
      const isCeirZero = name === 'Mylavaram' || name === 'Pendlimarri' || name === 'Thondur';
      const ceirScoreFixed = isCeirZero ? 0 : null;

      // Equation:
      // dgpDashboard + cctnsOverall + eSakshya + ceirScore + eProsecution = 8 * targetScore - (zeroFirs + citizenPortal) - 0.5 * cctnsWkly1
      const targetSum = 8 * targetScore - (zeroFirs + citizenPortal) - 0.5 * cctnsWkly1;

      // Proportional weights for the flexible parameters
      // DGP Dashboard and CCTNS are higher, eProsecution is lower
      const weights: Record<string, number> = {
        dgpDashboard: 1.25,
        cctnsOverall: 1.2,
        eSakshya: 0.9,
        eProsecution: 0.75,
      };
      if (ceirScoreFixed === null) {
        weights.ceirScore = 1.0;
      }

      const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

      // Distribute proportionally
      const flexValues: Record<string, number> = {};
      Object.entries(weights).forEach(([key, w]) => {
        flexValues[key] = Math.round((w / totalWeight) * targetSum);
      });

      // Calculate difference and adjust one parameter (e.g. eSakshya) to match the target sum exactly
      const currentSum = Object.values(flexValues).reduce((a, b) => a + b, 0);
      const diff = targetSum - currentSum;
      flexValues.eSakshya = parseFloat((flexValues.eSakshya + diff).toFixed(1));

      // Extract values
      const dgpDashboard = flexValues.dgpDashboard;
      const cctnsOverall = flexValues.cctnsOverall;
      const eSakshya = flexValues.eSakshya;
      const ceirScore = ceirScoreFixed !== null ? ceirScoreFixed : flexValues.ceirScore;
      const eProsecution = flexValues.eProsecution;

      // Calculate composite score based on the weighted sum
      const weightedSum =
        dgpDashboard * 0.05 +
        cctnsOverall * 0.05 +
        cctnsWkly1 * 0.025 +
        cctnsWkly2 * 0.025 +
        zeroFirs * 0.05 +
        citizenPortal * 0.05 +
        eSakshya * 0.05 +
        ceirScore * 0.05 +
        eProsecution * 0.05;

      const compositeScore = parseFloat(((weightedSum / SUM_OF_WEIGHTS)).toFixed(1));

      stations.push({
        id,
        name,
        sdpo,
        dgpDashboard,
        cctnsOverall,
        cctnsWkly1,
        cctnsWkly2,
        zeroFirs,
        citizenPortal,
        eSakshya,
        ceirScore,
        eProsecution,
        compositeScore,
      });
    });
  });

  return stations;
};

export const STATION_DATASET = generateStationData();

// Pre-calculated district averages for reference
export const getDistrictAverages = (): Record<string, number> => {
  const averages: Record<string, number> = {};
  const totalStations = STATION_DATASET.length;

  PARAMETERS.forEach((p) => {
    const sum = STATION_DATASET.reduce((acc, s) => acc + (s[p.key as keyof StationData] as number), 0);
    averages[p.key] = parseFloat((sum / totalStations).toFixed(1));
  });

  const compositeSum = STATION_DATASET.reduce((acc, s) => acc + s.compositeScore, 0);
  averages['composite'] = parseFloat((compositeSum / totalStations).toFixed(1));

  return averages;
};

export const DISTRICT_AVERAGES = getDistrictAverages();
