import React from 'react';
import styles from './StatusUpdateButton.module.css';
import { BACKEND_IP } from '../constants';

const StatusUpdateButton = ({ orderId, status, onStatusChange }) => {
  const handleStatusChange = async (newStatus) => {
    try {
      // Call the backend API to update the order status
      const response = await fetch(BACKEND_IP + `/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // If the update is successful, update the status
        onStatusChange(newStatus);
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
    <span className={styles.statusButtons}>
      <button
        className={styles.tickBtn}
        onClick={() => handleStatusChange('Completed')}
        disabled={status === 'Completed'}
      >
        ✔️
      </button>
      <button
        className={styles.crossBtn}
        onClick={() => handleStatusChange('Cancelled')}
        disabled={status === 'Cancelled'}
      >
        ❌
      </button>
    </span>
  );
};

export default StatusUpdateButton;
