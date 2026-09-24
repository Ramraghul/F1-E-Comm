import { render, screen } from '@testing-library/react';
import { Stepper } from './Stepper';

describe('Stepper', () => {
  const steps = ['Shipping', 'Review', 'Payment'];

  it('renders every step label', () => {
    render(<Stepper steps={steps} current={1} />);
    steps.forEach((step) => expect(screen.getByText(step)).toBeInTheDocument());
  });

  it('marks steps before the current one as done (checkmark)', () => {
    render(<Stepper steps={steps} current={3} />);
    const checks = screen.getAllByText('✓');
    expect(checks).toHaveLength(2); // steps 1 and 2 are done, step 3 is active
  });

  it('shows the step number (not a checkmark) for the active and pending steps', () => {
    render(<Stepper steps={steps} current={1} />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.queryByText('✓')).not.toBeInTheDocument();
  });
});
