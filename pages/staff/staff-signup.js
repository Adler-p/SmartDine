import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router'; // Import useRouter from Next.js
import styles from './StaffSignup.module.css';
import { AUTH_IP } from '../../constants';

const StaffSignup = () => {
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [message, setMessage] = useState('');
  const router = useRouter(); // Initialize useRouter

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await axios.post(AUTH_IP + '/api/users/signup', {
        ...form,
        role: 'staff',
      });

      setMessage(`Signup successful! Welcome ${response.data.name}`);

      // Redirect to the staff dashboard after successful signup
      router.push('/staff/edit-menu'); // This will navigate to the pages/staff/index.js
    } catch (err) {
      const errorMsg = err.response?.data?.errors?.[0]?.message || 'Signup failed.';
      setMessage(errorMsg);
    }
  };

  return (
    <div className={styles['page-container']}>
      <div className={styles['page-content']}>
        <h1>Staff SignUp</h1>
        <form onSubmit={handleSubmit} className={styles.signupContainer}>
          <input
            className={styles.input}
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            className={styles.input}
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            className={styles.input}
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          {message && <p className={styles.error}>{message}</p>}
          <button className={styles.button} type="submit">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default StaffSignup;
