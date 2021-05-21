import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class RunToastUtil {

    constructor(private toastrService: ToastrService) {}

    success(time: number, message: string) {
        this.toastrService.success(message, 'Eba! Deu tudo certo', {
            progressBar: true,
            tapToDismiss: true,
            timeOut: time
        });
    }

    error(time: number, message: string) {
        this.toastrService.error(message, 'Ops! Algo deu errado', {
            progressBar: true,
            tapToDismiss: true,
            timeOut: time
        });
    }

    warning(time: number, message: string) {
        this.toastrService.warning(message, 'Atenção! Ação necessária', {
            progressBar: true,
            tapToDismiss: true,
            timeOut: time
        });
    }
}