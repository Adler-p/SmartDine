import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import styles from './OrderDetailPage.module.css';
import StaffHeader from '../../components/StaffHeader';
import StaffSidebar from '../../components/StaffSidebar';
import StatusUpdateButton from '../../components/StatusUpdateButton';
import { ORDER_IP } from '../../constants';

const OrderDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!id) return;

      const accessToken = sessionStorage.getItem('accessToken'); // Uncomment to use sessionStorage

      if (!accessToken) {
        setError('Access token is missing.');
        return;
      }

      try {
        const response = await fetch(ORDER_IP + `/api/staff/orderDetails`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: id,
            accessToken,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }
        const data = await response.json();
        setOrder(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  const handleStatusChange = async (orderId, newStatus) => {
    console.log('LOLLL12' + orderId);
    try {
      // const accessToken = sessionStorage.getItem('accessToken'); // Uncomment to use sessionStorage

      // if (!accessToken) {
      //   setError('Access token is missing.');
      //   return;
      // }

      // const response = await fetch(ORDER_IP + `/api/orders/status`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     orderId,
      //     accessToken,
      //     orderStatus: newStatus, // Send the updated status here
      //   }),
      // });

      // if (!response.ok) {
      //   throw new Error('Failed to update order status');
      // }

      // const updatedOrder = await response.json();
      setOrder(updatedOrder); // Update local state with the new order data
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

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
              <p>Time Ordered: {order.createdAt}</p>
              <p>Table: {order.tableId}</p>

              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems?.map((item, index) => (
                    <tr key={index}>
                      <td>{item.itemName}</td>
                      <td>{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div>
                <StatusUpdateButton
                  orderId={order.orderId}
                  status={order.orderStatus}
                  setOrder={setOrder}
                  // onStatusChange={
                  //   (newStatus) => handleStatusChange(item.orderId, newStatus) // Pass updated status
                  // }
                />
              </div>
            </>
          ) : (
            <p>Order not found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
