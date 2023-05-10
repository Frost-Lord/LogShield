import Sidebar from './Sidebar';
import DashboardArea from './DashboardArea';
import styles from '@/styles/AdminDashboard.module.css';

const AdminDashboard = () => {
    return (
        <div className={styles['admin-dashboard']}>
            <Sidebar />
            <DashboardArea />
        </div>
    );
}

export default AdminDashboard;