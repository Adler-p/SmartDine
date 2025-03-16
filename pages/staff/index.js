import React from 'react';
import styles from './StaffPage.module.css';
import StaffHeader from '../../components/StaffHeader';
import StaffSidebar from '../../components/StaffSidebar';

const IncomingOrders = () => {
    const orders = [
        {
            orderId: '001',
            time: '2025-02-25 11:45',
            table: 'Table 01',
            items: [
                { name: 'Chicken Chop', quantity: 1, payment: 'Paid', status: 'Preparing' },
                { name: 'Fish Fillet', quantity: 1, payment: 'Paid', status: 'Preparing' },
                { name: 'Ice Water', quantity: 1, payment: 'Paid', status: 'Preparing' }
            ]
        },
        {
            orderId: '002',
            time: '2025-02-25 12:15',
            table: 'Table 02',
            items: [
                { name: 'Steak', quantity: 1, payment: 'Paid', status: 'Preparing' }
            ]
        },
        {
            orderId: '003',
            time: '2025-02-25 12:30',
            table: 'Table 03',
            items: []
        }
    ];

    return (
        <div className={styles.container}>
            <StaffHeader />
            <div className={styles.content}>
                <StaffSidebar />
                <div className={styles.main}>
                    <h2 className={styles.title}>Incoming Orders</h2>
                    {orders.map(order => (
                        <div key={order.orderId} className={styles.orderBlock}>
                            <h3>Order ID {order.orderId} - Time Order: {order.time}</h3>
                            {order.items.length > 0 ? (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Quantity</th>
                                            <th>Payment</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.items.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.name}</td>
                                                <td>{item.quantity}</td>
                                                <td>{item.payment}</td>
                                                <td>{item.status}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p>No orders for this table.</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default IncomingOrders;
