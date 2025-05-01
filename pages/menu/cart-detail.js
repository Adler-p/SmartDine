import React, { useState, useEffect } from 'react';
import styles from './CartDetailPage.module.css';
import CartHeader from '../../components/customer/CartHeader';
import DeleteItemButton from '../../components/customer/DeleteItemButton';
import { ShoppingCart } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/router'; // Import useRouter from next/router
import { BACKEND_IP, CART_IP, PAYMENT_IP } from '../../constants';

const CartDetailPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter(); // Initialize the useRouter hook

  useEffect(() => {
    // Fetch cart data when the component mounts
    const fetchCart = async () => {
      setLoading(true);
      try {
        // Retrieve sessionId from localStorage (or sessionStorage)
        // const sessionId = localStorage.getItem('customerSessionId'); // Uncomment to use localStorage
        const existingSession = sessionStorage.getItem('customerSessionId'); // Uncomment to use sessionStorage

        // Temporary for debugging:
        // const sessionId = 'dummySessionId'; // This is just for now, remove after implementation

        if (!existingSession) {
          setError('Session ID is missing.');
          return;
        }

        const response = await axios.post(CART_IP + '/api/cart', {
          "sessionId": existingSession
        });

        if (response.data.cart) {
          setOrders(response.data.cart);
          console.log(orders.toString())
        } else {
          setOrders([]);
        }

        setError(null);
      } catch (err) {
        setError('Failed to fetch cart data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []); // Only run once when the component mounts

  const handleStatusChange = (orderId, itemIndex, newStatus) => {
    setOrders((prevOrders) => {
      return prevOrders.map((order) => {
        if (order.orderId === orderId) {
          const updatedOrder = { ...order };
          updatedOrder.items[itemIndex].status = newStatus;
          return updatedOrder;
        }
        return order;
      });
    });
  };

  const handleQuantityChange = async (itemId, itemIndex, change) => {
    const selectedItem = orders.find((order) => order.itemId === itemId);

    if (!selectedItem) {
      console.error('Item not found');
      return;
    }

    // Calculate the updated quantity
    const updatedQuantity = Math.max(1, selectedItem.quantity + change);

    // If the updated quantity is 0, call handleDeleteItem
    if (updatedQuantity === 0) {
      await handleDeleteItem(itemId, itemIndex); // Delete the item if quantity is 0
      return; // Exit early as we don't need to update the quantity
    }

    const existingSession = sessionStorage.getItem('customerSessionId'); // Uncomment to use sessionStorage

    if (!existingSession) {
      setError('Session ID is missing.');
      return;
    }

    // First, update the backend with the new quantity
    try {
      await axios.post(CART_IP + '/api/cart/update-quantity', {
        "sessionId": existingSession,
        itemId: selectedItem.itemId, // Assuming item has itemId property
        quantity: updatedQuantity,
      }
    );
      console.log('Quantity updated successfully in backend');
    } catch (error) {
      console.error('Error updating quantity:', error);
      return; // Exit early if the backend update fails
    }

    // If the backend update is successful, update the local state
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.itemId === itemId ? { ...order, quantity: updatedQuantity } : order
      )
    );
  };

  const handleDeleteItem = async (itemId, itemIndex) => {
    const itemToDelete = orders.find((order) => order.itemId === itemId);

    if (!itemToDelete) {
      console.error('Item not found');
      return;
    }

    const existingSession = sessionStorage.getItem('customerSessionId'); // Uncomment to use sessionStorage

    if (!existingSession) {
      setError('Session ID is missing.');
      return;
    }

    // Send the DELETE request to remove the item from the cart
    try {
      await axios.post(CART_IP + '/api/cart/remove', {
        "sessionId": existingSession,
        itemId: itemToDelete.itemId, // Assuming item has itemId property
      });
      console.log('Item removed successfully');
    } catch (error) {
      console.error('Error removing item:', error);
    }

    // Update the local state after the request is successful
    setOrders((prev) => prev.filter((item) => item.itemId !== itemId));
  };

  const handleProceedToPayment = async () => {
    const existingSession = sessionStorage.getItem('customerSessionId'); // Uncomment to use sessionStorage

    if (!existingSession) {
      setError('Session ID is missing.');
      return;
    }

    const tableId = sessionStorage.getItem('tableId'); // Uncomment to use sessionStorage

    if (!tableId) {
      setError('Table ID is missing.');
      return;
    }

    try {
      const response = await fetch(CART_IP + '/api/cart/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tableId: tableId, "sessionId": existingSession }), // assuming orders is your cart
      });

      const result = await response.json();

      if (response.ok) {
        // Option 1: Pass items via sessionStorage
        sessionStorage.setItem('checkoutItems', JSON.stringify(result));

        // Redirect
        router.push('/menu/cart-payment');
      } else {
        console.error('Checkout failed:', result.message);
        // Optionally show user error
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      // Optionally show user error
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
      <CartHeader />
      <div className={styles.content}>
        <div className={styles.main}>
          <div className={styles.header}>
            <ShoppingCart size={32} className={styles.cartIcon} />
            <h2 className={styles.title}>My Cart</h2>
          </div>
          {orders?.length > 0 ? (
            // orders.map((order) => (
              <div>
                {/* <div className={styles.orderDetails}>
                  <h3>Table: {order?.table}</h3>
                  <h3>Order ID: {order.itemId}</h3>
                </div> */}
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
                    {orders?.map((item, index) => (
                      <tr key={index}>
                        <td>{item.itemName}</td>
                        <td>
                          <button
                            className={styles.btn}
                            onClick={() => handleQuantityChange(item.itemId, index, -1)}
                            disabled={item.quantity <= 1} // Prevent quantity going below 1
                          >
                            -
                          </button>
                          <span className={styles.quantity}>{item.quantity}</span>
                          <button
                            className={styles.btn}
                            onClick={() => handleQuantityChange(item.itemId, index, 1)}
                          >
                            +
                          </button>
                        </td>
                        <td>{`$${(item.quantity * item.unitPrice).toFixed(2)}`}</td>
                        <td>
                          <DeleteItemButton onDelete={() => handleDeleteItem(item.itemId, index)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button className={styles.paymentButton} onClick={handleProceedToPayment}>
                  Place Order
                </button>
              </div>
            // ))
          ) : (
            <p>No items in cart.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDetailPage;
