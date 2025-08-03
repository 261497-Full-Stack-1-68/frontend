"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { Member } from "../types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function MemberPage() {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    axios.get<Member[]>("/api/members").then((res) => setMembers(res.data));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center bg-background pt-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Member List</CardTitle>
          <CardDescription>All registered members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {members.map((member) => (
              <Card key={member.id} className="flex flex-col items-center gap-4 p-4 text-center">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={member.imageUrl} alt={member.fullname} />
                  <AvatarFallback>{member.nickname?.[0] || member.fullname?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-lg text-center">{member.fullname}</div>
                  <div className="text-muted-foreground text-sm text-center">{member.nickname} ({member.code})</div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
