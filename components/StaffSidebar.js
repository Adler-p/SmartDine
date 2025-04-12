import Link from 'next/link';
import styles from './StaffSidebar.module.css';

const StaffSidebar = () => {
    const orders = [
        { orderId: '001' },
        { orderId: '002' },
        { orderId: '003' }
    ];

    return (
        <div className={styles.sidebar}>
            <h3>Orders</h3>
            {orders.map(order => (
                <Link key={order.orderId} href={`/staff/order-detail?id=${order.orderId}`}>
                    <a className={styles.sidebarLink}>
                        <button className={styles.orderButton}>Order ID {order.orderId}</button>
                    </a>
                </Link>
            ))}
        </div>
    );
};

export default StaffSidebar;
