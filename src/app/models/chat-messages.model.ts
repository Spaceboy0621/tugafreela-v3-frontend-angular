import { ChatModel } from './chat.model';
import { User } from './user.model';
export class ChatMessagesModel {
    id?: number;
    message: string;
    sender: User | number;
    receiver: User | number;
    read_at: Date;
    attachments: File[];
    chat: ChatModel;
    archived: boolean;
    favorite: boolean;
}