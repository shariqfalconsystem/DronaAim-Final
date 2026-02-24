export interface PartnershipDetail {
  partner: string;
  active: string;
}

export interface Tenant {
  lonestarId: string;
  tenatName: string;
  partnershipDetails: PartnershipDetail[];
  numberOfVehicles: number;
  numberOfDrivers: number;
  currentSafetyScore: number;
  safetyPerformance: string;
  totalKm: string;
}

export interface TenantResponse {
  pageDetails: {
    totalRecords: number;
    pageSize: number;
    currentPage: number;
  };
  tenants: Tenant[];
}
