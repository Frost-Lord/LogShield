import styles from "@/styles/Card.module.css";
import Card from './Card';
import { FaSync } from 'react-icons/fa';

const NodeCard = ({ data }) => {
    const nodes = [
        { node: 1, status: 'online', uptime: 88048.234 },
        { node: 2, status: 'offline', uptime: 88048.234 },
        { node: 3, status: 'online', uptime: 88048.234 },
    ];

    const formatUptime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        return `${hours}h ${minutes}m ${remainingSeconds}s`;
    }

    return (
        <Card title={"Nodes:"}>
            {nodes.map((node, index) => (
                <div key={index} className={styles.node}>
                    <span
                        className={styles.statusDot}
                        style={{ backgroundColor: node.status === 'online' ? '#04d182' : '#da0000' }}
                    />
                    Node: {node.node}
                    <FaSync className={styles.updateIcon} />
                    <span>
                        Uptime: {formatUptime(node.uptime)}
                    </span>
                </div>
            ))}
        </Card>
    );
}

export default NodeCard;
