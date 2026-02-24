import * as yup from 'yup';

export const phoneRegExp = /^[0-9]{10}$/;
export const nameRegExp = /^[a-zA-Z]+$/;

export const schema = yup.object().shape({
  title: yup.string(),
  firstName: yup
    .string()
    .matches(nameRegExp, 'First name must only contain letters')
    .required('First name is required'),
  lastName: yup.string().matches(nameRegExp, 'Last name must only contain letters').required('Last name is required'),
  licenseId: yup.string(),
  licenseExpiryDate: yup.date().nullable(),
  licenseType: yup.string(),
  licenseIssuedState: yup.string(),
  primaryPhoneCountryCode: yup.string(),
  primaryPhoneNumber: yup
    .string()
    .required('Primary phone number is required')
    .test('is-valid-phone', 'Phone number must be 10 digits', (value: any) => {
      if (value === '') return true;
      return phoneRegExp.test(value);
    }),
  alternativePhoneCountryCode: yup.string(),
  alternativePhoneNumber: yup
    .string()
    .nullable()
    .notRequired()
    .test('is-valid-phone', 'Phone number must be 10 digits', (value: any) => {
      if (value === '') return true;
      return phoneRegExp.test(value);
    }),
  email: yup
    .string()
    .email('Invalid email format')
    .matches(/^[^\s@]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/, 'Invalid email domain')
    .required('Email is required'),
  address: yup.string(),
  employmentStartDate: yup.date().nullable(),
  dateOfBirth: yup.date().nullable(),
  lonestarId: yup.string().required('Fleet ID is required'),
  name: yup.string().required('Fleet Name is required'),
});

export interface AddEditDriverModalProps {
  open: boolean;
  handleClose: () => void;
  isMobile: boolean;
  onSubmit: (data: any) => void;
  mode: 'add' | 'edit' | 'link';
  editDriverData?: any;
  fleetOptions: any[];
  insurerOptions: any[];
  onUnassign?: () => void;
}

export const customStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    height: '40px',
    minHeight: '40px',
    backgroundColor: '#F7FAFC',
    borderColor: state.isFocused ? '#2c3e50' : '#969696',
    boxShadow: state.isFocused ? '0 0 0 1px #2c3e50' : 'none',
    '&:hover': {
      borderColor: '#2c3e50',
    },
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#2c3e50' : state.isFocused ? '#2c3e50' : 'white',
    color: state.isSelected || state.isFocused ? 'white' : 'black',
    '&:hover': {
      backgroundColor: '#2c3e50',
      color: 'white',
    },
  }),
  valueContainer: (provided: any) => ({
    ...provided,
    height: '38px',
    padding: '0 6px',
  }),
  input: (provided: any) => ({
    ...provided,
    margin: '0px',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  indicatorsContainer: (provided: any) => ({
    ...provided,
    height: '38px',
  }),
  menuPortal: (base: any) => ({
    ...base,
    zIndex: 9999,
  }),
};
