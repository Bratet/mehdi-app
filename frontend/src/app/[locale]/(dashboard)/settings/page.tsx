"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Settings, Clock, DollarSign, Building2 } from "lucide-react";

export default function SettingsPage() {
  const { data: establishments, isLoading } = useQuery({
    queryKey: ["establishments"],
    queryFn: () => api.get("/api/v1/establishments").then((r) => r.data),
  });

  const establishment = Array.isArray(establishments)
    ? establishments[0]
    : establishments;
  const settings = establishment?.settings || establishment;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your establishment settings
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">
            <Building2 className="h-4 w-4 mr-1" /> General
          </TabsTrigger>
          <TabsTrigger value="rates">
            <DollarSign className="h-4 w-4 mr-1" /> Rates
          </TabsTrigger>
          <TabsTrigger value="hours">
            <Clock className="h-4 w-4 mr-1" /> Hours
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" /> Establishment Info
              </CardTitle>
              <CardDescription>
                General information about your establishment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4 max-w-lg">
                  <div className="space-y-2">
                    <Label>Establishment Name</Label>
                    <Input
                      value={establishment?.name || ""}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input
                      value={
                        establishment?.address || settings?.address || ""
                      }
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={establishment?.phone || settings?.phone || ""}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      value={establishment?.email || settings?.email || ""}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rates Tab */}
        <TabsContent value="rates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" /> Rate Configuration
              </CardTitle>
              <CardDescription>
                Hourly rates for gaming sessions (MAD)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4 max-w-lg">
                  <div className="space-y-2">
                    <Label>Solo Rate per Hour (MAD)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={
                        settings?.solo_rate_per_hour ??
                        establishment?.solo_rate_per_hour ??
                        ""
                      }
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Multiplayer Rate per Hour (MAD)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={
                        settings?.multiplayer_rate_per_hour ??
                        establishment?.multiplayer_rate_per_hour ??
                        ""
                      }
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hours Tab */}
        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" /> Operating Hours
              </CardTitle>
              <CardDescription>
                Opening and closing times for the establishment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4 max-w-lg">
                  <div className="space-y-2">
                    <Label>Opening Time</Label>
                    <Input
                      type="time"
                      value={
                        settings?.opening_time ??
                        establishment?.opening_time ??
                        ""
                      }
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Closing Time</Label>
                    <Input
                      type="time"
                      value={
                        settings?.closing_time ??
                        establishment?.closing_time ??
                        ""
                      }
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
