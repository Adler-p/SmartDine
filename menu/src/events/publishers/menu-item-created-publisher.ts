import { Publisher, Subjects, MenuItemCreatedEvent } from '@smartdine/common'

// Publisher for menu item created events
export class MenuItemCreatedPublisher extends Publisher<MenuItemCreatedEvent> {
  readonly type = Subjects.MenuItemCreated

  // 重写发布方法，添加更多日志和错误处理
  async publish(data: MenuItemCreatedEvent['data']): Promise<void> {
    console.log('=====> [MenuItemCreatedPublisher] Attempting to publish event:', this.type);
    console.log('=====> [MenuItemCreatedPublisher] Event data:', JSON.stringify(data));
    
    return new Promise((resolve) => {
      try {
        // 设置超时确保publish方法不会无限阻塞
        const publishTimeout = setTimeout(() => {
          console.warn('=====> [MenuItemCreatedPublisher] Publish operation timed out after 1500ms');
          resolve(); // 即使超时也解析promise，避免阻塞API
        }, 1500);
        
        console.log('=====> [MenuItemCreatedPublisher] Calling super.publish()');
        // 尝试发布事件
        super.publish(data)
          .then(() => {
            clearTimeout(publishTimeout);
            console.log('=====> [MenuItemCreatedPublisher] Event published successfully');
            resolve();
          })
          .catch((err) => {
            clearTimeout(publishTimeout);
            console.error('=====> [MenuItemCreatedPublisher] Error in publishing event:', err);
            resolve(); // 即使出错也解析promise，避免阻塞API
          });
      } catch (error) {
        console.error('=====> [MenuItemCreatedPublisher] Critical error in publish method:', error);
        resolve(); // 在任何情况下都解析promise，避免阻塞API
      }
    });
  }
} 