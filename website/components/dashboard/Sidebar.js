import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faCog, faTools } from '@fortawesome/free-solid-svg-icons';
import styles from "../../styles/Sidebar.module.css";

const Sidebar = () => {

    return (
        <div className={styles.sidebar}>
            <nav>
                <div className={styles.active}>
                    <FontAwesomeIcon icon={faHome} className={styles.icon} />
                     Dashboard
                </div>
                <div className={styles['nav-item']}>
                    <FontAwesomeIcon icon={faCog} className={styles.icon} />
                     API
                </div>
                <div className={styles['nav-item']}>
                    <FontAwesomeIcon icon={faTools} className={styles.icon} />
                     Settings
                </div>
            </nav>
        </div>
    );
}

export default Sidebar;