// pages/staff/past-orders.js
import React, { useState, useEffect } from 'react';
import styles from './PastOrdersPage.module.css';
import StaffHeader from '../../components/StaffHeader';
import StaffSidebar from '../../components/StaffSidebar';
import axios from 'axios';
import { ORDER_IP } from '../../constants';

const PastOrdersPage = () => {
  const [pastOrders, setPastOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetching past orders from the backend
    const fetchPastOrders = async () => {
      try {
        const response = await axios.get(ORDER_IP + '/api/staff/orders', {
          params: { orderStatus: 'completed' }, // Fetching orders with status 'completed'
        });
        setPastOrders(response.data);
      } catch (err) {
        setError('Failed to fetch past orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchPastOrders();
  }, []);

  if (loading) {
    return <div>Loading past orders...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <StaffHeader />
      <div className={styles.content}>
        <StaffSidebar />
        <div className={styles.main}>
          <h2 className={styles.title}>Past Orders</h2>
          {pastOrders.length === 0 ? (
            <p>No past orders found.</p>
          ) : (
            pastOrders.map((order) => (
              <div key={order.orderId} className={styles.orderBlock}>
                <h3>Order ID: {order.orderId}</h3>
                <p>Table: {order.tableId}</p>
                <p>Time Ordered: {new Date(order.createdAt).toLocaleString()}</p>
                <p>Time Completed: {new Date(order.completedAt).toLocaleString()}</p>

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
                    {order.orderItems.map((item, index) => (
                      <tr key={index}>
                        <td>{item.itemName}</td>
                        <td>{item.quantity}</td>
                        <td>{item.paymentStatus}</td>
                        <td>{item.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PastOrdersPage;
