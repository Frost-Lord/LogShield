import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faCog, faTools } from '@fortawesome/free-solid-svg-icons';
import styles from '@/styles/Sidebar.module.css';

const Sidebar = () => {
    const router = useRouter();

    return (
        <div className={styles.sidebar}>
            <img src="/logo.png" className={styles.logo} />
            <br></br>
            <nav>
                <div className={router.pathname == "/dashboard" ? styles.active : styles['nav-item']}>
                    <FontAwesomeIcon icon={faHome} className={styles.icon} />
                     Dashboard
                </div>
                <div className={router.pathname == "/api" ? styles.active : styles['nav-item']}>
                    <FontAwesomeIcon icon={faCog} className={styles.icon} />
                     API
                </div>
                <div className={router.pathname == "/settings" ? styles.active : styles['nav-item']}>
                    <FontAwesomeIcon icon={faTools} className={styles.icon} />
                     Settings
                </div>
            </nav>
        </div>
    );
}

export default Sidebar;