/**
 * The 10 real F1 constructor teams used to seed demo data and drive the
 * per-team theme colors on the frontend. Driver lineups/points are
 * illustrative demo data, not live standings.
 */
export interface TeamSeedDefinition {
  slug: string;
  name: string;
  nationality: string;
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  foundedYear: number;
  principal: string;
  drivers: { name: string; number: number; nationality: string }[];
}

export const TEAM_SEED_DATA: TeamSeedDefinition[] = [
  {
    slug: 'mercedes',
    name: 'Mercedes-AMG Petronas F1 Team',
    nationality: 'German',
    colorPrimary: '#00D2BE',
    colorSecondary: '#000000',
    colorAccent: '#C0C0C0',
    foundedYear: 1954,
    principal: 'Toto Wolff',
    drivers: [
      { name: 'George Russell', number: 63, nationality: 'British' },
      { name: 'Kimi Antonelli', number: 12, nationality: 'Italian' },
    ],
  },
  {
    slug: 'red-bull-racing',
    name: 'Oracle Red Bull Racing',
    nationality: 'Austrian',
    colorPrimary: '#3671C6',
    colorSecondary: '#1E1E3F',
    colorAccent: '#DC0000',
    foundedYear: 2005,
    principal: 'Christian Horner',
    drivers: [
      { name: 'Max Verstappen', number: 1, nationality: 'Dutch' },
      { name: 'Liam Lawson', number: 30, nationality: 'New Zealander' },
    ],
  },
  {
    slug: 'ferrari',
    name: 'Scuderia Ferrari HP',
    nationality: 'Italian',
    colorPrimary: '#DC0000',
    colorSecondary: '#000000',
    colorAccent: '#FFF200',
    foundedYear: 1929,
    principal: 'Frédéric Vasseur',
    drivers: [
      { name: 'Charles Leclerc', number: 16, nationality: 'Monégasque' },
      { name: 'Lewis Hamilton', number: 44, nationality: 'British' },
    ],
  },
  {
    slug: 'mclaren',
    name: 'McLaren F1 Team',
    nationality: 'British',
    colorPrimary: '#FF8000',
    colorSecondary: '#000000',
    colorAccent: '#47C7FC',
    foundedYear: 1963,
    principal: 'Andrea Stella',
    drivers: [
      { name: 'Lando Norris', number: 4, nationality: 'British' },
      { name: 'Oscar Piastri', number: 81, nationality: 'Australian' },
    ],
  },
  {
    slug: 'aston-martin',
    name: 'Aston Martin Aramco F1 Team',
    nationality: 'British',
    colorPrimary: '#229971',
    colorSecondary: '#000000',
    colorAccent: '#C6A97D',
    foundedYear: 2021,
    principal: 'Andy Cowell',
    drivers: [
      { name: 'Fernando Alonso', number: 14, nationality: 'Spanish' },
      { name: 'Lance Stroll', number: 18, nationality: 'Canadian' },
    ],
  },
  {
    slug: 'alpine',
    name: 'BWT Alpine F1 Team',
    nationality: 'French',
    colorPrimary: '#0090FF',
    colorSecondary: '#FF1801',
    colorAccent: '#FFFFFF',
    foundedYear: 2021,
    principal: 'Oliver Oakes',
    drivers: [
      { name: 'Pierre Gasly', number: 10, nationality: 'French' },
      { name: 'Franco Colapinto', number: 43, nationality: 'Argentine' },
    ],
  },
  {
    slug: 'williams',
    name: 'Atlassian Williams Racing',
    nationality: 'British',
    colorPrimary: '#00A3E0',
    colorSecondary: '#041E42',
    colorAccent: '#FFFFFF',
    foundedYear: 1977,
    principal: 'James Vowles',
    drivers: [
      { name: 'Alex Albon', number: 23, nationality: 'Thai' },
      { name: 'Carlos Sainz', number: 55, nationality: 'Spanish' },
    ],
  },
  {
    slug: 'racing-bulls',
    name: 'Visa Cash App Racing Bulls F1 Team',
    nationality: 'Italian',
    colorPrimary: '#6692FF',
    colorSecondary: '#1E1E3F',
    colorAccent: '#C8102E',
    foundedYear: 1985,
    principal: 'Laurent Mekies',
    drivers: [
      { name: 'Yuki Tsunoda', number: 22, nationality: 'Japanese' },
      { name: 'Isack Hadjar', number: 6, nationality: 'French' },
    ],
  },
  {
    slug: 'kick-sauber',
    name: 'Stake F1 Team Kick Sauber',
    nationality: 'Swiss',
    colorPrimary: '#52E252',
    colorSecondary: '#000000',
    colorAccent: '#FFFFFF',
    foundedYear: 1993,
    principal: 'Mattia Binotto',
    drivers: [
      { name: 'Nico Hülkenberg', number: 27, nationality: 'German' },
      { name: 'Gabriel Bortoleto', number: 5, nationality: 'Brazilian' },
    ],
  },
  {
    slug: 'haas',
    name: 'MoneyGram Haas F1 Team',
    nationality: 'American',
    colorPrimary: '#B6BABD',
    colorSecondary: '#E10600',
    colorAccent: '#000000',
    foundedYear: 2016,
    principal: 'Ayao Komatsu',
    drivers: [
      { name: 'Esteban Ocon', number: 31, nationality: 'French' },
      { name: 'Oliver Bearman', number: 87, nationality: 'British' },
    ],
  },
];

export const TEAM_SLUGS = TEAM_SEED_DATA.map((t) => t.slug);
