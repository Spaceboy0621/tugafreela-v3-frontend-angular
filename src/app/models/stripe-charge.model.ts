//Model de cobrança única em cartão de crédito e débito

class BillingDetails {
  address: {
    city: number;
    country: number;
    line1: number;
    line2: number;
    postal_code: number;
    state: number
  };
  email: number;
  name: string;
  phone: number
}

class PaymentMethodDetails {
  card: {
    brand: string;
    checks: {
      address_line1_check: string;
      address_postal_code_check: string;
      cvc_check: string
    };
    country: string;
    exp_month: number;
    exp_year: number;
    fingerprint: string;
    funding: string;
    installments: number;
    last4: string;
    network: string;
    three_d_secure: number;
    wallet: number
  };
  type: string
}

class Refunds {
    object: string;
    data: [];
    has_more: boolean;
    url: string 
}

export class StripeChargeModel {
  constructor(init?: StripeChargeModel) {
    Object.assign(this, init);
    this.object = 'charge';
  }

  id: string;
  object: string;
  amount: number;
  amount_captured: number;
  amount_refunded: number;
  application: number;
  application_fee: number;
  application_fee_amount: number;
  balance_transaction: string;
  billing_details: BillingDetails;
  calculated_statement_descriptor: number;
  captured: boolean;
  created: number;
  currency: string;
  customer: number;
  description: string;
  disputed: boolean;
  failure_code: number;
  failure_message: number;
  fraud_details: {};
  invoice: number;
  livemode: boolean;
  metadata: {};
  on_behalf_of: number;
  order: number;
  outcome: number;
  paid: boolean;
  payment_intent: number;
  payment_method: string;
  payment_method_details: PaymentMethodDetails
  receipt_email: number;
  receipt_number: number;
  receipt_url: string;
  refunded: boolean;
  refunds: Refunds;
  review: number;
  shipping: number;
  source_transfer: number;
  statement_descriptor: number;
  statement_descriptor_suffix: number;
  status: string;
  transfer_data: number;
  transfer_group: number

}