import type { Role } from '../constants/roles';
import type { ID } from './common.types';

export interface Address {
  _id?: ID;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface UserDTO {
  id: ID;
  name: string;
  email: string;
  role: Role;
  team?:
    | ID
    | {
        id: ID;
        name: string;
        slug: string;
        colorPrimary?: string;
        colorSecondary?: string;
        colorAccent?: string;
        logoUrl?: string;
      }
    | null;
  isApproved: boolean;
  isActive: boolean;
  addresses: Address[];
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  accessTokenExpiresAt: string;
}

export interface AuthResponse {
  user: UserDTO;
  tokens: AuthTokens;
}

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export interface RegisterRaceTeamInput extends RegisterUserInput {
  teamId: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
