import { User } from './user.model';
export class BankAccount {

    public constructor( init?: BankAccount ) {
        Object.assign(this, init);
    }

    id: number;
    pf_pj: string;
    name_of_holder: string;
    nif: string;
    bank: string;
    owner: User | number;
    checked: boolean;
    swift: string;
    iban: string;
    iban_code: string;
    primary: boolean;
}