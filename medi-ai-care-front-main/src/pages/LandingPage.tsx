import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Heart, Brain, Search, Calendar, FileText, Upload, Star, Shield, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  { icon: Brain, title: 'AI Diagnosis', desc: 'Get instant AI-powered symptom analysis and disease prediction with confidence scores.' },
  { icon: Search, title: 'Doctor Search', desc: 'Find top specialists filtered by expertise, location, experience, and consultation fees.' },
  { icon: Calendar, title: 'Appointment Booking', desc: 'Book appointments with available doctors in real-time with slot management.' },
  { icon: FileText, title: 'Prescription Management', desc: 'Digital prescriptions created by doctors, accessible anytime from your dashboard.' },
  { icon: Upload, title: 'Report Storage', desc: 'Securely upload, store, and access your medical reports and documents.' },
  { icon: Shield, title: 'Data Security', desc: 'End-to-end encryption ensures your health data remains private and secure.' },
];

const testimonials = [
  { name: 'Ananya R.', role: 'Patient', text: 'MediAI Care helped me identify symptoms early. The AI diagnosis was surprisingly accurate!', rating: 5 },
  { name: 'Dr. Vikram S.', role: 'Cardiologist', text: 'Managing appointments and prescriptions digitally has transformed my practice efficiency.', rating: 5 },
  { name: 'Priya M.', role: 'Patient', text: 'Booking appointments is seamless. I love having all my reports in one secure place.', rating: 4 },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-hero">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground">
                <Heart className="h-4 w-4" /> AI-Powered Healthcare
              </div>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-6xl">
                Your Health, <span className="text-gradient-primary">Reimagined</span> with AI
              </h1>
              <p className="mt-6 text-lg text-muted-foreground md:text-xl">
                Experience next-generation healthcare with AI-powered diagnosis, seamless doctor discovery, and complete medical record management — all in one platform.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link to="/diagnosis">
                  <Button size="lg" className="bg-gradient-primary text-primary-foreground hover:opacity-90 gap-2">
                    <Brain className="h-4 w-4" /> Check Symptoms
                  </Button>
                </Link>
                <Link to="/doctors">
                  <Button size="lg" variant="outline" className="gap-2">
                    <Search className="h-4 w-4" /> Find Doctor
                  </Button>
                </Link>
                <Link to="/book-appointment">
                  <Button size="lg" variant="outline" className="gap-2">
                    <Calendar className="h-4 w-4" /> Book Appointment
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
            className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-6 text-center">
            {[['10K+', 'Patients'], ['500+', 'Doctors'], ['50K+', 'Diagnoses']].map(([num, label]) => (
              <div key={label}>
                <p className="text-2xl font-bold text-primary md:text-3xl">{num}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-foreground">Everything You Need for Better Health</h2>
            <p className="mt-3 text-muted-foreground">Comprehensive healthcare tools powered by cutting-edge AI technology.</p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="group rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-elevated">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-primary">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold text-foreground">What Our Users Say</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="flex gap-1">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">"{t.text}"</p>
                <div className="mt-4">
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl rounded-2xl bg-gradient-primary p-10 text-center text-primary-foreground shadow-elevated">
            <h2 className="text-2xl font-bold md:text-3xl">Ready to Transform Your Healthcare?</h2>
            <p className="mt-3 opacity-90">Join thousands of patients and doctors on MediAI Care.</p>
            <Link to="/register">
              <Button size="lg" variant="secondary" className="mt-6 gap-2">
                Get Started Free <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container mx-auto grid gap-8 px-4 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                <Heart className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">MediAI Care</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">AI-powered healthcare platform for a healthier tomorrow.</p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Platform</h4>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <p><Link to="/diagnosis" className="hover:text-primary">AI Diagnosis</Link></p>
              <p><Link to="/doctors" className="hover:text-primary">Find Doctors</Link></p>
              <p><Link to="/book-appointment" className="hover:text-primary">Book Appointment</Link></p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Company</h4>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <p>About Us</p><p>Careers</p><p>Privacy Policy</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Contact</h4>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <p>support@mediaicare.com</p>
              <p>+91 1800-XXX-XXXX</p>
              <p>Mumbai, India</p>
            </div>
          </div>
        </div>
        <div className="container mx-auto mt-8 border-t border-border px-4 pt-6 text-center text-xs text-muted-foreground">
          © 2026 MediAI Care. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
