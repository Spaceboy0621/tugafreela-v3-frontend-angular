import { User } from './user.model';
export class CreditCardModel {
    public constructor( init?: CreditCardModel ) {
        Object.assign(this, init);
    }

    id: number;
    surname: string;
    expiration_date_month: string;
    expiration_date_year: string;
    cvv: number;
    name_on_the_card: string;
    number: string;
    flag: string;
    card_owner: User | number;
    checked?: boolean;
    type_card: string;
    country: string;
}