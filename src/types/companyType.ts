export type companyType=
{
  manufacturer_id: string;
  companyName: string;
  bio: string;
  logo: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zip: string;
  };
  taxId: string;
}
