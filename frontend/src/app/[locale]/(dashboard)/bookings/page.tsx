"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Plus, Clock } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "converted", label: "Converted" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No Show" },
];

function statusBadge(status: string) {
  switch (status) {
    case "pending":
      return <Badge variant="secondary">Pending</Badge>;
    case "confirmed":
      return <Badge variant="default">Confirmed</Badge>;
    case "converted":
      return (
        <Badge className="bg-green-600 hover:bg-green-700 text-white">
          Converted
        </Badge>
      );
    case "cancelled":
      return <Badge variant="destructive">Cancelled</Badge>;
    case "no_show":
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
          No Show
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default function BookingsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [deviceTypeId, setDeviceTypeId] = useState("");
  const [mode, setMode] = useState("solo");
  const [customerId, setCustomerId] = useState("");
  const [notes, setNotes] = useState("");

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["bookings", statusFilter],
    queryFn: () => {
      const params =
        statusFilter !== "all" ? { status: statusFilter } : undefined;
      return api.get("/api/v1/bookings", { params }).then((r) => r.data);
    },
  });

  const { data: deviceTypes } = useQuery({
    queryKey: ["device-types"],
    queryFn: () => api.get("/api/v1/devices/types").then((r) => r.data),
  });

  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: () => api.get("/api/v1/customers").then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/api/v1/bookings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      setDialogOpen(false);
      resetForm();
      toast({ title: "Booking created" });
    },
    onError: (e: any) => {
      toast({
        title: "Error",
        description: e.response?.data?.detail || "Failed to create booking",
        variant: "destructive",
      });
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/api/v1/bookings/${id}/confirm`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast({ title: "Booking confirmed" });
    },
    onError: (e: any) => {
      toast({
        title: "Error",
        description: e.response?.data?.detail || "Failed to confirm",
        variant: "destructive",
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/api/v1/bookings/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast({ title: "Booking cancelled" });
    },
    onError: (e: any) => {
      toast({
        title: "Error",
        description: e.response?.data?.detail || "Failed to cancel",
        variant: "destructive",
      });
    },
  });

  function resetForm() {
    setDate("");
    setStartTime("");
    setEndTime("");
    setDeviceTypeId("");
    setMode("solo");
    setCustomerId("");
    setNotes("");
  }

  function handleCreate() {
    const payload: any = {
      date,
      start_time: startTime,
      end_time: endTime,
      device_type_id: deviceTypeId,
      mode,
    };
    if (customerId) payload.customer_id = customerId;
    if (notes.trim()) payload.notes = notes.trim();
    createMutation.mutate(payload);
  }

  const bookingsList = Array.isArray(bookings)
    ? bookings
    : bookings?.items || bookings?.data || [];

  const deviceTypesList = Array.isArray(deviceTypes)
    ? deviceTypes
    : deviceTypes?.items || deviceTypes?.data || [];

  const customersList = Array.isArray(customers)
    ? customers
    : customers?.items || customers?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bookings</h1>
          <p className="text-sm text-muted-foreground">
            Manage reservations and bookings
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> New Booking
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>New Booking</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Device Type</Label>
                <Select onValueChange={setDeviceTypeId} value={deviceTypeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select device type" />
                  </SelectTrigger>
                  <SelectContent>
                    {deviceTypesList.map((dt: any) => (
                      <SelectItem key={dt.id} value={dt.id}>
                        {dt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Mode</Label>
                <Select value={mode} onValueChange={setMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solo">Solo</SelectItem>
                    <SelectItem value="multiplayer">Multiplayer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Customer (optional)</Label>
                <Select onValueChange={setCustomerId} value={customerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Walk-in / Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Walk-in</SelectItem>
                    {customersList.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name || c.full_name || c.email || "Customer"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input
                  placeholder="Optional notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleCreate}
                disabled={
                  !date ||
                  !startTime ||
                  !endTime ||
                  !deviceTypeId ||
                  createMutation.isPending
                }
              >
                {createMutation.isPending ? "Creating..." : "Create Booking"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Label className="text-sm text-muted-foreground">
          Filter by status:
        </Label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : bookingsList.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No bookings found</p>
            <p className="text-sm mt-1">
              Create a new booking to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Device Type</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookingsList.map((booking: any) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        {booking.date}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        {booking.start_time} - {booking.end_time}
                      </div>
                    </TableCell>
                    <TableCell>
                      {booking.device_type?.name ||
                        booking.device_type_name ||
                        "N/A"}
                    </TableCell>
                    <TableCell>
                      {booking.customer?.name ||
                        booking.customer?.full_name ||
                        booking.customer_name ||
                        "Walk-in"}
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{booking.mode}</span>
                    </TableCell>
                    <TableCell>{statusBadge(booking.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {booking.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                confirmMutation.mutate(booking.id)
                              }
                              disabled={confirmMutation.isPending}
                            >
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                cancelMutation.mutate(booking.id)
                              }
                              disabled={cancelMutation.isPending}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                        {booking.status === "confirmed" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              cancelMutation.mutate(booking.id)
                            }
                            disabled={cancelMutation.isPending}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
