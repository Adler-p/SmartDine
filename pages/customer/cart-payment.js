import { useRouter } from 'next/router';
import React, { useState } from 'react';
import styles from './CardPaymentPage.module.css';
import StaffHeader from '../../components/StaffHeader';
import StaffSidebar from '../../components/StaffSidebar';
import StatusUpdateButton from '../../components/StatusUpdateButton';

const CardPaymentPage = () => {
    const router = useRouter();
    const { id } = router.query; 

    // Hardcoded orders data for now
    const [orders, setOrders] = useState([
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
    ]);

    // Find the order matching the id from the URL
    const order = orders.find(order => order.orderId === id);

    // Function to handle status change for each item
    const handleStatusChange = (orderId, itemIndex, newStatus) => {
        // Update the status of the item based on index
        setOrders(prevOrders => {
            return prevOrders.map(order => {
                if (order.orderId === orderId) {
                    const updatedOrder = { ...order };
                    updatedOrder.items[itemIndex].status = newStatus;
                    return updatedOrder;
                }
                return order;
            });
        });
    };

    return (
        <div className={styles.container}>
            <StaffHeader />
            <div className={styles.content}>
                <StaffSidebar />
                <div className={styles.main}>
                    <h2 className={styles.title}>Order Detail</h2>
                    {order ? (
                        <>
                            <h3>Order ID: {order.orderId}</h3>
                            <p>Time Ordered: {order.time}</p>
                            <p>Table: {order.table}</p>

                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Quantity</th>
                                        <th>Payment</th>
                                        <th>Status</th>
                                        <th>Update Status</th> 
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.name}</td>
                                            <td>{item.quantity}</td>
                                            <td>{item.payment}</td>
                                            <td>{item.status}</td>
                                            <td>
                                                {/* Include StatusUpdateButton component for each item */}
                                                <StatusUpdateButton
                                                    status={item.status}
                                                    onStatusChange={(newStatus) => handleStatusChange(order.orderId, index, newStatus)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    ) : (
                        <p>Order not found</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CardPaymentPage;
