import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import DashboardPage from '../page';
import { useAuth } from '@/context/AuthContext';

// Mock dependencies
jest.mock('next/navigation');
jest.mock('sonner');
jest.mock('@/context/AuthContext');
jest.mock('@/components/ApiKeyManager', () => () => <div data-testid="api-key-manager">ApiKeyManager</div>);
jest.mock('@/components/LeadsTable', () => () => <div data-testid="leads-table">LeadsTable</div>);
jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>
}));
jest.mock('@/components/UpgradeButton', () => () => <div data-testid="upgrade-button">UpgradeButton</div>);
jest.mock('@/components/TeamInvite', () => () => <div data-testid="team-invite">TeamInvite</div>);
jest.mock('@/components/TeamMembers', () => () => <div data-testid="team-members">TeamMembers</div>);
jest.mock('@/components/ProFeatureGuard', () => ({ children }: { children: React.ReactNode }) => 
  <div data-testid="pro-feature-guard">{children}</div>
);

const mockPush = jest.fn();
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockToast = toast as jest.Mocked<typeof toast>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('DashboardPage', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: mockPush } as any);
    mockToast.error = jest.fn();
    jest.clearAllMocks();
  });

  it('shows loading spinner when loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      accountType: 'free'
    });

    render(<DashboardPage />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      accountType: 'free'
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
      expect(mockToast.error).toHaveBeenCalledWith('Please login first');
    });
  });

  it('renders dashboard for free user', () => {
    mockUseAuth.mockReturnValue({
      user: { email: 'test@example.com' },
      loading: false,
      accountType: 'free'
    });

    render(<DashboardPage />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Welcome test@example.com (Free Tier)')).toBeInTheDocument();
    expect(screen.getByTestId('upgrade-button')).toBeInTheDocument();
    expect(screen.getByTestId('api-key-manager')).toBeInTheDocument();
    expect(screen.getByTestId('leads-table')).toBeInTheDocument();
  });

  it('renders dashboard for pro user without upgrade button', () => {
    mockUseAuth.mockReturnValue({
      user: { email: 'pro@example.com' },
      loading: false,
      accountType: 'pro'
    });

    render(<DashboardPage />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Welcome pro@example.com (Pro Member)')).toBeInTheDocument();
    expect(screen.queryByTestId('upgrade-button')).not.toBeInTheDocument();
    expect(screen.getByTestId('team-invite')).toBeInTheDocument();
    expect(screen.getByTestId('team-members')).toBeInTheDocument();
  });

  it('returns null when user is null and not loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      accountType: 'free'
    });

    const { container } = render(<DashboardPage />);
    expect(container.firstChild).toBeNull();
  });
});