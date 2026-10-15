import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as adminService from '../services/adminService';
import DoctorImage from '../components/DoctorImage';
import { formatINR } from '../utils/currency';

const statCards = [
  { key: 'totalDoctors', label: 'Total doctors', tone: 'blue', mark: 'DR' },
  { key: 'totalPatients', label: 'Total patients', tone: 'teal', mark: 'PT' },
  { key: 'totalAppointments', label: 'Total appointments', tone: 'indigo', mark: 'AP' },
  { key: 'todayAppointments', label: "Today's appointments", tone: 'cyan', mark: 'TD' },
  { key: 'pendingAppointments', label: 'Pending appointments', tone: 'amber', mark: 'PE' },
  { key: 'confirmedAppointments', label: 'Confirmed appointments', tone: 'green', mark: 'CF' },
  { key: 'completedAppointments', label: 'Completed appointments', tone: 'violet', mark: 'CM' },
  { key: 'cancelledAppointments', label: 'Cancelled appointments', tone: 'rose', mark: 'CX' },
];

const formatDay = (value) => new Date(`${value}T12:00:00`).toLocaleDateString('en-IN', { weekday: 'short' });
const formatMonth = (value) => new Date(`${value}-01T12:00:00`).toLocaleDateString('en-IN', { month: 'short' });

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await adminService.getDashboard();
        setDashboard(response.data);
      } catch (loadError) {
        setError(loadError.response?.data?.message || 'Unable to load dashboard analytics.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <div className="container section"><div className="loading-state">Loading your healthcare overview...</div></div>;
  }
  if (error) {
    return <div className="container section"><div className="alert error">{error}</div></div>;
  }

  const statistics = dashboard?.statistics || {};
  const dailyAppointments = dashboard?.dailyAppointments || [];
  const monthlyAppointments = dashboard?.monthlyAppointments || [];
  const appointmentStatusCounts = dashboard?.appointmentStatusCounts || [];
  const doctorAppointments = dashboard?.doctorAppointments || [];
  const recentAppointments = dashboard?.recentAppointments || [];
  const maxDailyCount = Math.max(1, ...dailyAppointments.map(({ count }) => count));
  const maxMonthlyCount = Math.max(1, ...monthlyAppointments.map(({ count }) => count));
  const linePoints = dailyAppointments.map(({ count }, index) => {
    const x = dailyAppointments.length > 1 ? (index / (dailyAppointments.length - 1)) * 300 : 150;
    const y = 96 - (count / maxDailyCount) * 76;
    return `${x},${y}`;
  }).join(' ');
  const totalStatusCount = appointmentStatusCounts.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="admin-dashboard premium-dashboard">
      <aside className="admin-sidebar" aria-label="Admin navigation">
        <div className="admin-sidebar-heading">CareConnect <span>ADMIN</span></div>
        <Link to="/admin-dashboard" className="admin-sidebar-link active">Overview</Link>
        <Link to="/admin-appointments" className="admin-sidebar-link">Appointments</Link>
        <Link to="/admin-doctors" className="admin-sidebar-link">Doctors</Link>
        <Link to="/admin-patients" className="admin-sidebar-link">Patients</Link>
        <div className="admin-sidebar-note">Secure healthcare operations</div>
      </aside>

      <div className="admin-dashboard-content">
        <header className="admin-dashboard-header">
          <div>
            <span className="dashboard-eyebrow">CARE OPERATIONS</span>
            <h1>Good day, Admin</h1>
            <p>Monitor appointments, clinicians, and patient activity.</p>
          </div>
          <Link to="/admin-appointments" className="btn btn-primary">Review appointments</Link>
        </header>

        <section className="dashboard-stat-grid" aria-label="Healthcare statistics">
          {statCards.map((card) => (
            <article className={`dashboard-stat-card tone-${card.tone}`} key={card.key}>
              <div className="dashboard-stat-mark">{card.mark}</div>
              <span>{card.label}</span>
              <strong>{statistics[card.key] ?? 0}</strong>
            </article>
          ))}
        </section>

        <section className="analytics-grid" aria-label="Appointment analytics">
          <article className="analytics-card daily-chart-card">
            <div className="analytics-card-heading">
              <div><h2>Daily appointments</h2><p>Last seven days</p></div>
              <Link to="/admin-appointments">View all</Link>
            </div>
            {dailyAppointments.length ? (
              <>
                <svg className="daily-chart" viewBox="0 0 300 112" role="img" aria-label="Daily appointment trend">
                  <line x1="0" y1="96" x2="300" y2="96" className="chart-axis" />
                  <line x1="0" y1="58" x2="300" y2="58" className="chart-gridline" />
                  <line x1="0" y1="20" x2="300" y2="20" className="chart-gridline" />
                  <polyline points={linePoints} className="daily-chart-line" />
                  {dailyAppointments.map((item, index) => {
                    const x = dailyAppointments.length > 1 ? (index / (dailyAppointments.length - 1)) * 300 : 150;
                    const y = 96 - (item.count / maxDailyCount) * 76;
                    return <circle key={item.date} cx={x} cy={y} r="4" className="daily-chart-point"><title>{item.count} appointments</title></circle>;
                  })}
                </svg>
                <div className="chart-label-row">
                  {dailyAppointments.map((item) => <span key={item.date}>{formatDay(item.date)}</span>)}
                </div>
              </>
            ) : <div className="empty-state">No daily appointment data yet.</div>}
          </article>

          <article className="analytics-card status-chart-card">
            <div className="analytics-card-heading"><div><h2>Appointment status</h2><p>{totalStatusCount} appointments</p></div></div>
            <div className="status-chart-list">
              {appointmentStatusCounts.map((item) => (
                <div className="status-chart-item" key={item.status}>
                  <div className="status-chart-label">
                    <span className={`status-dot status-dot-${item.status}`} />
                    <span>{item.status}</span>
                    <strong>{item.count}</strong>
                  </div>
                  <div className="status-track">
                    <span className={`status-fill status-fill-${item.status}`} style={{ width: `${totalStatusCount ? (item.count / totalStatusCount) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="analytics-card monthly-chart-card">
            <div className="analytics-card-heading"><div><h2>Monthly appointments</h2><p>Rolling 12-month view</p></div></div>
            {monthlyAppointments.length ? (
              <div className="monthly-bars">
                {monthlyAppointments.map((item) => (
                  <div className="monthly-bar-column" key={item.month} title={`${item.count} appointments`}>
                    <span className="monthly-bar-count">{item.count || ''}</span>
                    <div className="monthly-bar-track">
                      <span style={{ height: `${item.count ? Math.max(6, (item.count / maxMonthlyCount) * 100) : 0}%` }} />
                    </div>
                    <small>{formatMonth(item.month)}</small>
                  </div>
                ))}
              </div>
            ) : <div className="empty-state">No monthly appointment data yet.</div>}
          </article>

          <article className="analytics-card doctor-analytics-card">
            <div className="analytics-card-heading"><div><h2>Top doctors</h2><p>By appointment volume</p></div><Link to="/admin-doctors">Manage</Link></div>
            {doctorAppointments.length ? (
              <div className="top-doctors-list">
                {doctorAppointments.map((doctor) => (
                  <div className="top-doctor-row" key={doctor.doctorId}>
                    <DoctorImage className="top-doctor-image" imageUrl={doctor.image} name={doctor.name} />
                    <div className="top-doctor-name"><strong>{doctor.name}</strong><span>{doctor.specialization || 'Profile unavailable'}</span></div>
                    <b>{doctor.count}</b>
                  </div>
                ))}
              </div>
            ) : <div className="empty-state">Doctor appointment counts will appear here.</div>}
          </article>
        </section>

        <section className="analytics-card recent-appointments-card">
          <div className="analytics-card-heading"><div><h2>Recent appointments</h2><p>Latest activity across the clinic</p></div><Link to="/admin-appointments">Manage appointments</Link></div>
          {recentAppointments.length ? (
            <div className="table-scroll">
              <table className="admin-data-table">
                <thead><tr><th>Patient</th><th>Doctor</th><th>Appointment</th><th>Fee</th><th>Status</th></tr></thead>
                <tbody>
                  {recentAppointments.map((appointment) => (
                    <tr key={appointment._id}>
                      <td>{appointment.patient?.name || 'Patient'}</td>
                      <td>{appointment.doctor?.user?.name || 'Doctor profile unavailable'}</td>
                      <td>{new Date(appointment.date).toLocaleDateString('en-IN')} · {appointment.timeSlot}</td>
                      <td>{formatINR(appointment.fee ?? appointment.doctor?.fee ?? 0)}</td>
                      <td><span className={`status-badge status-${appointment.status}`}>{appointment.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div className="empty-state">No appointments have been booked yet.</div>}
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
