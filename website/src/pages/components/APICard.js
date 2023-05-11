import styles from "@/styles/Card.module.css";
import Card from './Card';
import { FaStopwatch } from 'react-icons/fa';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const APICard = ({ data }) => {

    const totalmemory = parseInt(data.system.totalmem || '0', 10);
    const freememory = parseInt(data.system.freemem || '0', 10);
    const memPercentage = totalmemory ? ((freememory / totalmemory) * 100) : 0;

    return (
        <Card title={<><FaStopwatch size={30} /> Requests Per Minute:</>}>
            <div className={styles.cardContent}><p><br></br>
                <p>RAM:</p>
            </p>
                <div className={styles.progressBarContainer}>
                    <CircularProgressbar
                        value={memPercentage}
                        text={`${memPercentage.toFixed(0)}%`}
                        styles={buildStyles({
                            pathColor: memPercentage > 50 ? 'red' : 'green',
                            textColor: 'white'
                        })}
                    />
                </div>
                <div className={styles.cardContent}><p><br></br>
                    <p>CPU:</p>
                </p>
                </div>
            </div>
        </Card>
    );
}

export default APICard;
