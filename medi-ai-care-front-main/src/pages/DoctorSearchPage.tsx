import { useState, useEffect } from 'react';
import { DoctorCard } from '@/components/DoctorCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Doctor } from '@/api/doctorApi';
import { specializations, mockDoctors } from '@/lib/mock-data';
import { Search, Loader2, Stethoscope, Filter, Users } from 'lucide-react';

export default function DoctorSearchPage() {
  const [search, setSearch] = useState('');
  const [spec, setSpec] = useState('All');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchDoctors = async (specialization: string) => {
    setLoading(true);
    // Simulating API call delay for a smoother production feel
    setTimeout(() => {
      let data = mockDoctors;

      if (specialization !== 'All') {
        data = mockDoctors.filter(
          (doc) => doc.specialization === specialization
        );
      }

      setDoctors(data);
      setFetched(true);
      setLoading(false);
    }, 600);
  };

  useEffect(() => {
    fetchDoctors(spec);
  }, [spec]);

  const filtered = doctors.filter(d => {
    const matchesSearch = 
      d.name.toLowerCase().includes(search.toLowerCase()) || 
      d.hospital.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  // NOTICE: No <Navbar /> here. The DashboardLayout in App.tsx handles the navigation.
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Search Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-10 text-primary-foreground shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest opacity-80">
            <Users className="h-4 w-4" />
            Medical Network
          </div>
          <h1 className="text-3xl font-bold md:text-4xl">Find a Specialist</h1>
          <p className="text-primary-foreground/80 leading-relaxed">
            Connect with verified healthcare professionals from our global network. 
            Search by name, hospital, or select a specialization.
          </p>
          
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search by name or hospital..." 
                className="h-12 border-none bg-white pl-10 text-foreground focus-visible:ring-offset-0" 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
            </div>
            <Select value={spec} onValueChange={setSpec}>
              <SelectTrigger className="h-12 w-full border-none bg-white text-foreground sm:w-[220px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Specialization" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Specializations</SelectItem>
                {specializations.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Decorative Background Icon */}
        <Stethoscope className="absolute -right-12 -bottom-12 h-64 w-64 rotate-12 text-white/10" />
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Available Doctors</h2>
          <p className="text-sm text-muted-foreground">Showing {filtered.length} results matching your criteria</p>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Filtering our network...</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map(d => (
              <DoctorCard key={d.id} {...d} />
            ))}
          </div>

          {fetched && filtered.length === 0 && (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-muted bg-muted/5 p-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-lg font-semibold text-foreground">No doctors found</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your search terms or changing the specialization.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}