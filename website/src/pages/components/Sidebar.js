import Link from 'next/link';
import styles from '@/styles/Sidebar.module.css';

const Sidebar = () => {
    return (
        <div className={styles.sidebar}>
            <h2>Admin Dashboard</h2>
            <Link href="/dashboard/stats" className={styles['nav-item']}>Stats</Link>
            <Link href="/dashboard/requests" className={styles['nav-item']}>Requests</Link>
            <Link href="/dashboard/api" className={styles['nav-item']}>API</Link>
            <Link href="/dashboard/activity" className={styles['nav-item']}>Activity</Link>
        </div>
    );
}

export default Sidebar;
