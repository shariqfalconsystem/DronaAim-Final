// hooks/usePolicyCheck.ts
import { useSelector } from 'react-redux';

/**
 * Custom hook to check policy status with always-allowed fleet consideration
 *
 * Returns an object with:
 * - isPolicyActive: Whether the policy is active (true for always-allowed fleets)
 * - isPolicyExpired: Whether the policy is expired (false for always-allowed fleets)
 * - showWarningBanner: Whether to show warning banner (false for always-allowed fleets)
 * - isAlwaysAllowedFleet: Whether the current fleet is in the always-allowed list
 * - policyDetails: The raw policy details object
 */
export const usePolicyCheck = () => {
  const isAlwaysAllowedFleet = useSelector((state: any) => state?.auth?.isAlwaysAllowedFleet);
  const policyDetails = useSelector((state: any) => state?.auth?.userData?.selectedRole?.policyDetails?.[0] || {});

  // If fleet is always allowed, bypass all policy restrictions
  const isPolicyActive = isAlwaysAllowedFleet ? true : policyDetails?.isActive;
  const isPolicyExpired = !isPolicyActive;

  // Only show warning banner if NOT always allowed and has active policy with warning
  const showWarningBanner = !isAlwaysAllowedFleet && policyDetails?.isActive && policyDetails?.warning;

  return {
    isPolicyActive,
    isPolicyExpired,
    showWarningBanner,
    isAlwaysAllowedFleet,
    policyDetails,
  };
};

export default usePolicyCheck;
