import React, { useState, useEffect } from 'react';
import styles from './CartDetailPage.module.css';
import CartHeader from '../../components/customer/CartHeader';
import DeleteItemButton from '../../components/customer/DeleteItemButton';
import { ShoppingCart } from "lucide-react";
import axios from 'axios';
import { useRouter } from 'next/router';  // Import useRouter from next/router

const CartDetailPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();  // Initialize the useRouter hook

    useEffect(() => {
        // Fetch cart data when the component mounts
        const fetchCart = async () => {
            setLoading(true);
            try {
                // Retrieve sessionId from localStorage (or sessionStorage)
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
                        'x-session-id': sessionId, // Send the sessionId in the header
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
    }, []); // Only run once when the component mounts

    const handleStatusChange = (orderId, itemIndex, newStatus) => {
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

    const handleQuantityChange = async (orderId, itemIndex, change) => {
        const selectedItem = orders.find(order => order.orderId === orderId)?.items[itemIndex];
        
        if (!selectedItem) {
            console.error('Item not found');
            return;
        }

        // Calculate the updated quantity
        const updatedQuantity = Math.max(1, selectedItem.quantity + change);

        // If the updated quantity is 0, call handleDeleteItem
        if (updatedQuantity === 0) {
            await handleDeleteItem(orderId, itemIndex); // Delete the item if quantity is 0
            return; // Exit early as we don't need to update the quantity
        }

        // First, update the backend with the new quantity
        try {
            await axios.post('/api/cart/update-quantity', {
                itemId: selectedItem.itemId, // Assuming item has itemId property
                quantity: updatedQuantity
            });
            console.log('Quantity updated successfully in backend');
        } catch (error) {
            console.error('Error updating quantity:', error);
            return; // Exit early if the backend update fails
        }

        // If the backend update is successful, update the local state
        setOrders(prevOrders => prevOrders.map(order => {
            if (order.orderId === orderId) {
                const updatedOrder = { ...order };
                updatedOrder.items = updatedOrder.items.map((item, idx) => {
                    if (idx === itemIndex) {
                        return { ...item, quantity: updatedQuantity };
                    }
                    return item;
                });
                return updatedOrder;
            }
            return order;
        }));
    };


    const handleDeleteItem = async (orderId, itemIndex) => {
        const itemToDelete = orders.find(order => order.orderId === orderId)?.items[itemIndex];
        
        if (!itemToDelete) {
            console.error('Item not found');
            return;
        }

        // Send the DELETE request to remove the item from the cart
        try {
            await axios.post('/api/cart/remove', {
                itemId: itemToDelete.itemId, // Assuming item has itemId property
            });
            console.log('Item removed successfully');
        } catch (error) {
            console.error('Error removing item:', error);
        }

        // Update the local state after the request is successful
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

    const handleProceedToPayment = () => {
        router.push('/menu/card-payment');  // Redirect to /menu/card-payment route
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className={styles.container}>
            <CartHeader />
            <div className={styles.content}>
                <div className={styles.main}>
                    <div className={styles.header}>
                        <ShoppingCart size={32} className={styles.cartIcon} />
                        <h2 className={styles.title}>My Cart</h2>
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
                                <button className={styles.paymentButton} onClick={handleProceedToPayment}>
                                    Place Order
                                </button>
                            </div>
                        ))
                    ) : (
                        <p>No items in cart.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CartDetailPage;