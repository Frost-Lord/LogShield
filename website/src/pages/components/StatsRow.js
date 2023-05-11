import styles from '@/styles/DashboardArea.module.css';
import Card from './Card';

const StatsRow = ({ data }) => {
    return (
        <div className={styles['card-row']}>
            <Card title="RateLimit:"><br></br>
                <p>Currently Blocked Users:</p>
                <p>Total blocked:</p>
            </Card>
            <Card title="Requests Per Minute:"><br></br>
            <p>Total:</p>
            <p>Allowed:</p>
            <p>Blocked:</p>
            </Card>
            <Card title="Ping:"><br></br>
            <p>AVG Server Ping: {data.ping.AVGServerPing}</p>
            <p>Upload:</p>
            <p>Download:</p>
            </Card>
            <Card title="WAF:"><br></br>
            <p>Total WAF Blocked:</p>
            </Card>
        </div>
    );
}

export default StatsRow;