"use client";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

interface TeamMember {
  id: string;
  email: string;
  role: string;
  joinedAt: string;
}

export default function TeamMembers() {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchTeamMembers();
  }, [user]);

  const fetchTeamMembers = async () => {
    try {
      const teamMembersRef = collection(db, "team_members");
      const q = query(teamMembersRef, where("teamId", "==", user?.uid));
      const querySnapshot = await getDocs(q);

      const membersData: TeamMember[] = [];
      for (const doc of querySnapshot.docs) {
        const userDoc = await getDocs(query(
          collection(db, "users"),
          where("uid", "==", doc.data().userId)
        ));
        if (!userDoc.empty) {
          membersData.push({
            id: doc.id,
            email: userDoc.docs[0].data().email,
            role: doc.data().role,
            joinedAt: doc.data().joinedAt,
          });
        }
      }

      setMembers(membersData);
    } catch (error) {
      console.error("Error fetching team members:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading team members...</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Joined</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <TableRow key={member.id}>
            <TableCell className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={`https://ui-avatars.com/api/?name=${member.email}&background=random`} />
                <AvatarFallback>{member.email.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              {member.email}
            </TableCell>
            <TableCell className="capitalize">{member.role}</TableCell>
            <TableCell>
              {new Date(member.joinedAt).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}