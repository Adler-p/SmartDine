import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import { BACKEND_IP } from '../constants';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCustomerLogin = () => {
    router.push('/menu'); // Replace with your customer page URL
  };

  // useEffect(() => {
  //   const fetchCart = async () => {
  //     try {
  //       const response = await axios.get(BACKEND_IP + '/api/users/currentUser');

  //       // Log response status and data
  //       console.log('Response Status:', response.status);
  //       console.log('Response Data:', response.data);

  //       // You can handle different statuses here if needed
  //       if (response.status === 200) {
  //         console.log('Request was successful');
  //       } else {
  //         console.log('Request failed with status:', response.status);
  //       }
  //     } catch (err) {
  //       console.error('Error fetching cart data:', err);
  //     }
  //   };

  //   fetchCart(); // Execute the fetchCart function when component mounts
  // }, []); // The effect runs only once, similar to componentDidMount

  return (
    <div className="page-container">
      <div className="page-content">
        <h1>SmartDine</h1>

        <div className="loginContainer">
          <button onClick={handleCustomerLogin} className="button">
            Login as Customer
          </button>

          <Link href="/auth/staff-login">
            <button className="button">Login as Staff</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
