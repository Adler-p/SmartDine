'use client'; // This is mandatory

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from './CartPaymentPage.module.css';
import PaymentHeader from '../../components/customer/PaymentHeader';
import { ShoppingCart } from 'lucide-react';
import Modal from 'react-modal';
import axios from 'axios';
import { PAYMENT_IP } from '../../constants';

const CartPaymentPage = () => {
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [orderId, setOrderId] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const [tableId, setTableId] = useState('');

  useEffect(() => {
    const storedItems = sessionStorage.getItem('checkoutItems');
    if (storedItems) {
      const parsedItems = JSON.parse(storedItems);
      setOrders(parsedItems?.items);
      setOrderId(parsedItems?.checkoutId);
    }

    const savedTableId = sessionStorage.getItem('tableId');
    if (savedTableId) {
      setTableId(savedTableId);
    }

    setLoading(false);
  }, []);

  // useEffect(() => {
  //     const fetchCart = async () => {
  //         setLoading(true);
  //         try {
  //             // const sessionId = localStorage.getItem('customerSessionId'); // Uncomment to use localStorage
  //             // const sessionId = sessionStorage.getItem('customerSessionId'); // Uncomment to use sessionStorage

  //             // Temporary for debugging:
  //             const sessionId = "dummySessionId"; // This is just for now, remove after implementation

  //             if (!sessionId) {
  //                 setError('Session ID is missing.');
  //                 return;
  //             }

  //             const response = await axios.get('/api/cart', {
  //                 headers: {
  //                     'x-session-id': sessionId,
  //                 }
  //             });

  //             if (response.data.cart) {
  //                 setOrders(response.data.cart);
  //             } else {
  //                 setOrders([]);
  //             }

  //             setError(null);
  //         } catch (err) {
  //             setError('Failed to fetch cart data.');
  //         } finally {
  //             setLoading(false);
  //         }
  //     };

  //     fetchCart();
  // }, []);

  function validateExpiryDate(expiryDate) {
    // Check if the input matches the MM/YY format
    if (!expiryDateRegex.test(expiryDate)) {
      return "Invalid expiry date format. Use MM/YY.";
    }
  
    // Extract month and year from the input (MM/YY)
    const [month, year] = expiryDate.split('/');
  
    // Add "20" prefix to the year to make it a full 4-digit year (e.g., "25" becomes "2025")
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // getMonth() is zero-based, so add 1
  
    const expiryYear = 2000 + parseInt(year, 10); // Convert 2-digit year to 4-digit
    const expiryMonth = parseInt(month, 10);
  
    // Check if the expiry date is in the future
    if (
      expiryYear > currentYear ||
      (expiryYear === currentYear && expiryMonth >= currentMonth)
    ) {
      return "Valid expiry date.";
    } else {
      return "Expiry date must be in the future.";
    }
  }

  const handleConfirmPayment = async () => {
    const cardNumberRegex = /^\d{16}$/;
    const cvvRegex = /^\d{3,4}$/;
    const expiryDateRegex = /^(0[1-9]|1[0-2])\/\d{2}$/; // MM/YY format

    const isValidCardNumber = cardNumberRegex.test(cardNumber);
    const isValidCvv = cvvRegex.test(cvv);
    const isValidExpiryDate = expiryDateRegex.test(expiryDate);

    if (!isValidCardNumber || !isValidCvv || !isValidExpiryDate) {
      alert('Please enter valid payment details.');
      return;
    }

    if (!orderId) {
      alert('Missing order ID.');
      return;
    }

    const existingSession = sessionStorage.getItem('customerSessionId'); // Uncomment to use sessionStorage

    if (!existingSession) {
      setError('Session ID is missing.');
      return;
    }

    // Close payment modal
    setIsPaymentModalOpen(false);

    try {
      const response = await fetch(PAYMENT_IP + '/api/payments/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${sessionId}`, // Uncomment and replace if needed
        },
        body: JSON.stringify({
          sessionId: existingSession,
          checkoutId: orderId,
          paymentStatus: 'successful',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update payment status');
      }

      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error('Payment update error:', error);
      alert('There was an error processing your payment.');
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className={styles.container}>
      <PaymentHeader />
      <div className={styles.content}>
        <div className={styles.main}>
          <div className={styles.header}>
            <ShoppingCart size={32} className={styles.cartIcon} />
            <h2 className={styles.title}>Payment</h2>
          </div>
          {orders.length > 0 ? (
            // orders.map((order) => (
            <div>
              {/* <div className={styles.orderDetails}>
                  <h3>Table: {tableId ?? '-'}</h3>
                  <h3>Order ID: {order?.itemId || '-'}</h3>
                </div> */}
              <p>Items in Cart</p>

              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Quantity</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {orders?.map((item, index) => (
                    <tr key={index}>
                      <td>{item.itemName}</td>
                      <td>{item.quantity}</td>
                      <td>{`$${(item.quantity * item.unitPrice).toFixed(2)}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className={styles.totalAmount}>
                <h3>
                  Total Amount: $
                  {orders
                    ?.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
                    .toFixed(2)}
                </h3>
              </div>

              <button className={styles.paymentButton} onClick={() => setIsPaymentModalOpen(true)}>
                Proceed to Payment
              </button>
            </div>
          ) : (
            // ))
            <p>No items in cart.</p>
          )}
        </div>

        {/* Payment Modal */}
        <Modal
          isOpen={isPaymentModalOpen}
          onRequestClose={() => setIsPaymentModalOpen(false)}
          className={styles.modal}
          overlayClassName={styles.overlay}
        >
          <h3>Enter Payment Details</h3>
          <input
            type="text"
            placeholder="Card Number"
            value={cardNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, ''); // keep only numbers
              if (value.length <= 16) {
                setCardNumber(value);
              }
            }}
            style={{ width: '80%' }}
          />
          <input
            type="tel"
            placeholder="CVV"
            value={cvv}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, ''); // remove non-digits
              setCvv(value);
            }}
            maxLength={4} // typical CVV length: 3 or 4 digits
            style={{ width: '80%' }}
          />
          <input
            type="text"
            placeholder="MM/YY"
            value={expiryDate}
            onChange={(e) => {
              let value = e.target.value.replace(/[^\d]/g, ''); // Remove non-digits
              if (value.length > 4) value = value.slice(0, 4);

              if (value.length >= 3) {
                value = `${value.slice(0, 2)}/${value.slice(2)}`;
              }

              setExpiryDate(value);
            }}
            maxLength={5}
            style={{ width: '80%' }}
          />
          <div className={styles.modalButtons}>
            <button onClick={() => setIsPaymentModalOpen(false)}>Cancel</button>
            <button onClick={handleConfirmPayment}>Confirm</button>
          </div>
        </Modal>

        {/* Success Modal */}
        <Modal
          isOpen={isSuccessModalOpen}
          onRequestClose={() => setIsSuccessModalOpen(false)}
          className={styles.modal}
          overlayClassName={styles.overlay}
        >
          <h3>Order Successfully Placed!</h3>
          <button
            onClick={() => {
              setIsSuccessModalOpen(false);
              router.push('/menu');
            }}
          >
            Close
          </button>
        </Modal>
      </div>
    </div>
  );
};

export default CartPaymentPage;
