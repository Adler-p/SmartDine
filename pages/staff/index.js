import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from './StaffPage.module.css';
import StaffHeader from '../../components/StaffHeader';
import StaffSidebar from '../../components/StaffSidebar';
import { AUTH_IP, ORDER_IP, PAYMENT_IP } from '../../constants';

const IncomingOrders = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]); // Store orders here
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // useEffect(() => {
  //   // Fetch current user and ensure they are staff
  //   const fetchUser = async () => {
  //     try {
  //       const res = await fetch(AUTH_IP + '/api/users/currentuser', {
  //         credentials: 'include',
  //       });
  //       const data = await res.json();
  //       if (!data.currentUser || data.currentUser.role !== 'staff') {
  //         router.push(AUTH_IP + '/auth/staff-login');
  //       } else {
  //         setUser(data.currentUser);
  //       }
  //     } catch (err) {
  //       console.error('Error fetching user:', err);
  //       router.push('/auth/staff-login');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchUser();
  // }, [router]);

  // Fetch incoming orders
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);

      const accessToken = sessionStorage.getItem('accessToken'); // Uncomment to use sessionStorage

      if (!accessToken) {
        setError('Access token is missing.');
        return;
      }

      try {
        const res = await fetch(ORDER_IP + '/api/staff/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orderStatus: 'created', accessToken }),
          credentials: 'include', // include cookies
        });
        const data = await res.json();

        // For each order, fetch payment
        const enrichedOrders = await Promise.all(
          data.map(async (order) => {
            try {
              const paymentRes = await fetch(PAYMENT_IP + `/api/payments/staff`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ orderId: order.orderId, accessToken }),
                credentials: 'include', // include cookies
              });
              const paymentData = await paymentRes.json();
              return { ...order, paymentStatus: paymentData.paymentStatus };
            } catch (err) {
              console.error('Error fetching payment for order:', order.orderId);
              return { ...order, paymentStatus: 'Unknown' };
            }
          })
        );

        setOrders(enrichedOrders);
      } catch (err) {
        setError('Failed to load orders.');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <p>Loading...</p>;
  // if (error) return <p>{error}</p>;

  return (
    <div className={styles.container}>
      <StaffHeader user={user} />
      <div className={styles.content}>
        <StaffSidebar />
        <div className={styles.main}>
          <h2 className={styles.title}>Incoming Orders</h2>
          {orders === undefined || orders.length === 0 ? (
            error ? (
              <p>{error}</p>
            ) : (
              <p>No incoming orders</p>
            )
          ) : (
            orders.map((order) => (
              <div key={order.orderId} className={styles.orderBlock}>
                <h3>
                  <div>Order ID {order.orderId}</div>
                </h3>
                <h4>
                  <div>Time Ordered: {order.createdAt}</div>
                </h4>
                {/* {order.length > 0 ? ( */}
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Quantity</th>
                      <th>Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.orderItems.map((item, index) => (
                      <tr key={index}>
                        <td>{item.itemName}</td>
                        <td>{item.quantity}</td>
                        <td>{order.orderStatus === 'created' ? 'Pending' : 'Paid'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* ) : (
                  <p>No items for this order.</p>
                ) */}
                {/* } */}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default IncomingOrders;
