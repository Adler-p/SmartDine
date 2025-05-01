'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './StaffSidebar.module.css';
import { AUTH_IP, ORDER_IP } from '../constants';

const StaffSidebar = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const accessToken = sessionStorage.getItem('accessToken'); // Uncomment to use sessionStorage

      if (!accessToken) {
        setError('Access token is missing.');
        return;
      }

      try {
        const res = await fetch(ORDER_IP + '/api/staff/orders?orderStatus=awaiting:preparation', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ accessToken }),
          credentials: 'include', // include cookies
        });
        if (!res.ok) {
          setError('Failed to fetch orders');
        }
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (error) {
        setError('Failed to fetch orders');
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className={styles.sidebar}>
      <h3>Orders Awaiting Preparation</h3>
      {orders.length === 0 ? (
        error ? <p>{error}</p> : <p>No pending orders.</p>
      ) : (
        orders.map((order) => (
          <Link key={order.id} href={`/staff/order-detail?id=${order.id}`} passHref>
            <div className={styles.sidebarLink}>
              <button className={styles.orderButton}>Order ID {order.id}</button>
            </div>
          </Link>
        ))
      )}
    </div>
  );
};

export default StaffSidebar;
