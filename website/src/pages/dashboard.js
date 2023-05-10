import React from 'react';
import Head from 'next/head';
import AdminDashboard from '../components/AdminDashboard';

const DashboardPage = () => {
    return (
        <div>
            <Head>
                <title>Admin Dashboard</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <AdminDashboard />
        </div>
    );
}

export default DashboardPage;