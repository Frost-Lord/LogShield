import styles from '../../styles/Card.module.css';
import Card from './Card';
import { FaStopwatch } from 'react-icons/fa';


const APICard = ({ data }) => {
    let avgPing;
    let avgUpload;
    let avgDownload;
    if (data && data.length > 0) {
        avgPing = data.reduce((sum, nodeData) => sum + parseInt(nodeData.ping.AVGServerPing || '0', 10), 0) / data.length;
        avgUpload = data.reduce((sum, nodeData) => sum + parseFloat(nodeData.ping.Upload || '0'), 0) / data.length;
        avgDownload = data.reduce((sum, nodeData) => sum + parseFloat(nodeData.ping.Download || '0'), 0) / data.length;
    }

    return (
        <Card title={<><FaStopwatch size={30} /> Ping:</>}>
            <br></br>
            <div className={styles.cardContent}>
                <div>
                    <p>Upload: {avgUpload || 0}</p>
                    <p>Download: {avgDownload || 0}</p>
                </div><br></br>
                <div className={styles.progressBarContainer}>

                </div>
            </div>
        </Card>
    );
}

export default APICard;
