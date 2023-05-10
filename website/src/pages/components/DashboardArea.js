// DashboardArea.js
import styles from '@/styles/DashboardArea.module.css';
import StatsRow from './StatsRow';
import ActivityCard from './ActivityCard';
import RequestCard from './RequestCard';
import APICard from './APICard';

const DashboardArea = () => {
    return (
        <div className={styles.dashboardArea}>
          <br></br>
            <StatsRow />
            <br></br>
            <div className={styles.row}>
                <RequestCard />
                <APICard />
            </div>
            <br></br>
            <div className={styles.row}>
                <ActivityCard />
            </div>
        </div>
    );
};

export default DashboardArea;