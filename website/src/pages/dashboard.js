import Head from 'next/head';
import AdminDashboard from './components/AdminDashboard';

const DashboardPage = () => {
    return (
        <div>
            <Head>
                <title>Dashboard</title>
                <link rel="icon" href="/favicon.ico" />
                <link rel="preconnect" href="https://fonts.gstatic.com"></link>
                <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&amp;display=swap" rel="stylesheet"></link>
            </Head>
            <AdminDashboard />
        </div>
    );
}

export default DashboardPage;