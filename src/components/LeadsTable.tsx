"use client";
import { useState, useEffect } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
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
  const [leads, setLeads] = useState<Lead[]>([]);
  const [newLead, setNewLead] = useState<Omit<Lead, 'id'>>({
    name: "",
    email: "",
    company: "",
    status: "new",
  });
  const [loading, setLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);

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
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell>{lead.name}</TableCell>
              <TableCell>{lead.email}</TableCell>
              <TableCell>{lead.company}</TableCell>
              <TableCell className="capitalize">{lead.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}