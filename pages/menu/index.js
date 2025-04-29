// pages/customer/index.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import CustomerHeader from '../../components/customer/CustomerHeader';
import StaffSidebarMenu from '../../components/StaffSidebarMenu';
import styles from './CustomerPage.module.css';
import Modal from 'react-modal';
import axios from 'axios';
import { BACKEND_IP } from '../../constants';
import Image from 'next/image';

const Menu = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [menuItems, setMenuItems] = useState([]);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initSession = async () => {
      const existingSession = sessionStorage.getItem('customerSessionId');
      let tableId = router.query.tableId;

      if (!tableId) {
        tableId = prompt('Enter your Table ID:');
      }

      if (!tableId) {
        console.warn('No table ID provided. Cannot continue.');
        return;
      }

      sessionStorage.setItem('tableId', tableId);

      if (!existingSession) {
        try {
          const res = await axios.get(BACKEND_IP + '/api/session/create', {
            params: { role: 'customer', tableId },
          });

          const urlParams = new URLSearchParams(res.request.responseURL.split('?')[1]);
          const sessionId = urlParams.get('sessionId');

          if (sessionId) {
            sessionStorage.setItem('customerSessionId', sessionId);
            console.log('New customer session:', sessionId);
          }
        } catch (err) {
          console.error('Error creating session', err);
        }
      }
    };

    if (router.isReady) {
      initSession();
    }
  }, [router]);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get(BACKEND_IP + '/api/menu', {
        params: { category: selectedCategory !== 'All' ? selectedCategory : undefined },
      });
      setMenuItems(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load menu items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const handleConfirmPayment = async (id) => {
    const selectedItem = menuItems.find((item) => item.id === id);

    if (!selectedItem) {
      console.error('Missing item data');
      return;
    }

    try {
      // Call the Add to Cart endpoint
      await axios.get(BACKEND_IP + '/api/cart/add', {
        // headers: {
        //     'x-session-id': sessionId
        // },
        params: {
          item: JSON.stringify({
            itemId: selectedItem.id,
            itemName: selectedItem.name,
            unitPrice: selectedItem.price,
            quantity: 1,
          }),
        },
      });

      // Fetch the updated menu items from the backend
      await fetchMenuItems(); // Wait for the menu items to be updated

      // Show success modal
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error('Failed to add to cart', error);
      alert('Something went wrong while adding the item to the cart.');
    }
  };

  const filteredItems =
    selectedCategory === 'All'
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  return (
    <>
      <CustomerHeader />
      <div className={styles.pageLayout}>
        <StaffSidebarMenu selected={selectedCategory} onSelect={setSelectedCategory} />
        <div className={styles.content}>
          <h2>{selectedCategory}</h2>
          {loading && <p>Loading menu items...</p>}
          {error && <p>{error}</p>}
          <div className={styles.grid}>
            {filteredItems.map((item) => (
              <div key={item.id} className={styles.card}>
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  className={styles.image}
                  width={500} // required
                  height={300} // required
                  priority // optional: eager load for LCP images
                />
                {/* <img src={item.imageUrl} alt={item.name} className={styles.image} /> */}
                <h3>{item.name}</h3>
                <p>${item.price.toFixed(2)}</p>
                <button
                  onClick={() => handleConfirmPayment(item.id)}
                  className={item.availability ? styles.availableBtn : styles.unavailableBtn}
                  disabled={!item.availability}
                >
                  {item.availability ? 'Add to Cart' : 'Unavailable'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isSuccessModalOpen}
        onRequestClose={() => setIsSuccessModalOpen(false)}
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <h3>Item added to cart!</h3>
        <button onClick={() => setIsSuccessModalOpen(false)}>Back to menu</button>
      </Modal>
    </>
  );
};

export default Menu;
