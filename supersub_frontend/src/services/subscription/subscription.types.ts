export interface AccessRule {
  id: number;
  access_type: string;
}

export interface Offer {
  id: number;
  title: string;
  description: string;
  price: number;
  benefits: string;
  access_rules: AccessRule[];
}