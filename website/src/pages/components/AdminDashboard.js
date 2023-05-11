import Sidebar from './Sidebar';
import DashboardArea from './DashboardArea';
import TopNavBar from './TopNavBar';
import styles from '@/styles/AdminDashboard.module.css';

const AdminDashboard = () => {
    return (
        <div className={styles['admin-dashboard']}>
            <Sidebar />
            <TopNavBar currentPage="Dashboard" />
            <DashboardArea />
        </div>
    );
}

export default AdminDashboard;