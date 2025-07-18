"use client";
import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import useCredits from "@/hooks/useCredits";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

export default function LeadsTable() {
  const { user } = useAuth();
  const { deductCredits } = useCredits();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [newLead, setNewLead] = useState<Omit<Lead, 'id'>>({
    name: "",
    email: "",
    company: "",
    status: "new",
  });
  const [loading, setLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState<string | null>(null);
  const [enrichingCompany, setEnrichingCompany] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchLeads();
  }, [user]);

  const fetchLeads = async () => {
    try {
      const querySnapshot = await getDocs(
        collection(db, `users/${user?.uid}/leads`)
      );
      setLeads(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead)));
    } catch (error) {
      toast.error("Failed to fetch leads");
    }
  };

  const addLead = async () => {
    if (!newLead.name || !newLead.email || !newLead.company) {
      toast.error("Please fill required fields");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, `users/${user?.uid}/leads`), {
        ...newLead,
        createdAt: new Date().toISOString(),
      });
      toast.success("Lead added successfully");
      setNewLead({
        name: "",
        email: "",
        company: "",
        status: "new",
      });
      fetchLeads();
    } catch (error) {
      toast.error("Failed to add lead");
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (leadId: string, email: string) => {
    // Check if we have credits
    const success = await deductCredits('email_verification', 1);
    if (!success) {
      toast.error("Insufficient email verification credits");
      return;
    }

    setVerifyingEmail(email);
    try {
      // Simulate email verification API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update lead with verified status
      const leadRef = doc(db, `users/${user?.uid}/leads`, leadId);
      await updateDoc(leadRef, {
        emailVerified: true,
        emailVerifiedAt: new Date().toISOString()
      });
      
      toast.success(`Email ${email} verified successfully`);
      fetchLeads();
    } catch (error) {
      toast.error("Failed to verify email");
    } finally {
      setVerifyingEmail(null);
    }
  };

  const enrichCompany = async (leadId: string, company: string) => {
    // Check if we have credits
    const success = await deductCredits('company_enrichment', 1);
    if (!success) {
      toast.error("Insufficient company enrichment credits");
      return;
    }

    setEnrichingCompany(company);
    try {
      // Simulate company enrichment API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Sample enrichment data
      const enrichmentData = {
        industry: ["Technology", "SaaS", "Marketing"][Math.floor(Math.random() * 3)],
        size: ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"][Math.floor(Math.random() * 6)],
        founded: 2010 + Math.floor(Math.random() * 13),
        location: ["San Francisco, CA", "New York, NY", "Austin, TX"][Math.floor(Math.random() * 3)],
        revenue: ["$1M-$5M", "$5M-$10M", "$10M-$50M"][Math.floor(Math.random() * 3)],
        website: `https://www.${company.toLowerCase().replace(/\s/g, '')}.com`,
        technologies: ["React", "Node.js", "AWS", "MongoDB", "Python", "TensorFlow"]
          .sort(() => 0.5 - Math.random()).slice(0, 3)
      };
      
      // Update lead with enrichment data
      const leadRef = doc(db, `users/${user?.uid}/leads`, leadId);
      await updateDoc(leadRef, {
        enriched: true,
        enrichedAt: new Date().toISOString(),
        enrichmentData
      });
      
      toast.success(`Company ${company} enriched successfully`);
      fetchLeads();
    } catch (error) {
      toast.error("Failed to enrich company");
    } finally {
      setEnrichingCompany(null);
    }
  };

  const exportToCSV = () => {
    if (leads.length === 0) {
      toast.error("No leads to export");
      return;
    }

    try {
      // Prepare CSV content
      const headers = Object.keys(leads[0]).join(",");
      const rows = leads.map(lead => 
        Object.values(lead).map(value => 
          typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
        ).join(",")
      ).join("\n");

      const csvContent = [headers, ...rows].join("\n");
      
      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `opulflow-leads-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      
      toast.success("Leads exported successfully");
    } catch (error) {
      toast.error("Failed to export leads");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          const lines = content.split("\n").filter(line => line.trim() !== "");
          
          if (lines.length < 2) {
            toast.error("CSV file is empty or invalid");
            return;
          }

          const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ''));
          const importedLeads = lines.slice(1).map(line => {
            const values = line.split(",").map(v => v.trim().replace(/"/g, ''));
            return headers.reduce((obj, header, index) => {
              obj[header] = values[index] || "";
              return obj;
            }, {} as any);
          });

          // Validate required fields
          const validLeads = importedLeads.filter(
            (lead) => lead.name && lead.email && lead.company
          );

          if (validLeads.length === 0) {
            toast.error("No valid leads found in file");
            return;
          }

          if (validLeads.length !== importedLeads.length) {
            toast.warning(`Imported ${validLeads.length} of ${importedLeads.length} leads (some were invalid)`);
          }

          // Add to Firestore
          await Promise.all(
            validLeads.map((lead) =>
              addDoc(collection(db, `users/${user?.uid}/leads`), {
                name: lead.name,
                email: lead.email,
                company: lead.company,
                title: lead.title || "",
                phone: lead.phone || "",
                status: lead.status || "new",
                notes: lead.notes || "",
                createdAt: new Date().toISOString(),
              })
            )
          );

          toast.success(`Successfully imported ${validLeads.length} leads`);
          fetchLeads();
        } catch (error) {
          toast.error("Failed to process CSV file");
        } finally {
          setCsvLoading(false);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      toast.error("Failed to import leads");
      setCsvLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex gap-2 flex-1">
          <Input
            placeholder="Name"
            value={newLead.name}
            onChange={(e) => setNewLead({...newLead, name: e.target.value})}
          />
          <Input
            placeholder="Email"
            type="email"
            value={newLead.email}
            onChange={(e) => setNewLead({...newLead, email: e.target.value})}
          />
          <Input
            placeholder="Company"
            value={newLead.company}
            onChange={(e) => setNewLead({...newLead, company: e.target.value})}
          />
          <Button onClick={addLead} disabled={loading}>
            {loading ? "Adding..." : "Add Lead"}
          </Button>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={exportToCSV}
            disabled={leads.length === 0}
          >
            Export CSV
          </Button>
          <Button 
            variant="outline" 
            asChild
            disabled={csvLoading}
          >
            <label className="cursor-pointer">
              {csvLoading ? "Importing..." : "Import CSV"}
              <input
                type="file"
                accept=".csv"
                onChange={handleImport}
                className="hidden"
                disabled={csvLoading}
              />
            </label>
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell>{lead.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {lead.email}
                  {lead.emailVerified && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Verified</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {lead.company}
                  {lead.enriched && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Enriched</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="capitalize">{lead.status}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {!lead.emailVerified && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => verifyEmail(lead.id, lead.email)}
                      disabled={verifyingEmail === lead.email}
                    >
                      {verifyingEmail === lead.email ? "Verifying..." : "Verify Email"}
                    </Button>
                  )}
                  {!lead.enriched && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => enrichCompany(lead.id, lead.company)}
                      disabled={enrichingCompany === lead.company}
                    >
                      {enrichingCompany === lead.company ? "Enriching..." : "Enrich Company"}
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}