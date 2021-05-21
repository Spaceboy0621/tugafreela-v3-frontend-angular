import { Injectable } from '@angular/core';
import { cpf } from 'cpf-cnpj-validator';
import * as card from 'card-validator';

// import card  from 'card-validator';

@Injectable()
export class ValidateUtil  {

    cpf(item: string) {
        return cpf.isValid(item);
    }

    creditCard(number: string) {
        const validNumber = card.number(number);

        return validNumber.isValid;
    }

    getFlag(item: string) {
        const valid = card.number(item);
        return {
            flagName: valid.card.niceType,
            flag: valid.card.type 
        }
    }

    creditCardCvv(flag: string | false, cvv: number) {
        
        if (!flag) {
            return false
        }    
        if (flag === 'amex') {
            if ((/^\d{4}$/).test(cvv.toString())) {
                return true;
            }
        }
        else if((/^\d{3}$/).test(cvv.toString())) {
            return true;
        }

        return false;
    }
}