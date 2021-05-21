//Model de pagamento conta bancária
export class StripePaymentModel {
  constructor(init?: StripePaymentModel) {
    Object.assign(this, init);
    this.object = "payout";
  }
  
  id: string;
  object: string;
  amount: number;
  arrival_date: number;
  automatic: boolean;
  balance_transaction: string;
  created: number;
  currency: string;
  description: string;
  destination: string;
  failure_balance_transaction: number;
  failure_code: number;
  failure_message: number;
  livemode: boolean;
  metadata: {};
  method: string;
  original_payout: number;
  reversed_by: number;
  source_type: string;
  statement_descriptor: number;
  status: string;
  type: string

}