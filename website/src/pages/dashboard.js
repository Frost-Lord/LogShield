import Head from 'next/head';
import AdminDashboard from './components/AdminDashboard';

const DashboardPage = () => {
    return (
        <div>
            <Head>
                <title>Dashboard</title>
                <link rel="icon" href="/favicon.ico" />
                <link rel="preconnect" href="https://fonts.gstatic.com"></link>
                <link href="https://fonts.googleapis.com/css?family=Poppins:200,300,400,600,700,800" rel="stylesheet"></link>
            </Head>
            <AdminDashboard />
        </div>
    );
}

export default DashboardPage;