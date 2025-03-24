import { Subjects } from './subjects';

export interface MenuItemUpdatedEvent {
  type: Subjects.MenuItemUpdated;
  data: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl?: string;
    availability: string;
    version: number;
  };
} 