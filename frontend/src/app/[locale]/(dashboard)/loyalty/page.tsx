"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Award, Users, Star, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

const PLACEHOLDER_REWARDS = [
  {
    title: "Free Hour",
    description: "Redeem 100 points for 1 free hour of gaming",
    points: 100,
    icon: Star,
  },
  {
    title: "Snack Combo",
    description: "Redeem 50 points for a snack and drink combo",
    points: 50,
    icon: Gift,
  },
  {
    title: "VIP Session",
    description: "Redeem 200 points for a premium VIP gaming session",
    points: 200,
    icon: Award,
  },
];

export default function LoyaltyPage() {
  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: () => api.get("/api/v1/customers").then((r) => r.data),
  });

  const customersList: any[] = Array.isArray(customers)
    ? customers
    : customers?.items || customers?.data || [];

  const totalMembers = customersList.length;
  const totalPoints = customersList.reduce(
    (sum: number, c: any) => sum + (c.total_points || c.points || 0),
    0
  );
  const activeRewards = PLACEHOLDER_REWARDS.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Loyalty Program</h1>
        <p className="text-sm text-muted-foreground">
          Manage members and rewards
        </p>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                  <p className="text-3xl font-bold mt-1">{totalMembers}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Points Distributed
                  </p>
                  <p className="text-3xl font-bold mt-1">{totalPoints}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Star className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Active Rewards
                  </p>
                  <p className="text-3xl font-bold mt-1">{activeRewards}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Gift className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Members Table */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Members</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : customersList.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No members yet</p>
              <p className="text-sm mt-1">
                Customers will appear here once added
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-right">
                      Credit Balance
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customersList.map((customer: any) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        {customer.name || customer.full_name || "Unknown"}
                      </TableCell>
                      <TableCell>{customer.email || "-"}</TableCell>
                      <TableCell>
                        {customer.phone || customer.phone_number || "-"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {(
                          customer.credit_balance ??
                          customer.balance ??
                          0
                        ).toFixed(2)}{" "}
                        MAD
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Rewards Section */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Loyalty Rewards</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {PLACEHOLDER_REWARDS.map((reward) => {
            const Icon = reward.icon;
            return (
              <Card key={reward.title}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-base">{reward.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {reward.description}
                  </p>
                  <Badge variant="secondary">{reward.points} points</Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
