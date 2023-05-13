import React, { useEffect, useRef } from 'react';
import styles from '@/styles/DashboardArea.module.css';
import Card from './Card';
import { Chart } from 'chart.js/auto';
import { FaUserLock, FaStopwatch, FaShieldAlt } from 'react-icons/fa';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const TopRow = ({ data }) => {
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    const totalRequests = data.reduce((sum, nodeData) => sum + (nodeData.rpm.requestsPerMinute.allowed || 0) + (nodeData.rpm.requestsPerMinute.blocked || 0), 0);
    const blockedRequests = data.reduce((sum, nodeData) => sum + (nodeData.rpm.requestsPerMinute.blocked || 0), 0);
    const allowedRequests = data.reduce((sum, nodeData) => sum + (nodeData.rpm.requestsPerMinute.allowed || 0), 0);

    const chartData = {
        labels: ['Total', 'Allowed', 'Blocked'],
        datasets: [
            {
                label: 'RPS',
                data: [totalRequests, allowedRequests, blockedRequests],
                fill: true,
                backgroundColor: 'rgba(28, 128, 216, 0.2)',
                borderColor: '#1c80d8',
                pointBackgroundColor: '#1c80d8',
                borderWidth: 2,
            },
        ],
    };

    const options = {
        scales: {
            r: {
                beginAtZero: true,
            },
        },
        elements: {
            point: {
                radius: 4,
            },
        },
        plugins: {
            legend: {
                display: true,
            },
            tooltip: {
                enabled: true,
            },
        },
        maintainAspectRatio: false,
    };

    useEffect(() => {
        if (chartRef.current) {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
            chartInstanceRef.current = new Chart(chartRef.current, {
                type: 'radar',
                data: chartData,
                options: options,
            });
        }
        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [chartRef]);

    const blockedIPs = data.reduce((sum, nodeData) => sum + (nodeData.rateLimit.CurrentlyBlockedUsers.current|| 0), 0);
    const totalblockedIPs = data.reduce((sum, nodeData) => sum + (nodeData.rateLimit.CurrentlyBlockedUsers.total || 0), 0);
    const blockedIPsPercentage = ((blockedIPs / 1000) * 100);

    const totalWAFBlocked = data.reduce((sum, nodeData) => sum + (nodeData.waf.totalwafblocked || 0), 0);

    return (
        <div className={styles['card-row']}>
            <Card title={<><FaUserLock size={20} /> RateLimit:</>}>
                <div className={styles.cardContent}><p><br></br>
                    <p>Currently Blocked IP's: {blockedIPs}</p>
                    <p>Total req Blocked: {totalblockedIPs || 0}</p>
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
                <div className={styles.chartContainer}>
                    <canvas ref={chartRef} />
                </div>
            </Card>
            <Card title={<><FaStopwatch size={30} /> System:</>}>
                <div className={styles.cardContent}><p><br></br>
                    <p>RAM:</p>
                </p>
                    <div className={styles.cardContent}><p><br></br>
                        <p>CPU:</p>
                    </p>
                    </div>
                </div>
            </Card>

            <Card title={<><FaShieldAlt size={30} /> WAF:</>}>
                <div className={styles.cardContent}><p><br></br>
                    <p>Total Blocked: {totalWAFBlocked || 0}</p>
                </p>
                </div>
            </Card>
        </div>
    );
}

export default TopRow;
