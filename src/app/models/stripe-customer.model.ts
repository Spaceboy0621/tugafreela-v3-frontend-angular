//Model de cliente, para pagamento em assinatura
class InoviceSettings {
  custom_fields: number;
  default_payment_method: number;
  footer: number
}

export class StripeCustomerModel {
  constructor(init?: StripeCustomerModel) {
    Object.assign(this, init);
    this.object = 'customer';
  }

  id: string;
  object: string;
  address: string;
  balance: number;
  created: number;
  currency: string;
  default_source: string;
  delinquent: boolean;
  description: string;
  discount: number;
  email: string;
  invoice_prefix: string;
  invoice_settings: InoviceSettings;
  livemode: boolean;
  metadata: {};
  name: number;
  next_invoice_sequence: number;
  phone: number;
  preferred_locales: [];
  shipping: number;
  tax_exempt: string

}