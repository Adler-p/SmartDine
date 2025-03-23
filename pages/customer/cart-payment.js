import { useRouter } from 'next/router';
import React, { useState } from 'react';
import styles from './CartPaymentPage.module.css';
import PaymentHeader from '../../components/customer/PaymentHeader';
import { ShoppingCart } from "lucide-react";
import Modal from 'react-modal';

const CartPaymentPage = () => {
    const router = useRouter();
    const { id } = router.query; 

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [cardNumber, setCardNumber] = useState('');
    const [cvv, setCvv] = useState('');
    const [expiryDate, setExpiryDate] = useState('');


    // Hardcoded orders data for now
    const [orders, setOrders] = useState([
        {
            orderId: '001',
            time: '2025-02-25 11:45',
            table: 'Table 01',
            items: [
                { name: 'Chicken Chop', quantity: 1, price: 5.00 },
                { name: 'Fish Fillet', quantity: 1, price: 10.00 },
                { name: 'Ice Water', quantity: 1, price: 6.00 }
            ]
        },
        {
            orderId: '002',
            time: '2025-02-25 12:15',
            table: 'Table 02',
            items: [
                { name: 'Steak', quantity: 2, price: 15.00 }
            ]
        },
        {
            orderId: '003',
            time: '2025-02-25 12:30',
            table: 'Table 03',
            items: []
        }
    ]);

    // Find the order matching the id from the URL
    const order = orders.find(order => order.orderId === id);

    // Calculate total amount
    const totalAmount = order ? order.items.reduce((sum, item) => sum + item.price * item.quantity, 0) : 0;

    const handleConfirmPayment = () => {
        setIsPaymentModalOpen(false); // Close payment modal
        setIsSuccessModalOpen(true);  // Open success modal
    };

    return (
        <div className={styles.container}>
            <PaymentHeader />
            <div className={styles.content}>
                {/* <StaffSidebar /> */}
                <div className={styles.main}>
                    <div className={styles.header}>
                        <ShoppingCart size={32} className={styles.cartIcon} />
                        <h2 className={styles.title}>Payment</h2>
                    </div>
                    {order ? (
                        <>
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

                            {/* Total Amount */}
                            <div className={styles.totalAmount}>
                                <h3>Total Amount: ${totalAmount.toFixed(2)}</h3>
                            </div>

                            <button className={styles.paymentButton} onClick={() => setIsPaymentModalOpen(true)}>
                                Proceed to Payment
                            </button>
                        </>
                    ) : (
                        <p>Items not found</p>
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
                    <button onClick={() => setIsSuccessModalOpen(false)}>Close</button>
                </Modal>
            </div>
        </div>
    );
};

export default CartPaymentPage;
