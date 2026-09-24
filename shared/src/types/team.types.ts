import type { ID } from './common.types';

export interface TeamDriverDTO {
  name: string;
  number: number;
  nationality: string;
}

export interface TeamDTO {
  id: ID;
  name: string;
  slug: string;
  nationality: string;
  logoUrl?: string;
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  description?: string;
  foundedYear: number;
  principal?: string;
  drivers: TeamDriverDTO[];
  isActive: boolean;
}
