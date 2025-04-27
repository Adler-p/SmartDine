import { Subjects } from './subjects';
export interface CartFinalisedEvent {
    type: Subjects.CartFinalised;
    subject: Subjects.CartFinalised;
    data: {
        sessionId: string;
        tableId: string;
        items: {
            itemId: string;
            itemName: string;
            unitPrice: number;
            quantity: number;
        }[];
    };
}
