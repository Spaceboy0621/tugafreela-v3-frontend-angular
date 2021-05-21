import { ChatMessagesModel } from './chat-messages.model';
import { Job } from './job.model';
import { User } from './user.model';

export class ChatModel {

    constructor(init?: ChatModel) {
        Object.assign(this, init)
    }

    id?: number;
    participant1: User;
    participant2: User;
    messages: Array<ChatMessagesModel>;
    job: Job;

}