import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RoleRoute } from './RoleRoute';
import { createAuthTestStore, mockUser } from '../test/testStore';
import { ROLES } from '@shopswift/shared';

function renderAdminArea(store: ReturnType<typeof createAuthTestStore>) {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route element={<RoleRoute allow={[ROLES.ADMIN]} />}>
            <Route path="/admin" element={<div>Admin Dashboard</div>} />
          </Route>
          <Route path="/" element={<div>Home Page</div>} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

describe('RoleRoute', () => {
  it('blocks a plain "user" role from an admin-only route', () => {
    const store = createAuthTestStore({
      user: mockUser({ role: ROLES.USER }),
      accessToken: 'token',
      status: 'authenticated',
    });
    renderAdminArea(store);
    expect(screen.getByText('Home Page')).toBeInTheDocument();
    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
  });

  it('allows an "admin" role through', () => {
    const store = createAuthTestStore({
      user: mockUser({ role: ROLES.ADMIN }),
      accessToken: 'token',
      status: 'authenticated',
    });
    renderAdminArea(store);
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('redirects unauthenticated users to /login', () => {
    const store = createAuthTestStore({ user: null, accessToken: null, status: 'unauthenticated' });
    renderAdminArea(store);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});
