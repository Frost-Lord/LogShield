import Sidebar from './components/Sidebar';
import DashboardArea from './components/DashboardArea';

const AdminDashboard = () => {
    return (
        <div className="admin-dashboard">
            <Sidebar />
            <DashboardArea />
        </div>
    );
}

export default AdminDashboard;