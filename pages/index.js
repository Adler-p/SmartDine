import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Home() {
    const router = useRouter();

    const handleGuestLogin = () => {
        router.push('/main-ordering');  // Replace with your customer page URL
    };

    return (
        <div className="container">
            <h1>SmartDine</h1>

            <div className="loginContainer">
                <button onClick={handleGuestLogin} className="button">
                    Login as Guest
                </button>

                <Link href="/auth/staff-login">
                    <button className="button">Login as Staff</button>
                </Link>
            </div>
        </div>
    );
}
