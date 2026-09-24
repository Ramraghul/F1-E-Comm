import { Schema, model, type Document, Types } from 'mongoose';
import { applyToJSON } from '../utils/toJSON';

export interface ITeamDriver {
  name: string;
  number: number;
  nationality: string;
}

export interface ITeam extends Document {
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
  drivers: ITeamDriver[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const driverSchema = new Schema<ITeamDriver>(
  {
    name: { type: String, required: true, trim: true },
    number: { type: Number, required: true },
    nationality: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const hexColor = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

const teamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    nationality: { type: String, required: true, trim: true },
    logoUrl: { type: String, trim: true },
    colorPrimary: { type: String, required: true, match: hexColor },
    colorSecondary: { type: String, required: true, match: hexColor },
    colorAccent: { type: String, required: true, match: hexColor },
    description: { type: String, trim: true, maxlength: 2000 },
    foundedYear: { type: Number, required: true },
    principal: { type: String, trim: true },
    drivers: { type: [driverSchema], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

applyToJSON(teamSchema);

export type ITeamId = Types.ObjectId;
export const Team = model<ITeam>('Team', teamSchema);
