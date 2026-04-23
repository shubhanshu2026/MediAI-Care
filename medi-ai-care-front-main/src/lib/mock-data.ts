export const mockDoctors = [
  { id: '1', name: 'Dr. Sarah Johnson', specialization: 'Cardiologist', experience: 12, hospital: 'Apollo Hospital', fee: 500, rating: 4.8, avatar: '' },
  { id: '2', name: 'Dr. Michael Chen', specialization: 'Dermatologist', experience: 8, hospital: 'Max Healthcare', fee: 400, rating: 4.6, avatar: '' },
  { id: '3', name: 'Dr. Priya Sharma', specialization: 'Neurologist', experience: 15, hospital: 'Fortis Hospital', fee: 600, rating: 4.9, avatar: '' },
  { id: '4', name: 'Dr. James Wilson', specialization: 'Orthopedic', experience: 10, hospital: 'Apollo Hospital', fee: 450, rating: 4.7, avatar: '' },
  { id: '5', name: 'Dr. Aisha Patel', specialization: 'Pediatrician', experience: 6, hospital: 'AIIMS', fee: 350, rating: 4.5, avatar: '' },
  { id: '6', name: 'Dr. Robert Lee', specialization: 'General Physician', experience: 20, hospital: 'Medanta', fee: 300, rating: 4.8, avatar: '' },
];

export const mockAppointments = [
  { id: '1', doctor: 'Dr. Sarah Johnson', specialization: 'Cardiologist', date: '2026-03-10', time: '10:00 AM', status: 'upcoming' as const },
  { id: '2', doctor: 'Dr. Michael Chen', specialization: 'Dermatologist', date: '2026-03-05', time: '2:00 PM', status: 'completed' as const },
  { id: '3', doctor: 'Dr. Priya Sharma', specialization: 'Neurologist', date: '2026-03-15', time: '11:30 AM', status: 'upcoming' as const },
];

export const mockPrescriptions = [
  { id: '1', doctor: 'Dr. Sarah Johnson', date: '2026-03-05', medicines: [{ name: 'Aspirin', dosage: '100mg', instructions: 'Once daily after meals' }, { name: 'Atorvastatin', dosage: '20mg', instructions: 'Once at bedtime' }] },
  { id: '2', doctor: 'Dr. Michael Chen', date: '2026-02-28', medicines: [{ name: 'Cetirizine', dosage: '10mg', instructions: 'Once daily' }] },
];

export const mockReports = [
  { id: '1', name: 'Blood Test Report', date: '2026-03-01', type: 'PDF', size: '2.4 MB' },
  { id: '2', name: 'X-Ray Report', date: '2026-02-20', type: 'Image', size: '5.1 MB' },
  { id: '3', name: 'MRI Scan', date: '2026-01-15', type: 'PDF', size: '8.7 MB' },
];

export const mockSlots = [
  { id: '1', time: '09:00 AM', available: true },
  { id: '2', time: '09:30 AM', available: false },
  { id: '3', time: '10:00 AM', available: true },
  { id: '4', time: '10:30 AM', available: true },
  { id: '5', time: '11:00 AM', available: false },
  { id: '6', time: '11:30 AM', available: true },
  { id: '7', time: '02:00 PM', available: true },
  { id: '8', time: '02:30 PM', available: true },
  { id: '9', time: '03:00 PM', available: false },
  { id: '10', time: '03:30 PM', available: true },
];

export const specializations = [
  'All', 'Cardiologist', 'Dermatologist', 'Neurologist', 'Orthopedic', 'Pediatrician', 'General Physician', 'ENT', 'Ophthalmologist', 'Psychiatrist',
];
