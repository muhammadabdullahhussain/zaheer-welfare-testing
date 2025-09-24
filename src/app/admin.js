import React from 'react';
import AdminDashboard from '../components/adminDashboard'
import { FirestoreProvider } from '../lib/firestoreContext';

const AdminPage = () => {
  return (
    <FirestoreProvider>
      <AdminDashboard />
    </FirestoreProvider>
  );
};

export default AdminPage;
