import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from './CartPaymentPage.module.css';
import PaymentHeader from '../../components/customer/PaymentHeader';
import { ShoppingCart } from "lucide-react";
import Modal from 'react-modal';
import axios from 'axios';

const CartPaymentPage = () => {
    const router = useRouter();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [cardNumber, setCardNumber] = useState('');
    const [cvv, setCvv] = useState('');
    const [expiryDate, setExpiryDate] = useState('');

    useEffect(() => {
        const fetchCart = async () => {
            setLoading(true);
            try {
                // const sessionId = localStorage.getItem('customerSessionId'); // Uncomment to use localStorage
                // const sessionId = sessionStorage.getItem('customerSessionId'); // Uncomment to use sessionStorage

                // Temporary for debugging:
                const sessionId = "dummySessionId"; // This is just for now, remove after implementation

                if (!sessionId) {
                    setError('Session ID is missing.');
                    return;
                }

                const response = await axios.get('/api/cart', {
                    headers: {
                        'x-session-id': sessionId,
                    }
                });

                if (response.data.cart) {
                    setOrders(response.data.cart);
                } else {
                    setOrders([]);
                }

                setError(null);
            } catch (err) {
                setError('Failed to fetch cart data.');
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, []);


    const handleConfirmPayment = async () => {
        const cardNumberRegex = /^\d{16}$/;
        const cvvRegex = /^\d{3,4}$/;
        const expiryDateRegex = /^(0[1-9]|1[0-2])\/\d{2}$/; // MM/YY format
    
        const isValidCardNumber = cardNumberRegex.test(cardNumber);
        const isValidCvv = cvvRegex.test(cvv);
        const isValidExpiryDate = expiryDateRegex.test(expiryDate);
    
        if (!isValidCardNumber || !isValidCvv || !isValidExpiryDate) {
            alert("Please enter valid payment details.");
            return;
        }
    
        const storedOrderId = sessionStorage.getItem('orderId'); // retrieve from storage
    
        if (!storedOrderId) {
            alert("Missing order ID.");
            return;
        }
    
        // Close payment modal
        setIsPaymentModalOpen(false);
    
        try {
            const response = await fetch('/api/payments/update-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${sessionId}`, // Uncomment and replace if needed
                },
                body: JSON.stringify({
                    orderId: storedOrderId,
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
                        orders.map(order => (
                            <div key={order.orderId}>
                                <div className={styles.orderDetails}>
                                    <h3>Table: {order.table}</h3>
                                    <h3>Order ID: {order.orderId}</h3>
                                </div>
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
                                        {order.items.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.name}</td>
                                                <td>{item.quantity}</td>
                                                <td>{`$${(item.quantity * item.price).toFixed(2)}`}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className={styles.totalAmount}>
                                    <h3>
                                        Total Amount: $
                                        {order.items
                                            .reduce((sum, item) => sum + item.price * item.quantity, 0)
                                            .toFixed(2)}
                                    </h3>
                                </div>

                                <button className={styles.paymentButton} onClick={() => setIsPaymentModalOpen(true)}>
                                    Proceed to Payment
                                </button>
                            </div>
                        ))
                    ) : (
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
                        onChange={(e) => setCardNumber(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="CVV"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Expiry Date (MM/YY)"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
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
                    <button onClick={() => {
                        setIsSuccessModalOpen(false);
                        router.push('/menu');
                    }}>
                        Close
                    </button>
                </Modal>
            </div>
        </div>
    );
};

export default CartPaymentPage;