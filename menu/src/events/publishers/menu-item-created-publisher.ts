import { Publisher, Subjects, MenuItemCreatedEvent } from '@smartdine/common'

// Publisher for menu item created events
export class MenuItemCreatedPublisher extends Publisher<MenuItemCreatedEvent> {
  readonly type = Subjects.MenuItemCreated
} 