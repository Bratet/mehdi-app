"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Timer, Play, Pause, Square, ArrowRightLeft, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function SessionCard({ session, onAction }: { session: any; onAction: () => void }) {
  const [elapsed, setElapsed] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (session.status !== "active") return;
    const started = new Date(session.started_at).getTime();
    const pauseDur = (session.total_pause_duration || 0) * 1000;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - started - pauseDur) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [session]);

  const action = async (endpoint: string) => {
    try {
      await api.post(`/api/v1/sessions/${session.id}/${endpoint}`);
      queryClient.invalidateQueries({ queryKey: ["sessions-active"] });
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      onAction();
    } catch (e: any) {
      toast({ title: "Error", description: e.response?.data?.detail || "Action failed", variant: "destructive" });
    }
  };

  const cost = session.segments?.reduce((sum: number, seg: any) => {
    const dur = seg.ended_at
      ? (new Date(seg.ended_at).getTime() - new Date(seg.started_at).getTime()) / 1000
      : elapsed;
    return sum + (parseFloat(seg.rate_per_hour) * dur) / 3600;
  }, 0) || 0;

  const isPaused = session.status === "paused";

  return (
    <Card className={cn(
      "border-l-4",
      isPaused ? "border-status-maintenance" : "border-primary"
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-medium">{session.device?.name || "Device"}</p>
            <p className="text-xs text-muted-foreground">
              {session.segments?.[session.segments.length - 1]?.mode || "solo"} mode
            </p>
          </div>
          <Badge variant={isPaused ? "secondary" : "default"}>
            {isPaused ? "PAUSED" : "ACTIVE"}
          </Badge>
        </div>

        <div className="text-center py-3">
          <p className={cn(
            "text-3xl font-mono font-bold",
            isPaused ? "text-status-maintenance" : "text-primary"
          )}>
            {formatDuration(elapsed)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">{cost.toFixed(2)} MAD</p>
        </div>

        <div className="flex gap-2 mt-3">
          {isPaused ? (
            <Button size="sm" className="flex-1" onClick={() => action("resume")}>
              <Play className="h-3 w-3 mr-1" /> Resume
            </Button>
          ) : (
            <Button size="sm" variant="secondary" className="flex-1" onClick={() => action("pause")}>
              <Pause className="h-3 w-3 mr-1" /> Pause
            </Button>
          )}
          <Button size="sm" variant="destructive" className="flex-1" onClick={() => action("stop")}>
            <Square className="h-3 w-3 mr-1" /> Stop
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SessionsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [mode, setMode] = useState("solo");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["sessions-active"],
    queryFn: () => api.get("/api/v1/sessions/active").then((r) => r.data),
    refetchInterval: 10000,
  });

  const { data: devices } = useQuery({
    queryKey: ["devices"],
    queryFn: () => api.get("/api/v1/devices").then((r) => r.data),
  });

  const availableDevices = devices?.filter((d: any) => d.status === "available") || [];

  const startMutation = useMutation({
    mutationFn: (data: any) => api.post("/api/v1/sessions/start", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions-active"] });
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      setDialogOpen(false);
      toast({ title: "Session started" });
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.response?.data?.detail || "Failed", variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sessions</h1>
          <p className="text-sm text-muted-foreground">{sessions?.length || 0} active</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Start Session</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Start New Session</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Device</Label>
                <Select onValueChange={setDeviceId}>
                  <SelectTrigger><SelectValue placeholder="Select device" /></SelectTrigger>
                  <SelectContent>
                    {availableDevices.map((d: any) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Mode</Label>
                <Select value={mode} onValueChange={setMode}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solo">Solo</SelectItem>
                    <SelectItem value="multiplayer">Multiplayer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={() => startMutation.mutate({ device_id: deviceId, mode })} disabled={!deviceId || startMutation.isPending}>
                {startMutation.isPending ? "Starting..." : "Start Session"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : sessions?.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">
          <Timer className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No active sessions</p>
          <p className="text-sm mt-1">Start a session to begin tracking time</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((s: any) => (
            <SessionCard key={s.id} session={s} onAction={() => {}} />
          ))}
        </div>
      )}
    </div>
  );
}
