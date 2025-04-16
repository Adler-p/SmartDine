import { useRouter } from 'next/router';
import React, { useState } from 'react';
import styles from './CartDetailPage.module.css';
import CartHeader from '../../components/customer/CartHeader';
import DeleteItemButton from '../../components/customer/DeleteItemButton';
import { ShoppingCart } from "lucide-react";

const CartDetailPage = () => {
    const router = useRouter();
    const { id } = router.query; 

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

    // Function to handle status change for each item
    const handleStatusChange = (orderId, itemIndex, newStatus) => {
        // Update the status of the item based on index
        setOrders(prevOrders => {
            return prevOrders.map(order => {
                if (order.orderId === orderId) {
                    const updatedOrder = { ...order };
                    updatedOrder.items[itemIndex].status = newStatus;
                    return updatedOrder;
                }
                return order;
            });
        });
    };

    const handleQuantityChange = (orderId, itemIndex, change) => {
        setOrders(prevOrders => {
            return prevOrders.map(order => {
                if (order.orderId === orderId) {
                    const updatedOrder = { ...order };
                    updatedOrder.items = updatedOrder.items.map((item, idx) => {
                        if (idx === itemIndex) {
                            return { ...item, quantity: Math.max(1, item.quantity + change) };
                        }
                        return item;
                    });
                    return updatedOrder;
                }
                return order;
            });
        });
    };

    // Function to delete an item
    const handleDeleteItem = (orderId, itemIndex) => {
        setOrders(prevOrders => prevOrders.map(order => {
            if (order.orderId === orderId) {
                return {
                    ...order,
                    items: order.items.filter((_, idx) => idx !== itemIndex)
                };
            }
            return order;
        }));
    };

    return (
        <div className={styles.container}>
            <CartHeader />
            <div className={styles.content}>
                {/* <StaffSidebar /> */}
                <div className={styles.main}>
                    <div className={styles.header}>
                        <ShoppingCart size={32} className={styles.cartIcon} />
                        <h2 className={styles.title}>My Cart</h2>
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
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.name}</td>
                                            <td>
                                                <button 
                                                    className={styles.btn} 
                                                    onClick={() => handleQuantityChange(order.orderId, index, -1)}
                                                    disabled={item.quantity <= 1} // Prevent quantity going below 1
                                                >
                                                    -
                                                </button>
                                                <span className={styles.quantity}>{item.quantity}</span>
                                                <button 
                                                    className={styles.btn} 
                                                    onClick={() => handleQuantityChange(order.orderId, index, 1)}
                                                >
                                                    +
                                                </button>
                                            </td>
                                            <td>{`$${(item.quantity * item.price).toFixed(2)}`}</td>
                                            <td>
                                                <DeleteItemButton onDelete={() => handleDeleteItem(order.orderId, index)} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    ) : (
                        <p>Items not found</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CartDetailPage;
