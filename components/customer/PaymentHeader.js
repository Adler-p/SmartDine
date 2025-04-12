import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router'; 
import styles from './PaymentHeader.module.css';

const PaymentHeader = () => {
    const router = useRouter(); 

    // Function to handle logout
    const handleLogout = () => {
        // Can add any logout logic here if necessary (e.g., clearing cookies, tokens, etc.)
        // Redirect to the main page (home page)
        router.push('/'); // Redirects to the main page (/pages/index.js)
    };

    return (
        <header className={styles.header}>
            <div className={styles.leftButtons}>
                <Link href="/customer/cart-detail">
                    <a>
                        <button className={styles.button}>Cart</button>
                    </a>
                </Link>
            </div>
            <div className={styles.title}>
                <Link href="/customer">
                    <a><span>SmartDine</span></a>
                </Link>
            </div>
            <button className={styles.logout} onClick={handleLogout}>Home</button>
        </header>
    );
};

export default PaymentHeader;
