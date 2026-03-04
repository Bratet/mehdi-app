"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Monitor, Plus, Wifi, WifiOff, Search } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  available: "border-status-available bg-status-available/5",
  occupied: "border-status-occupied bg-status-occupied/5",
  maintenance: "border-status-maintenance bg-status-maintenance/5",
  out_of_service: "border-status-out bg-status-out/5",
};

const statusLabels: Record<string, string> = {
  available: "Available",
  occupied: "Occupied",
  maintenance: "Maintenance",
  out_of_service: "Out of Service",
};

export default function DevicesPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newDevice, setNewDevice] = useState({ name: "", device_type_id: "", establishment_id: "" });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: devices, isLoading } = useQuery({
    queryKey: ["devices"],
    queryFn: () => api.get("/api/v1/devices").then((r) => r.data),
  });

  const { data: deviceTypes } = useQuery({
    queryKey: ["device-types"],
    queryFn: () => api.get("/api/v1/devices/types").then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/api/v1/devices", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      setDialogOpen(false);
      toast({ title: "Device created" });
    },
  });

  const filtered = devices?.filter((d: any) => {
    if (filterStatus !== "all" && d.status !== filterStatus) return false;
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Devices</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Device</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Device</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={newDevice.name} onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })} placeholder="PS5 - Station 1" />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select onValueChange={(v) => setNewDevice({ ...newDevice, device_type_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {deviceTypes?.map((dt: any) => (
                      <SelectItem key={dt.id} value={dt.id}>{dt.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={() => createMutation.mutate(newDevice)} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Device"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search devices..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="occupied">Occupied</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered?.map((device: any) => (
            <Card key={device.id} className={cn("border-l-4 transition-colors hover:shadow-md cursor-pointer", statusColors[device.status])}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{device.name}</p>
                      <p className="text-xs text-muted-foreground">{device.device_type?.name || "Unknown"}</p>
                    </div>
                  </div>
                  {device.ip_address ? <Wifi className="h-3 w-3 text-muted-foreground" /> : <WifiOff className="h-3 w-3 text-muted-foreground" />}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Badge variant={device.status === "available" ? "default" : "secondary"} className="text-xs">
                    {statusLabels[device.status]}
                  </Badge>
                  {device.zone && <span className="text-xs text-muted-foreground">{device.zone.name}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
