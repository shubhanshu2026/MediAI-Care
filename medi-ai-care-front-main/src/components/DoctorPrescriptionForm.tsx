import React, { useState } from 'react';
import { jsPDF } from "jspdf";
import { Button } from '@/components/ui/button';
import { FileDown, Plus, Trash2, Pill, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios'; // Ensure axios is installed

interface Medicine {
  name: string;
  dosage: string;
}

// Added props for appointmentId and patientEmail to link to the database
export default function DoctorPrescriptionForm({ 
  patientName = "Shubhanshu", 
  appointmentId = 1, 
  patientEmail = "patient@example.com" 
}) {
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([{ name: '', dosage: '' }]);
  const [isSaving, setIsSaving] = useState(false);

  const addMedicine = () => setMedicines([...medicines, { name: '', dosage: '' }]);

  const removeMedicine = (index: number) => {
    const newMeds = medicines.filter((_, i) => i !== index);
    setMedicines(newMeds);
  };

  const updateMedicine = (index: number, field: keyof Medicine, value: string) => {
    const newMeds = [...medicines];
    newMeds[index][field] = value;
    setMedicines(newMeds);
  };

  const handleGenerateAndSave = async () => {
    if (!diagnosis || medicines[0].name === '') {
      toast.error("Please enter diagnosis and at least one medicine");
      return;
    }

    setIsSaving(true);
    try {
      // --- CAPSTONE STEP: SAVE TO MYSQL VIA SPRING BOOT ---
      await axios.post('http://localhost:8080/api/medical/prescription/issue', {
        appointmentId: appointmentId,
        patientEmail: patientEmail,
        doctorName: "Dr. Sharma", // In a real app, get this from auth context
        diagnosis: diagnosis,
        medicines: JSON.stringify(medicines) // Save list as JSON string
      });

      // --- GENERATE PDF LOGIC ---
      const doc = new jsPDF();
      
      // Header Blue Bar
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text("Medi AI - Digital Health Record", 20, 25);
      
      // Patient Info
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text(`Patient: ${patientName}`, 20, 50);
      doc.text(`Email: ${patientEmail}`, 20, 56);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 50);
      doc.line(20, 62, 190, 62);

      // Diagnosis
      doc.setFontSize(14);
      doc.text("Diagnosis:", 20, 75);
      doc.setFontSize(11);
      doc.text(diagnosis, 25, 85, { maxWidth: 160 });

      // Medicines Table
      doc.setFontSize(14);
      doc.text("Rx - Prescribed Medicines:", 20, 110);
      doc.setFontSize(11);
      medicines.forEach((med, i) => {
        doc.text(`${i + 1}. ${med.name}`, 25, 120 + (i * 10));
        doc.text(`Dosage: ${med.dosage}`, 120, 120 + (i * 10));
      });

      // Digital Footer
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text("This document is digitally signed and verified by Medi AI Care.", 20, 280);
      
      doc.save(`Prescription_${patientName}_${Date.now()}.pdf`);
      toast.success("Prescription saved to Cloud & Downloaded!");
      
    } catch (error) {
      console.error(error);
      toast.error("Database connection failed. Is Spring Boot running?");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-[32px] border bg-card p-8 shadow-2xl max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h2 className="text-2xl font-black flex items-center gap-2">
            <Pill className="text-primary h-6 w-6" /> Issue Prescription
          </h2>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
            Appointment ID: #{appointmentId}
          </p>
        </div>
        <div className="bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10">
            <span className="text-[10px] font-black text-primary uppercase">Secure Digital Portal</span>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Diagnosis & Observations</label>
          <textarea 
            className="w-full rounded-2xl border bg-muted/10 p-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all border-slate-200"
            rows={3}
            placeholder="Describe the patient's condition..."
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Medication Plan</label>
          {medicines.map((med, index) => (
            <div key={index} className="flex gap-3 items-center animate-in slide-in-from-left-2">
              <input 
                className="flex-1 rounded-xl border p-3.5 text-sm bg-muted/5 border-slate-200"
                placeholder="Medicine Name (e.g. Paracetamol)"
                value={med.name}
                onChange={(e) => updateMedicine(index, 'name', e.target.value)}
              />
              <input 
                className="w-36 rounded-xl border p-3.5 text-sm bg-muted/5 border-slate-200"
                placeholder="Dosage (1-0-1)"
                value={med.dosage}
                onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
              />
              <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/5 rounded-xl" onClick={() => removeMedicine(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={addMedicine} className="w-full h-12 rounded-xl border-dashed border-2 font-bold text-xs gap-2 hover:border-primary hover:text-primary transition-all">
            <Plus className="h-3 w-3" /> Add Another Medication
          </Button>
        </div>
      </div>

      <Button 
        onClick={handleGenerateAndSave} 
        disabled={isSaving}
        className="w-full h-16 rounded-2xl text-lg font-bold gap-3 shadow-xl shadow-primary/20 active:scale-[0.98] transition-transform"
      >
        {isSaving ? (
          <><Loader2 className="h-5 w-5 animate-spin" /> Syncing with Database...</>
        ) : (
          <><FileDown className="h-5 w-5" /> Sign & Generate Prescription</>
        )}
      </Button>
    </div>
  );
}