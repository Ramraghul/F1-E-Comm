import reducer, { toastAdded, toastDismissed, cartDrawerOpened, cartDrawerClosed } from './uiSlice';

describe('uiSlice', () => {
  it('adds a toast with a generated id', () => {
    const state = reducer(undefined, toastAdded('Hello', 'success'));
    expect(state.toasts).toHaveLength(1);
    expect(state.toasts[0]).toMatchObject({ message: 'Hello', type: 'success' });
    expect(state.toasts[0]?.id).toBeTruthy();
  });

  it('defaults toast type to "info"', () => {
    const state = reducer(undefined, toastAdded('Just FYI'));
    expect(state.toasts[0]?.type).toBe('info');
  });

  it('dismisses only the matching toast', () => {
    let state = reducer(undefined, toastAdded('First'));
    state = reducer(state, toastAdded('Second'));
    const firstId = state.toasts[0]!.id;
    state = reducer(state, toastDismissed(firstId));
    expect(state.toasts).toHaveLength(1);
    expect(state.toasts[0]?.message).toBe('Second');
  });

  it('toggles the cart drawer open state', () => {
    let state = reducer(undefined, cartDrawerOpened());
    expect(state.cartDrawerOpen).toBe(true);
    state = reducer(state, cartDrawerClosed());
    expect(state.cartDrawerOpen).toBe(false);
  });
});
