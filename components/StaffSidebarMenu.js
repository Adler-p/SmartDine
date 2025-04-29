import React, { useState, useEffect } from 'react';
import styles from './StaffSidebarMenu.module.css';
import { AUTH_IP, MENU_IP } from '../constants';

const StaffSidebarMenu = ({ selected, onSelect }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the categories dynamically when the component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(MENU_IP + '/api/menu'); // Fetch all menu items
        if (!response.ok) {
          throw new Error('Failed to fetch menu items');
        }
        const data = await response.json();

        // Extract unique categories from the menu items
        const uniqueCategories = [...new Set(data.map((item) => item.category))];
        setCategories(uniqueCategories); // Set the categories state
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle loading and error states
  if (loading) {
    return <div>Loading categories...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className={styles.sidebar}>
      {categories.map((cat) => (
        <button
          key={cat} // Using category name as the key
          className={`${styles.categoryButton} ${selected === cat ? styles.active : ''}`}
          onClick={() => onSelect(cat)} // Pass selected category to parent
        >
          {cat} {/* Display category name */}
        </button>
      ))}
    </div>
  );
};

export default StaffSidebarMenu;
