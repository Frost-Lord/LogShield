// StatsRow.js
import styles from '@/styles/DashboardArea.module.css';
import Card from './Card';

const StatsRow = () => {
    return (
        <div className={styles['card-row']}>
            <Card title="Card 1">
                <p>test</p>
            </Card>
            <Card title="Card 2">
            <p>test</p>
            </Card>
            <Card title="Card 3">
            <p>test</p>
            </Card>
            <Card title="Card 4">
            <p>test</p>
            </Card>
        </div>
    );
}

export default StatsRow;