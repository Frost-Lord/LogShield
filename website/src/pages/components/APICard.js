import styles from "@/styles/Card.module.css";
import Card from './Card';
import { FaStopwatch } from 'react-icons/fa';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const APICard = ({ data }) => {
    const avgPing = data.reduce((sum, nodeData) => sum + parseInt(nodeData.ping.AVGServerPing || '0', 10), 0) / data.length;
    const avgUpload = data.reduce((sum, nodeData) => sum + parseFloat(nodeData.ping.Upload || '0'), 0) / data.length;
    const avgDownload = data.reduce((sum, nodeData) => sum + parseFloat(nodeData.ping.Download || '0'), 0) / data.length;

    return (
        <Card title={<><FaStopwatch size={30} /> Ping:</>}>
            <br></br>
            <div className={styles.cardContent}>
                <div>
                    <p>Upload: {avgUpload || 0}</p>
                    <p>Download: {avgDownload || 0}</p>
                </div><br></br>
                <div className={styles.progressBarContainer}>
                    <CircularProgressbar
                        value={avgPing}
                        maxValue={1000}
                        text={`${avgPing || "Null "}ms`}
                        styles={buildStyles({
                            pathColor: avgPing > 100 ? 'red' : 'green',
                            textColor: 'white'
                        })}
                    />
                </div>
            </div>
        </Card>
    );
}

export default APICard;
