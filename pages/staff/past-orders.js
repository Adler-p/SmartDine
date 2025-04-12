// pages/staff/past-orders.js
import React from 'react';
import styles from './PastOrdersPage.module.css';
import StaffHeader from '../../components/StaffHeader';
import StaffSidebar from '../../components/StaffSidebar';

const PastOrdersPage = () => {
    // Hardcoded past orders data
    const pastOrders = [
        {
            orderId: '004',
            table: 'Table 01',
            timeOrdered: '2025-02-25 11:45',
            timeCompleted: '2025-02-25 12:30',
            items: [
                { name: 'Steak', quantity: 1, payment: 'Paid', status: 'Completed' },
                { name: 'Fish Fillet', quantity: 1, payment: 'Paid', status: 'Completed' },
                { name: 'Ice Water', quantity: 1, payment: 'Paid', status: 'Completed' }
            ]
        },
        {
            orderId: '005',
            table: 'Table 02',
            timeOrdered: '2025-02-25 12:15',
            timeCompleted: '2025-02-25 12:45',
            items: [
                { name: 'Steak', quantity: 2, payment: 'Paid', status: 'Completed' },
                { name: 'Chicken Chop', quantity: 1, payment: 'Paid', status: 'Completed' }
            ]
        },
        {
            orderId: '006',
            table: 'Table 03',
            timeOrdered: '2025-02-25 12:30',
            timeCompleted: '2025-02-25 13:00',
            items: [
                { name: 'Burger', quantity: 2, payment: 'Paid', status: 'Completed' }
            ]
        }
    ];

    return (
        <div className={styles.container}>
            <StaffHeader />
            <div className={styles.content}>
                <StaffSidebar />
                <div className={styles.main}>
                    <h2 className={styles.title}>Past Orders</h2>
                    {pastOrders.map((order) => (
                        <div key={order.orderId} className={styles.orderBlock}>
                            <h3>Order ID: {order.orderId}</h3>
                            <p>Table: {order.table}</p>
                            <p>Time Ordered: {order.timeOrdered}</p>
                            <p>Time Completed: {order.timeCompleted}</p>

                            <table className={styles.table}>
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
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PastOrdersPage;
