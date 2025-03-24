import { Publisher, Subjects, MenuItemUpdatedEvent } from '@smartdine/common'

// Publisher for menu item updated events
export class MenuItemUpdatedPublisher extends Publisher<MenuItemUpdatedEvent> {
  readonly type = Subjects.MenuItemUpdated
} 