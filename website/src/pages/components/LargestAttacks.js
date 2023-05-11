import Card from './Card';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const LargestAttacks = ({ data }) => {
    const chartData = Object.entries(data.rateLimit.Totalblocked).map(([date, Amount]) => ({ date, Amount }));

    return (
        <Card title="API Requests Blocked:">
            <br></br>
            <LineChart width={500} height={300} data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Amount" stroke="#FF4500" fillOpacity={1} fill="rgba(255, 69, 0, 0.2)" dot={true} />
            </LineChart>
        </Card>
    );
}

export default LargestAttacks;
