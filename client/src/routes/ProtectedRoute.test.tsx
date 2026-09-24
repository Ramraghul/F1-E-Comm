import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { createAuthTestStore, mockUser } from '../test/testStore';

function renderAt(path: string, store: ReturnType<typeof createAuthTestStore>) {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<div>Secret Checkout Page</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

describe('ProtectedRoute', () => {
  it('redirects unauthenticated users to /login', () => {
    const store = createAuthTestStore({ user: null, accessToken: null, status: 'unauthenticated' });
    renderAt('/checkout', store);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Secret Checkout Page')).not.toBeInTheDocument();
  });

  it('renders the protected content for authenticated users', () => {
    const store = createAuthTestStore({
      user: mockUser(),
      accessToken: 'valid-token',
      status: 'authenticated',
    });
    renderAt('/checkout', store);
    expect(screen.getByText('Secret Checkout Page')).toBeInTheDocument();
  });

  it('shows a spinner while the session is still being checked', () => {
    const store = createAuthTestStore({ user: null, accessToken: null, status: 'checking' });
    const { container } = renderAt('/checkout', store);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });
});
