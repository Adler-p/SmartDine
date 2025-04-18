import { Publisher, Subjects, MenuItemUpdatedEvent } from '@smartdine/common'

// Publisher for menu item updated events
export class MenuItemUpdatedPublisher extends Publisher<MenuItemUpdatedEvent> {
  readonly type = Subjects.MenuItemUpdated

  // 添加超时和错误处理
  async publish(data: MenuItemUpdatedEvent['data']): Promise<void> {
    console.log('Attempting to publish update event:', this.type);
    console.log('Event data:', JSON.stringify(data));
    
    return new Promise((resolve) => {
      try {
        // 使用短超时确保原始 super.publish 方法不会无限阻塞
        const publishTimeout = setTimeout(() => {
          console.warn('Update publish operation timed out');
          resolve(); // 即使超时也解析promise，避免阻塞API
        }, 1500);
        
        // 尝试发布事件
        super.publish(data)
          .then(() => {
            clearTimeout(publishTimeout);
            console.log('Update event published successfully');
            resolve();
          })
          .catch((err) => {
            clearTimeout(publishTimeout);
            console.error('Error in publishing update event:', err);
            resolve(); // 即使出错也解析promise，避免阻塞API
          });
      } catch (error) {
        console.error('Critical error in update publish method:', error);
        resolve(); // 在任何情况下都解析promise，避免阻塞API
      }
    });
  }
} 