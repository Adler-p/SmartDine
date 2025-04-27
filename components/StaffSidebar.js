'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './StaffSidebar.module.css';

const StaffSidebar = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch('/api/staff/orders?orderStatus=awaiting:preparation', {
                    credentials: 'include',
                });
                if (!res.ok) {
                    throw new Error('Failed to fetch orders');
                }
                const data = await res.json();
                setOrders(data.orders || []);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };

        fetchOrders();
    }, []);

    return (
        <div className={styles.sidebar}>
            <h3>Orders Awaiting Preparation</h3>
            {orders.length === 0 ? (
                <p>No pending orders.</p>
            ) : (
                orders.map(order => (
                    <Link key={order.id} href={`/staff/order-detail?id=${order.id}`} passHref>
                        <div className={styles.sidebarLink}>
                            <button className={styles.orderButton}>
                                Order ID {order.id}
                            </button>
                        </div>
                    </Link>
                ))
            )}
        </div>
    );
};

export default StaffSidebar;
