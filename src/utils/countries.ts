export interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

export const countries: Country[] = [
  {
    code: 'IN',
    name: 'India',
    dialCode: '+91',
    flag: 'in'
  },
  {
    code: 'US',
    name: 'United States',
    dialCode: '+1',
    flag: 'us'
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    dialCode: '+44',
    flag: 'gb'
  },
  {
    code: 'CA',
    name: 'Canada',
    dialCode: '+1',
    flag: 'ca'
  },
  {
    code: 'AU',
    name: 'Australia',
    dialCode: '+61',
    flag: 'au'
  },
  {
    code: 'NZ',
    name: 'New Zealand',
    dialCode: '+64',
    flag: 'nz'
  },
  {
    code: 'DE',
    name: 'Germany',
    dialCode: '+49',
    flag: 'de'
  },
  {
    code: 'FR',
    name: 'France',
    dialCode: '+33',
    flag: 'fr'
  },
  {
    code: 'ES',
    name: 'Spain',
    dialCode: '+34',
    flag: 'es'
  },
  {
    code: 'IT',
    name: 'Italy',
    dialCode: '+39',
    flag: 'it'
  }
];

export const getCountryByCode = (code: string): Country | undefined => {
  return countries.find(country => country.code === code);
};

export const getCountryByDialCode = (dialCode: string): Country | undefined => {
  return countries.find(country => country.dialCode === dialCode);
};

export const getDefaultCountry = (): Country => {
  return countries[0]; // Returns India as default
};
