import Card from './Card';
import styles from '../../styles/ActivityCard.module.css';

const ActivityCard = () => {
    const actions = [
        { user: '127.0.0.1', date: '2023-05-12', action: 'Banned', response: 'Success' },
        { user: '127.0.0.1', date: '2023-05-12', action: 'Banned', response: 'Failed' },
        { user: '127.0.0.1', date: '2023-05-12', action: 'Banned', response: 'Success' }
    ];

    return (
        <Card title="Recent Actions:">
            <br></br>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Source IP:</th>
                        <th>Date</th>
                        <th>Action</th>
                        <th>Response</th>
                    </tr>
                </thead>
                <tbody>
                    <br></br>
                    {actions.map((action, index) => (
                        <tr key={index}>
                            <td>{action.user}</td>
                            <td>{action.date}</td>
                            <td className={styles.action}>{action.action}</td>
                            <td className={action.response === 'Success' ? styles.success : styles.failed}>
                                <div className={styles.dot}></div>
                                {action.response}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Card>
    );
}

export default ActivityCard;
