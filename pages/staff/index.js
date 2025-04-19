import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from './StaffPage.module.css';
import StaffHeader from '../../components/StaffHeader';
import StaffSidebar from '../../components/StaffSidebar';

const IncomingOrders = () => {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]); // Store orders here
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        // Fetch current user and ensure they are staff
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/users/currentuser', {
                    credentials: 'include',
                });
                const data = await res.json();
                if (!data.currentUser || data.currentUser.role !== 'staff') {
                    router.push('/auth/staff-login');
                } else {
                    setUser(data.currentUser);
                }
            } catch (err) {
                console.error('Error fetching user:', err);
                router.push('/auth/staff-login');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    // Fetch incoming orders
    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/orders/incoming', {
                    credentials: 'include',
                });
                const data = await res.json();
                setOrders(data);
            } catch (err) {
                setError('Failed to load orders.');
                console.error('Error fetching orders:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []); // Runs once on component mount

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className={styles.container}>
            <StaffHeader user={user} />
            <div className={styles.content}>
                <StaffSidebar />
                <div className={styles.main}>
                    <h2 className={styles.title}>Incoming Orders</h2>
                    {orders.length === 0 ? (
                        <p>No incoming orders</p>
                    ) : (
                        orders.map((order) => (
                            <div key={order.orderId} className={styles.orderBlock}>
                                <h3>Order ID {order.orderId} - Time Ordered: {order.createdAt}</h3>
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
                                                    <td>{item.paymentStatus}</td>
                                                    <td>{item.status}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p>No items for this order.</p>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default IncomingOrders;
