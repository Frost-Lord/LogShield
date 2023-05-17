import Sidebar from './Sidebar';
import dynamic from 'next/dynamic';
const DashboardArea = dynamic(() => import('./DashboardArea'), {
  ssr: false,
});
import TopNavBar from './TopNavBar';
import styles from '../../styles/AdminDashboard.module.css';

const AdminDashboard = () => {
    return (
        <div className={styles['admin-dashboard']}>
            <Sidebar />
            <TopNavBar currentPage="" />
            <DashboardArea />
        </div>
    );
}

export default AdminDashboard;