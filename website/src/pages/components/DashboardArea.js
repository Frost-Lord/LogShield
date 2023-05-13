import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '@/styles/DashboardArea.module.css';
import TopRow from './TopRow';
import ActivityCard from './ActivityCard';
import NodeCard from './NodeCard';
import LargestAttacks from './LargestAttacks';
import APICard from './APICard';
import LoadingBar from './LoadingBar';
import Performance from './Performance';

const DashboardArea = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);

    useEffect(() => {
        const nodes = process.env.NEXT_PUBLIC_NODES.split(',').map(node => node.trim());
        
        const fetchData = async () => {
            const results = await Promise.all(nodes.map(node =>
                axios.post(`${node}/logshield/api/admin`, {
                    "auth": "aielgv8sgeasgryleairgearihu",
                }).catch(err => console.log(err))
            ));

            const data = results.map(result => result.data);
            setData(data);
            setTimeout(() => {
                setLoading(false);
            }, 3000);
        }
        fetchData();
    }, []);

    if (loading) {
        return <LoadingBar />;
    }

    return (
        <div className={styles.dashboardArea}>
            <br></br><br></br><br></br><br></br>
                <div key={"1"}>
                    <Performance data={data} />
                    <br></br><br></br>
                    <div className={styles.row}>
                        <LargestAttacks data={data} />
                        <APICard data={data} />
                        <NodeCard data={data} />
                    </div>
                    <TopRow data={data} />
                    <br></br><br></br>
                    <div className={styles.row}>
                        <ActivityCard data={data} />
                    </div>
                </div>
        </div>
    );
};

export default DashboardArea;