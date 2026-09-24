import { useEffect, useRef } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { useRefreshMutation, useLazyGetMeQuery } from './authApi';
import { credentialsSet, sessionCheckFailed } from './authSlice';

/** On app boot, attempts a silent refresh using the httpOnly cookie to restore a session. */
export function useAuthBootstrap(): void {
  const dispatch = useAppDispatch();
  const [refresh] = useRefreshMutation();
  const [getMe] = useLazyGetMeQuery();
  // Refresh-token rotation is one-shot per token: a second concurrent call with the same
  // cookie is treated server-side as reuse and revokes the whole session. In dev, React
  // StrictMode intentionally mounts this effect twice (mount → cleanup → mount) on every
  // page load, which would otherwise fire this call twice and log the user right back
  // out on every refresh. This component lives at the app root and only ever really
  // unmounts when the whole SPA does, so a ref that survives StrictMode's synthetic
  // remount is enough to guarantee the network call fires exactly once — no `cancelled`
  // flag needed on top of it.
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    (async () => {
      const refreshResult = await refresh().unwrap().catch(() => null);

      if (!refreshResult) {
        dispatch(sessionCheckFailed());
        return;
      }

      dispatch(
        credentialsSet({ user: refreshResult.data.user, accessToken: refreshResult.data.tokens.accessToken }),
      );

      // Re-fetch the freshest profile (e.g. reflects an admin approval since last visit).
      const meResult = await getMe().unwrap().catch(() => null);
      if (meResult) {
        dispatch(credentialsSet({ user: meResult.data, accessToken: refreshResult.data.tokens.accessToken }));
      }
    })();
  }, [dispatch, refresh, getMe]);
}
