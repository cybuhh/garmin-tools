import { AthleteRoutes, OAuthRoutes, AuthenticationConfig } from 'strava-v3';

declare module 'strava-v3' {
  export class client {
    athlete: AthleteRoutes;
    athletes: AthletesRoutes;
    activities: ActivitiesRoutes;
    clubs: ClubsRoutes;
    gear: GearRoutes;
    segments: SegmentsRoutes;
    segmentEfforts: SegmentEffortsRoutes;
    pushSubscriptions: PushSubscriptionRoutes;
    streams: StreamsRoutes;
    uploads: UploadsRoutes;
    rateLimiting: RateLimiting;
    runningRaces: RunningRacesRoutes;
    routes: RoutesRoutes;
    oauth: OAuthRoutes;
    constructor(token: string);
  }

  export const config: (config: AuthenticationConfig) => void;

  export const athletes: AthletesRoutes;
  export const activities: ActivitiesRoutes;
  export const clubs: ClubsRoutes;
  export const gear: GearRoutes;
  export const segments: SegmentsRoutes;
  export const segmentEfforts: SegmentEffortsRoutes;
  export const pushSubscriptions: PushSubscriptionRoutes;
  export const streams: StreamsRoutes;
  export const uploads: UploadsRoutes;
  export const rateLimiting: RateLimiting;
  export const runningRaces: RunningRacesRoutes;
  export const routes: RoutesRoutes;
  export const oauth: OAuthRoutes;

  const strava: Strava;
}
