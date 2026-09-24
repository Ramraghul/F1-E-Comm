export interface AdminOverviewAnalytics {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalRaceTeams: number;
  pendingRaceTeamApprovals: number;
  totalProducts: number;
  ordersByStatus: Record<string, number>;
}

export interface SalesByTeam {
  team: { id: string; name: string; slug: string; colorPrimary: string };
  revenue: number;
  orderCount: number;
  unitsSold: number;
}

export interface RaceTeamAnalytics {
  revenue: number;
  orderCount: number;
  unitsSold: number;
  topProducts: { productId: string; name: string; unitsSold: number; revenue: number }[];
  lowStockProducts: { productId: string; name: string; stock: number }[];
}
