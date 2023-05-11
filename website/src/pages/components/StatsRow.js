import styles from '@/styles/DashboardArea.module.css';
import Card from './Card';
import { FaUserLock, FaStopwatch, FaServer, FaShieldAlt } from 'react-icons/fa';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const StatsRow = ({ data }) => {
    const avgPing = parseInt(data.ping.AVGServerPing || '0', 10);

    const totalRequests = parseInt(data.rpm.requestsPerMinute.blocked + data.rpm.requestsPerMinute.allowed || '0', 10);
    const blockedRequests = parseInt(data.rpm.requestsPerMinute.blocked || '0', 10);
    const blockedPercentage = totalRequests ? ((blockedRequests / totalRequests) * 100) : 0;

    const blockedIPs = parseInt(data.rateLimit.CurrentlyBlockedUsers.current || '0', 10);
    const blockedIPsPercentage = ((blockedIPs / 1000) * 100);

    return (
        <div className={styles['card-row']}>
            <Card title={<><FaUserLock size={20} /> RateLimit:</>}>
                <div className={styles.cardContent}><p><br></br>
                    <p>Currently Blocked IP's: {blockedIPs}</p>
                    <p>Total req Blocked: {data.rateLimit.CurrentlyBlockedUsers.reqests || 0}</p>
                </p>
                    <div className={styles.progressBarContainer}>
                        <CircularProgressbar
                            value={blockedIPsPercentage}
                            text={`${blockedIPsPercentage.toFixed(0)}%`}
                            styles={buildStyles({
                                pathColor: blockedIPsPercentage > 50 ? 'red' : 'green',
                                textColor: 'white'
                            })}
                        />
                    </div>
                </div>
            </Card>
            <Card title={<><FaStopwatch size={30} /> Requests Per Minute:</>}>
                <div className={styles.cardContent}><p><br></br>
                    <p>Total: {totalRequests}</p>
                    <p>Allowed: {data.rpm.requestsPerMinute.allowed || 0}</p>
                    <p>Blocked: {blockedRequests}</p>
                </p>
                    <div className={styles.progressBarContainer}>
                        <CircularProgressbar
                            value={blockedPercentage}
                            text={`${blockedPercentage.toFixed(0)}%`}
                            styles={buildStyles({
                                pathColor: blockedPercentage > 50 ? 'red' : 'green',
                                textColor: 'white'
                            })}
                        />
                    </div>
                </div>
            </Card>
            <Card title={<><FaStopwatch size={30} /> Ping:</>}>
                <div className={styles.cardContent}>
                    <div>
                        <p>Upload: {data.ping.Upload || 0}</p>
                        <p>Download: {data.ping.Download || 0}</p>
                    </div>
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

            <Card title={<><FaShieldAlt size={30} /> WAF:</>}>
                <div className={styles.cardContent}><p><br></br>
                    <p>Total Blocked: {data.waf.totalwafblocked || 0}</p>
                </p>
                </div>
            </Card>
        </div>
    );
}

export default StatsRow;
