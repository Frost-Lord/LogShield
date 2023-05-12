import styles from "@/styles/Card.module.css";
import Card from './Card';
import { FaStopwatch } from 'react-icons/fa';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const APICard = ({ data }) => {
    const avgPing = parseInt(data.ping.AVGServerPing || '0', 10);
    return (
        <Card title={<><FaStopwatch size={30} /> Ping:</>}>
            <br></br>
            <div className={styles.cardContent}>
                <div>
                    <p>Upload: {data.ping.Upload || 0}</p>
                    <p>Download: {data.ping.Download || 0}</p>
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
