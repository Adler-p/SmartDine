import React, { useState, useEffect } from 'react';
import StaffHeader from '../../components/StaffHeader';
import StaffSidebarMenu from '../../components/StaffSidebarMenu';
import styles from './EditMenu.module.css';
import axios from 'axios';
import { MENU_IP } from '../../constants';
import Image from 'next/image';

const EditMenu = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenuItems = async () => {
      setLoading(true);

      const accessToken = sessionStorage.getItem('accessToken'); // Uncomment to use sessionStorage

      if (!accessToken) {
        setError('Access token is missing.');
        return;
      }

      try {
        const response = await axios.post(MENU_IP + '/api/menu', {
          accessToken,
          category: selectedCategory !== 'All' ? selectedCategory : undefined ,
        },{
          withCredentials: true,
        });
        setMenuItems(response.data);
        setError(null); // Clear any previous error
      } catch (err) {
        setError('Failed to load menu items.');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, [selectedCategory]);

  const toggleAvailability = async (id) => {

    const accessToken = sessionStorage.getItem('accessToken'); // Uncomment to use sessionStorage

    if (!accessToken) {
      setError('Access token is missing.');
      return;
    }

    try {
      const item = menuItems.find((item) => item.id === id);
      const updatedAvailability = item.availability === 'available' ? 'out_of_stock' : 'available';

      await axios.put(
        MENU_IP + `/api/menu/${id}`,
        {
          accessToken,
          availability: updatedAvailability,
        },
        {
          withCredentials: true,
        }
      );

      setMenuItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, availability: updatedAvailability } : item))
      );
    } catch (error) {
      console.error('Error updating item availability', error);
    }
  };

  const filteredItems =
    selectedCategory === 'All'
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  return (
    <>
      <StaffHeader />
      <div className={styles.pageLayout}>
        <StaffSidebarMenu selected={selectedCategory} onSelect={setSelectedCategory} />
        <div className={styles.content}>
          <h2>Edit Menu</h2>
          {loading && <p>Loading menu items...</p>}
          {error && <p>{error}</p>}
          <div className={styles.grid}>
            {filteredItems.map((item) => (
              <div key={item.id} className={styles.card}>
                {/* <Image
                  src={item.imageUrl}
                  alt={item.name}
                  className={styles.image}
                  width={500} // required
                  height={300} // required
                  priority // optional: eager load for LCP images
                /> */}
                <img src={item.imageUrl} alt={item.name} className={styles.image} /> 
                <h3>{item.name}</h3>
                <p>${item.price.toFixed(2)}</p>
                <button
                  onClick={() => toggleAvailability(item.id)}
                  className={
                    item.availability === 'available' ? styles.unavailableBtn : styles.availableBtn
                  }
                >
                  {item.availability === 'available' ? 'Mark as Unavailable' : 'Mark as Available'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default EditMenu;
