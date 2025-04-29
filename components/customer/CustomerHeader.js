import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './CustomerHeader.module.css';
import { ShoppingCart } from 'lucide-react';

const CustomerHeader = () => {
  const router = useRouter();

  // Function to handle logout
  const handleLogout = () => {
    // Can add any logout logic here if necessary (e.g., clearing cookies, tokens, etc.)
    // Redirect to the main page (home page)
    router.push('/'); // Redirects to the main page (/pages/index.js)
  };

  return (
    <header className={styles.header}>
      <div className={styles.leftButtons}></div>
      <div className={styles.title}>
        <Link href="/menu">
          <a>
            <span>SmartDine</span>
          </a>
        </Link>
      </div>
      <div className={styles.title}>
        <Link href="/menu/cart-detail">
          <ShoppingCart size={32} className={styles.cartIcon} />
          {/* <a><span>Cart</span></a> */}
        </Link>
      </div>
    </header>
  );
};

export default CustomerHeader;
