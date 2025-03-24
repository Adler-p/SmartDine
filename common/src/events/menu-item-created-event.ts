import { Subjects } from './subjects';

export interface MenuItemCreatedEvent {
  type: Subjects.MenuItemCreated;
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