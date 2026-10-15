import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import doctorService from '../services/doctorService';
import DoctorImage from '../components/DoctorImage';
import { formatINR } from '../utils/currency';

const defaultForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  specialization: '',
  qualification: '',
  department: '',
  city: '',
  experience: '',
  fee: '',
  image: '',
  availableDays: '',
  availableSlots: '',
  biography: '',
};

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const response = await doctorService.getDoctors();
      setDoctors(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to load doctors.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const handleFormChange = (event) => {
    setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }));
  };

  const clearForm = () => {
    setForm(defaultForm);
    setEditingId('');
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setMessage('Choose a JPEG, PNG, or WebP image.');
      setMessageType('error');
      event.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Doctor images must be 5 MB or smaller.');
      setMessageType('error');
      event.target.value = '';
      return;
    }

    try {
      setUploading(true);
      setMessage('');
      const response = await doctorService.uploadDoctorImage(file);
      setForm((previous) => ({ ...previous, image: response.data.image }));
      setMessage('Image uploaded. Save the doctor profile to apply it.');
      setMessageType('success');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to upload doctor image.');
      setMessageType('error');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setMessage('');
      const payload = {
        ...form,
        experience: Number(form.experience),
        fee: Number(form.fee),
        availableDays: form.availableDays.split(',').map((day) => day.trim()).filter(Boolean),
        availableSlots: form.availableSlots.split(',').map((slot) => slot.trim()).filter(Boolean),
      };
      if (editingId && !payload.password) delete payload.password;

      if (editingId) {
        await doctorService.updateDoctor(editingId, payload);
        setMessage('Doctor profile updated successfully.');
      } else {
        await doctorService.createDoctor(payload);
        setMessage('Doctor added successfully.');
      }
      setMessageType('success');
      clearForm();
      await loadDoctors();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Doctor save failed.');
      setMessageType('error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (doctor) => {
    setEditingId(doctor._id);
    setForm({
      name: doctor.user?.name || '',
      email: doctor.user?.email || '',
      password: '',
      phone: doctor.user?.phone || '',
      specialization: doctor.specialization || '',
      qualification: doctor.qualification || '',
      department: doctor.department || '',
      city: doctor.city || '',
      experience: String(doctor.experience ?? ''),
      fee: String(doctor.fee ?? ''),
      image: doctor.image || '',
      availableDays: (doctor.availableDays || []).join(', '),
      availableSlots: (doctor.availableSlots || []).join(', '),
      biography: doctor.biography || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleActive = async (doctor) => {
    const nextActive = doctor.isActive === false;
    const name = doctor.user?.name || 'this doctor';
    if (!nextActive && !window.confirm(`Deactivate ${name}? Their profile will no longer accept new bookings.`)) return;
    try {
      setBusyId(doctor._id);
      await doctorService.updateDoctor(doctor._id, { isActive: nextActive });
      setMessage(`Doctor ${nextActive ? 'activated' : 'deactivated'} successfully.`);
      setMessageType('success');
      await loadDoctors();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to update doctor status.');
      setMessageType('error');
    } finally {
      setBusyId('');
    }
  };

  return (
    <div className="container section admin-page premium-admin-page">
      <header className="admin-page-heading">
        <div><span className="dashboard-eyebrow">CLINICAL TEAM</span><h1>Doctor management</h1><p>Maintain clinician profiles, fees, schedules, and public availability.</p></div>
      </header>

      {message && <div className={`alert ${messageType}`} role={messageType === 'error' ? 'alert' : 'status'}>{message}</div>}

      <form className="analytics-card doctor-admin-form" onSubmit={handleSubmit}>
        <div className="analytics-card-heading">
          <div><h2>{editingId ? 'Edit doctor profile' : 'Add a doctor'}</h2><p>Changes are saved to the doctor database.</p></div>
          {editingId && <button type="button" className="btn btn-secondary btn-small" onClick={clearForm}>Stop editing</button>}
        </div>
        <div className="form-grid">
          <div className="form-group"><label htmlFor="doctor-name">Name</label><input id="doctor-name" name="name" required value={form.name} onChange={handleFormChange} /></div>
          <div className="form-group"><label htmlFor="doctor-email">Email</label><input id="doctor-email" name="email" type="email" required value={form.email} onChange={handleFormChange} /></div>
          <div className="form-group"><label htmlFor="doctor-password">Password {editingId && '(leave blank to keep current)'}</label><input id="doctor-password" name="password" type="password" required={!editingId} value={form.password} onChange={handleFormChange} /></div>
          <div className="form-group"><label htmlFor="doctor-phone">Phone</label><input id="doctor-phone" name="phone" value={form.phone} onChange={handleFormChange} /></div>
          <div className="form-group"><label htmlFor="doctor-specialization">Specialization</label><input id="doctor-specialization" name="specialization" required value={form.specialization} onChange={handleFormChange} /></div>
          <div className="form-group"><label htmlFor="doctor-qualification">Qualification</label><input id="doctor-qualification" name="qualification" value={form.qualification} onChange={handleFormChange} /></div>
          <div className="form-group"><label htmlFor="doctor-department">Department</label><input id="doctor-department" name="department" value={form.department} onChange={handleFormChange} /></div>
          <div className="form-group"><label htmlFor="doctor-city">City</label><input id="doctor-city" name="city" required value={form.city} onChange={handleFormChange} /></div>
          <div className="form-group"><label htmlFor="doctor-experience">Experience (years)</label><input id="doctor-experience" name="experience" type="number" min="0" required value={form.experience} onChange={handleFormChange} /></div>
          <div className="form-group"><label htmlFor="doctor-fee">Consultation fee (INR)</label><input id="doctor-fee" name="fee" type="number" min="0" required value={form.fee} onChange={handleFormChange} /></div>
          <div className="form-group"><label htmlFor="doctor-days">Available days</label><input id="doctor-days" name="availableDays" placeholder="Monday, Wednesday, Friday" value={form.availableDays} onChange={handleFormChange} /></div>
          <div className="form-group"><label htmlFor="doctor-slots">Available time slots</label><input id="doctor-slots" name="availableSlots" placeholder="09:00 AM, 10:00 AM" value={form.availableSlots} onChange={handleFormChange} /></div>
          <div className="form-group"><label htmlFor="doctor-image">Profile image path</label><input id="doctor-image" name="image" placeholder="/images/doctors/example.jpg" value={form.image} onChange={handleFormChange} /><input aria-label="Upload doctor image" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} disabled={uploading} />{uploading && <small>Uploading image...</small>}</div>
          <div className="form-group doctor-bio-field"><label htmlFor="doctor-biography">Biography</label><textarea id="doctor-biography" name="biography" rows="3" maxLength="1000" value={form.biography} onChange={handleFormChange} /></div>
        </div>
        <div className="doctor-form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting || uploading}>{submitting ? 'Saving profile...' : editingId ? 'Save changes' : 'Add doctor'}</button>
          {editingId && <button type="button" className="btn btn-secondary" onClick={clearForm}>Cancel</button>}
        </div>
      </form>

      <section className="analytics-card">
        <div className="analytics-card-heading"><div><h2>Doctor directory</h2><p>{doctors.length} saved profiles · fees displayed in INR</p></div></div>
        {loading ? <div className="loading-state">Loading doctor profiles...</div> : doctors.length ? (
          <div className="table-scroll">
            <table className="admin-data-table">
              <thead><tr><th>Doctor</th><th>Specialization</th><th>City</th><th>Experience</th><th>Fee</th><th>Availability</th><th>Actions</th></tr></thead>
              <tbody>
                {doctors.map((doctor) => (
                  <tr key={doctor._id}>
                    <td><div className="table-doctor-cell"><DoctorImage className="table-doctor-image" imageUrl={doctor.image} name={doctor.user?.name} /><div><strong>{doctor.user?.name || doctor.name}</strong><small>{doctor.qualification || 'Qualification not listed'}</small></div></div></td>
                    <td>{doctor.specialization}</td><td>{doctor.city || '—'}</td><td>{doctor.experience ?? 0} yrs</td><td>{formatINR(doctor.fee ?? 0)}</td>
                    <td><span className={`availability-tag ${doctor.isActive === false ? 'inactive' : ''}`}>{doctor.isActive === false ? 'Inactive' : 'Active'}</span></td>
                    <td><div className="table-action-group">
                      <button className="btn btn-secondary btn-small" type="button" onClick={() => handleEdit(doctor)}>Edit</button>
                      <Link className="btn btn-secondary btn-small" to={`/admin-appointments?doctorId=${doctor._id}`}>Appointments</Link>
                      <button className={`btn btn-small ${doctor.isActive === false ? 'btn-success' : 'btn-danger'}`} type="button" disabled={busyId === doctor._id} onClick={() => handleToggleActive(doctor)}>{doctor.isActive === false ? 'Activate' : 'Deactivate'}</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="empty-state">No doctor profiles are available.</div>}
      </section>
    </div>
  );
};

export default ManageDoctors;
