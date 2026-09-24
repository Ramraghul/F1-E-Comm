import request from 'supertest';
import { app } from '../utils/testApp';
import { bearer } from '../utils/auth';
import { createTeam, createRaceTeamUser, createUser } from '../../src/seed/factories';
import { OFFER_SCOPE } from '@shopswift/shared';

const OFFERS_URL = '/api/v1/offers';

function offerPayload(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    code: `CODE${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    description: 'Test offer',
    discountType: 'percent',
    discountValue: 10,
    scope: 'global',
    startsAt: new Date(Date.now() - 60_000).toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  };
}

describe('Offers RBAC / tamper protection', () => {
  it('rejects a plain "user" role from creating an offer', async () => {
    const user = await createUser();
    const res = await request(app)
      .post(OFFERS_URL)
      .set('Authorization', bearer(user))
      .send(offerPayload());
    expect(res.status).toBe(403);
  });

  it('forces a raceteam-created offer to scope=team and their own team, regardless of payload', async () => {
    const team = await createTeam();
    const foreignTeam = await createTeam();
    const raceteam = await createRaceTeamUser(team.id);

    const res = await request(app)
      .post(OFFERS_URL)
      .set('Authorization', bearer(raceteam))
      .send(offerPayload({ scope: OFFER_SCOPE.GLOBAL, team: foreignTeam.id }));

    expect(res.status).toBe(201);
    expect(res.body.data.scope).toBe(OFFER_SCOPE.TEAM);
    expect(res.body.data.team).toBe(team.id);
  });

  it('GET /offers/mine only returns the caller\'s own team offers', async () => {
    const teamA = await createTeam();
    const teamB = await createTeam();
    const raceteamA = await createRaceTeamUser(teamA.id);
    const raceteamB = await createRaceTeamUser(teamB.id);

    await request(app)
      .post(OFFERS_URL)
      .set('Authorization', bearer(raceteamA))
      .send(offerPayload({ code: 'TEAMA1' }));
    await request(app)
      .post(OFFERS_URL)
      .set('Authorization', bearer(raceteamB))
      .send(offerPayload({ code: 'TEAMB1' }));

    const res = await request(app).get(`${OFFERS_URL}/mine`).set('Authorization', bearer(raceteamA));
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].code).toBe('TEAMA1');
  });

  it('blocks a raceteam from deleting another team\'s offer', async () => {
    const teamA = await createTeam();
    const teamB = await createTeam();
    const raceteamA = await createRaceTeamUser(teamA.id);
    const raceteamB = await createRaceTeamUser(teamB.id);

    const createRes = await request(app)
      .post(OFFERS_URL)
      .set('Authorization', bearer(raceteamB))
      .send(offerPayload({ code: 'BONLY' }));
    const offerId = createRes.body.data.id;

    const res = await request(app)
      .delete(`${OFFERS_URL}/${offerId}`)
      .set('Authorization', bearer(raceteamA));

    expect(res.status).toBe(403);
  });
});
