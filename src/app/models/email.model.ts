export class Email {
    public constructor(
        init?: EmailDto,
        
    ) {
        Object.assign(this, init);
    }

    to: string = 'tugafreela@gmail.com';
    from: string = '';
    cc: string = '';
    bcc: string = '';
    replyTo: string;
    subject: string;
    text: string;
    html: string;

}

class EmailDto {
    replyTo: string;
    subject: string;
    text: string;
    html: string;
}