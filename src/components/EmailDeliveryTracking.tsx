"use client";
import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, limit, where, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { EmailDelivery } from "@/types/interfaces";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import useCredits from "@/hooks/useCredits";

export default function EmailDeliveryTracking() {
  const { user } = useAuth();
  const { deductCredits } = useCredits();
  const [emails, setEmails] = useState<EmailDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState({
    subject: "",
    recipient: "",
  });
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    if (user) fetchEmails();
  }, [user]);

  const fetchEmails = async () => {
    try {
      const q = query(
        collection(db, `users/${user?.uid}/emailDeliveries`),
        orderBy("sentAt", "desc"),
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      setEmails(querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as EmailDelivery)));
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching emails:", error);
      toast.error("Failed to load email tracking data");
      setLoading(false);
    }
  };

  const sendEmail = async () => {
    if (!newEmail.subject || !newEmail.recipient) {
      toast.error("Please enter both subject and recipient");
      return;
    }

    // Check if we have credits
    const success = await deductCredits('email_tracking', 1);
    if (!success) {
      toast.error("Insufficient email tracking credits");
      return;
    }

    setSendingEmail(true);
    try {
      // In a real implementation, this would call your email sending service
      // For now, we'll simulate sending and create a tracking record
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const emailData: Omit<EmailDelivery, 'id'> = {
        subject: newEmail.subject,
        recipient: newEmail.recipient,
        sentAt: new Date().toISOString(),
        opened: false,
        clicked: false,
        replied: false,
        bounced: false
      };
      
      // Add to Firestore
      await addDoc(collection(db, `users/${user?.uid}/emailDeliveries`), emailData);
      
      toast.success("Email sent with tracking");
      setNewEmail({ subject: "", recipient: "" });
      fetchEmails();
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  const simulateEmailEvent = async (emailId: string, event: 'open' | 'click' | 'reply') => {
    try {
      const emailRef = collection(db, `users/${user?.uid}/emailDeliveries`);
      const q = query(emailRef, where("id", "==", emailId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const emailDoc = querySnapshot.docs[0];
        const emailData = emailDoc.data() as EmailDelivery;
        
        const now = new Date().toISOString();
        const updates: Partial<EmailDelivery> = {};
        
        if (event === 'open') {
          updates.opened = true;
          updates.openedAt = now;
        } else if (event === 'click') {
          updates.clicked = true;
          updates.clickedAt = now;
        } else if (event === 'reply') {
          updates.replied = true;
          updates.repliedAt = now;
        }
        
        await addDoc(collection(db, `users/${user?.uid}/emailDeliveries`), {
          ...emailData,
          ...updates
        });
        
        toast.success(`Email ${event} event recorded`);
        fetchEmails();
      }
    } catch (error) {
      console.error(`Error simulating ${event}:`, error);
      toast.error(`Failed to record ${event} event`);
    }
  };

  const getDeliveryRate = () => {
    if (emails.length === 0) return 100;
    const delivered = emails.filter(email => !email.bounced).length;
    return Math.round((delivered / emails.length) * 100);
  };

  const getOpenRate = () => {
    if (emails.length === 0) return 0;
    const opened = emails.filter(email => email.opened).length;
    return Math.round((opened / emails.length) * 100);
  };

  const getClickRate = () => {
    if (emails.length === 0) return 0;
    const clicked = emails.filter(email => email.clicked).length;
    return Math.round((clicked / emails.length) * 100);
  };

  const getReplyRate = () => {
    if (emails.length === 0) return 0;
    const replied = emails.filter(email => email.replied).length;
    return Math.round((replied / emails.length) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Delivery Rate</p>
              <p className="text-3xl font-bold text-green-600">{getDeliveryRate()}%</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Open Rate</p>
              <p className="text-3xl font-bold text-blue-600">{getOpenRate()}%</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Click Rate</p>
              <p className="text-3xl font-bold text-purple-600">{getClickRate()}%</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Reply Rate</p>
              <p className="text-3xl font-bold text-indigo-600">{getReplyRate()}%</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Send Tracked Email</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <Input
                placeholder="Email subject"
                value={newEmail.subject}
                onChange={(e) => setNewEmail({...newEmail, subject: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Recipient</label>
              <Input
                placeholder="recipient@example.com"
                value={newEmail.recipient}
                onChange={(e) => setNewEmail({...newEmail, recipient: e.target.value})}
              />
            </div>
            
            <Button 
              onClick={sendEmail} 
              disabled={sendingEmail || !newEmail.subject || !newEmail.recipient}
              className="w-full"
            >
              {sendingEmail ? "Sending..." : "Send Tracked Email"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Email Tracking History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading email data...</div>
          ) : emails.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No tracked emails yet. Send your first tracked email above.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emails.map((email) => (
                  <TableRow key={email.id}>
                    <TableCell>{email.subject}</TableCell>
                    <TableCell>{email.recipient}</TableCell>
                    <TableCell>{new Date(email.sentAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {email.bounced ? (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Bounced</span>
                        ) : (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Delivered</span>
                        )}
                        
                        {email.opened && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Opened</span>
                        )}
                        
                        {email.clicked && (
                          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Clicked</span>
                        )}
                        
                        {email.replied && (
                          <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">Replied</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {!email.opened && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => simulateEmailEvent(email.id, 'open')}
                          >
                            Simulate Open
                          </Button>
                        )}
                        
                        {email.opened && !email.clicked && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => simulateEmailEvent(email.id, 'click')}
                          >
                            Simulate Click
                          </Button>
                        )}
                        
                        {email.clicked && !email.replied && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => simulateEmailEvent(email.id, 'reply')}
                          >
                            Simulate Reply
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}