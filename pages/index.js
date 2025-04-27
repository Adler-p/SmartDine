import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Home() {
    const router = useRouter();

    const handleCustomerLogin = () => {
        router.push('/menu');  // Replace with your customer page URL
    };

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
