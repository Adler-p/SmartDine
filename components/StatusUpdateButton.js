import React from 'react';
import styles from './StatusUpdateButton.module.css';
import { BACKEND_IP, ORDER_IP } from '../constants';
import { useRouter } from 'next/router';

const StatusUpdateButton = ({ orderId, status, setOrder }) => {
    const router = useRouter();
    const handleStatusChange = async (newStatus, orderId) => {
    console.log('LOLLL1243' + orderId);

    const accessToken = sessionStorage.getItem('accessToken'); // Uncomment to use sessionStorage

    if (!accessToken) {
      setError('Access token is missing.');
      return;
    }

    try {
      // Call the backend API to update the order status
      const response = await fetch(ORDER_IP + `/api/orders/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken, orderId: orderId, status: newStatus }),
      });

      if (response.ok) {
        // If the update is successful, update the status
        // onStatusChange(newStatus);
        setOrder(newStatus);
        router.push('/staff'); // Redirects to the main page (/pages/index.js)
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status.');
    }
  };

  return (
    <div className={styles.statusButtons}>
      <button
        className={styles.tickBtn}
        onClick={() => handleStatusChange('completed', orderId, setOrder)}
        disabled={status === 'completed'}
      >
        ✔️ Mark as Completed
      </button>
      <button
        className={styles.crossBtn}
        onClick={() => handleStatusChange('cancelled', orderId, setOrder)}
        disabled={status === 'cancelled'}
      >
        ❌ Cancel Order
      </button>
    </div>
  );
};

export default StatusUpdateButton;
