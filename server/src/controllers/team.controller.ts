import type { Request, Response } from 'express';
import { Team } from '../models/Team.model';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';

export const listTeams = asyncHandler(async (_req: Request, res: Response) => {
  const teams = await Team.find({ isActive: true }).sort({ name: 1 });
  sendSuccess(res, 200, teams.map((t) => t.toJSON()));
});

export const getTeamBySlug = asyncHandler(async (req: Request, res: Response) => {
  const team = await Team.findOne({ slug: req.params.slug });
  if (!team) throw ApiError.notFound('Team not found');
  sendSuccess(res, 200, team.toJSON());
});

export const createTeam = asyncHandler(async (req: Request, res: Response) => {
  const team = await Team.create(req.body);
  sendSuccess(res, 201, team.toJSON(), 'Team created');
});

export const updateTeam = asyncHandler(async (req: Request, res: Response) => {
  const team = await Team.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!team) throw ApiError.notFound('Team not found');
  sendSuccess(res, 200, team.toJSON(), 'Team updated');
});

export const deleteTeam = asyncHandler(async (req: Request, res: Response) => {
  const team = await Team.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!team) throw ApiError.notFound('Team not found');
  sendSuccess(res, 200, null, 'Team deactivated');
});
