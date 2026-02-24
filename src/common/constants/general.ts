export const US_STATES = [
  { value: 'Alabama', label: 'Alabama' },
  { value: 'Alaska', label: 'Alaska' },
  { value: 'Arizona', label: 'Arizona' },
  { value: 'Arkansas', label: 'Arkansas' },
  { value: 'California', label: 'California' },
  { value: 'Colorado', label: 'Colorado' },
  { value: 'Connecticut', label: 'Connecticut' },
  { value: 'Delaware', label: 'Delaware' },
  { value: 'Florida', label: 'Florida' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Hawaii', label: 'Hawaii' },
  { value: 'Idaho', label: 'Idaho' },
  { value: 'Illinois', label: 'Illinois' },
  { value: 'Indiana', label: 'Indiana' },
  { value: 'Iowa', label: 'Iowa' },
  { value: 'Kansas', label: 'Kansas' },
  { value: 'Kentucky', label: 'Kentucky' },
  { value: 'Louisiana', label: 'Louisiana' },
  { value: 'Maine', label: 'Maine' },
  { value: 'Maryland', label: 'Maryland' },
  { value: 'Massachusetts', label: 'Massachusetts' },
  { value: 'Michigan', label: 'Michigan' },
  { value: 'Minnesota', label: 'Minnesota' },
  { value: 'Mississippi', label: 'Mississippi' },
  { value: 'Missouri', label: 'Missouri' },
  { value: 'Montana', label: 'Montana' },
  { value: 'Nebraska', label: 'Nebraska' },
  { value: 'Nevada', label: 'Nevada' },
  { value: 'New Hampshire', label: 'New Hampshire' },
  { value: 'New Jersey', label: 'New Jersey' },
  { value: 'New Mexico', label: 'New Mexico' },
  { value: 'New York', label: 'New York' },
  { value: 'North Carolina', label: 'North Carolina' },
  { value: 'North Dakota', label: 'North Dakota' },
  { value: 'Ohio', label: 'Ohio' },
  { value: 'Oklahoma', label: 'Oklahoma' },
  { value: 'Oregon', label: 'Oregon' },
  { value: 'Pennsylvania', label: 'Pennsylvania' },
  { value: 'Rhode Island', label: 'Rhode Island' },
  { value: 'South Carolina', label: 'South Carolina' },
  { value: 'South Dakota', label: 'South Dakota' },
  { value: 'Tennessee', label: 'Tennessee' },
  { value: 'Texas', label: 'Texas' },
  { value: 'Utah', label: 'Utah' },
  { value: 'Vermont', label: 'Vermont' },
  { value: 'Virginia', label: 'Virginia' },
  { value: 'Washington', label: 'Washington' },
  { value: 'West Virginia', label: 'West Virginia' },
  { value: 'Wisconsin', label: 'Wisconsin' },
  { value: 'Wyoming', label: 'Wyoming' },
  { value: 'Washington D.C.', label: 'Washington D.C.' },
];

export const nameTitles = [
  { value: 'Mr.', label: 'Mr.' },
  { value: 'Mrs.', label: 'Mrs.' },
  { value: 'Miss', label: 'Miss' },
  { value: 'Ms.', label: 'Ms.' },
];

export const LICENSE_TYPES = [
  { value: 'Class A', label: 'Class A' },
  { value: 'Class B', label: 'Class B' },
  { value: 'Class C', label: 'Class C' },
  { value: 'Class D', label: 'Class D' },
];

export const roleLabels: any = {
  driver: 'Driver',
  fleetManager: 'Fleet Manager',
  insurer: 'Insurer',
  fleetManagerSuperUser: 'Super Fleet Manager',
  insurerSuperUser: 'Super Insurer',
  admin: 'DronaAIm Admin',
};

export const eventTypeColorMap: any = {
  Speeding: '#4CAF50',
  'Harsh Cornering': '#2196F3',
  'Harsh Braking': '#FF9800',
  'Harsh Acceleration': '#FFC107',
  Impact: '#9C27B0',
  'Severe Impact': '#F44336',
  SOS: '#8D6F64',
};

export const REJECTION_REASONS: any = [
  {
    id: 'incorrectType',
    label: 'Incorrect Document Type',
    description: 'Submit the correct document as per the requirements.',
  },
  { id: 'expired', label: 'Document Expired', description: 'Provide a valid and up-to-date document.' },
  {
    id: 'notVisible',
    label: 'ID Not Visible',
    description: 'The ID details are unclear. Please upload a clearer version.',
  },
  {
    id: 'missingInfo',
    label: 'Information Missing',
    description: 'Complete the required information on the document.',
  },
  { id: 'damaged', label: 'Document Damaged or Illegible', description: 'Submit a legible, undamaged document.' },
  {
    id: 'signatureMismatch',
    label: 'Signature Mismatch',
    description: "The signature doesn't match our records. Please submit the correct one.",
  },
];

export const countryCodes = [
  { code: '+1', label: 'United States' },
  { code: '+52', label: 'Mexico' },
  { code: '+91', label: 'India' },
];

export const unInsuredId = 'INS9999';
export const phoneRegExp = /^[0-9]{10}$/;
export const nameRegExp = /^[a-zA-Z]+$/;
