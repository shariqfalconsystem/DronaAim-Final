export interface Vehicle {
  recordId: number;
  tsInSeconds: number;
  vin: string;
  deviceInfo: DeviceInfo;
  batteryInfo: BatteryInfo;
  locationInfo: LocationInfo;
  driverInfo: DriverInfo;
  motionInfo: MotionInfo;
  safety: Safety;
  vehicleInfo: VehicleInfo;
  eventInfo: EventInfo;
}

export interface DeviceInfo {
  imei: number;
}

export interface BatteryInfo {
  deviceConnected: number;
}

export interface LocationInfo {
  longitude: number;
  latitude: number;
  coordinatesUOM: string;
  elevation: number;
  elevationUOM: string;
}

export interface DriverInfo {
  name: string;
  license: string;
}

export interface MotionInfo {
  status: string;
  speed: number;
  speedUOM: string;
  acceleration: number;
  accelerationUOM: string;
  heading: number;
  headingUOM: string;
}

export interface Safety {
  score: string;
  performance: string;
}

export interface VehicleInfo {
  fuelConsumed: number;
  fuelUOM: string;
  odometer: number;
  odoUOM: string;
}

export interface EventInfo {
  harshAcceleration: boolean;
  harshBraking: boolean;
  overspeed: boolean;
}

export interface TenantInformation {
  tenants: {
    lonestarId: string;
    tenatName: string;
    partnershipDetails: PartnershipDetail[];
    numberOfVehicles: number;
    numberOfDrivers: number;
    currentSafetyScore: number;
    safetyPerformance: string;
    totalKm: string;
    vehicles: Vehicle[];
  }[];
}

export interface PartnershipDetail {
  partner: string;
  active: string;
}
