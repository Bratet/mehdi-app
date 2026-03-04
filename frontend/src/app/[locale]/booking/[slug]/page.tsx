"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Gamepad2,
  Calendar,
  Monitor,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const STEPS = [
  { label: "Date", icon: Calendar },
  { label: "Device", icon: Monitor },
  { label: "Time", icon: Clock },
  { label: "Details", icon: Gamepad2 },
  { label: "Confirm", icon: Check },
];

interface BookingForm {
  date: string;
  device_type: string;
  device_type_name: string;
  start_time: string;
  end_time: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  notes: string;
}

const initialForm: BookingForm = {
  date: "",
  device_type: "",
  device_type_name: "",
  start_time: "",
  end_time: "",
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  notes: "",
};

export default function PublicBookingPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<BookingForm>(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const { data: deviceTypes, isLoading: typesLoading } = useQuery({
    queryKey: ["public-device-types", slug],
    queryFn: () =>
      api.get(`/api/v1/devices/types`).then((r) => r.data),
  });

  const bookingMutation = useMutation({
    mutationFn: (data: Record<string, string>) =>
      api.post("/api/v1/bookings", {
        establishment_slug: slug,
        ...data,
      }),
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: () => {
      toast({
        title: "Booking failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateField = (field: keyof BookingForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 0:
        return !!form.date;
      case 1:
        return !!form.device_type;
      case 2:
        return !!form.start_time && !!form.end_time;
      case 3:
        return (
          !!form.first_name.trim() &&
          !!form.last_name.trim() &&
          !!form.email.trim()
        );
      default:
        return true;
    }
  };

  const handleSubmit = () => {
    bookingMutation.mutate({
      date: form.date,
      device_type_id: form.device_type,
      start_time: form.start_time,
      end_time: form.end_time,
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      phone: form.phone,
      notes: form.notes,
    });
  };

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
            <p className="text-muted-foreground mb-6">
              Your session has been booked successfully.
            </p>
            <div className="rounded-lg bg-muted/50 p-4 text-left space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">
                  {form.first_name} {form.last_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{form.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Device</span>
                <span className="font-medium">{form.device_type_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium">
                  {form.start_time} - {form.end_time}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{form.email}</span>
              </div>
            </div>
            <Button
              className="mt-6 w-full"
              variant="outline"
              onClick={() => {
                setForm(initialForm);
                setStep(0);
                setSubmitted(false);
              }}
            >
              Book Another Session
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Gamepad2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Game Center</h1>
            <p className="text-xs text-muted-foreground">
              Book your gaming session
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Step indicator */}
        <div className="mb-8 flex items-center justify-between">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isCompleted = i < step;
            return (
              <div key={s.label} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                      isActive &&
                        "border-primary bg-primary text-primary-foreground",
                      isCompleted &&
                        "border-green-500 bg-green-500 text-white",
                      !isActive &&
                        !isCompleted &&
                        "border-muted-foreground/25 text-muted-foreground/50"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium hidden sm:block",
                      isActive && "text-primary",
                      isCompleted && "text-green-600 dark:text-green-400",
                      !isActive &&
                        !isCompleted &&
                        "text-muted-foreground/50"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "mx-2 h-0.5 flex-1",
                      i < step
                        ? "bg-green-500"
                        : "bg-muted-foreground/15"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <Card>
          <CardHeader>
            <CardTitle>
              {step === 0 && "Choose a Date"}
              {step === 1 && "Select Device Type"}
              {step === 2 && "Pick Your Time Slot"}
              {step === 3 && "Your Details"}
              {step === 4 && "Review & Confirm"}
            </CardTitle>
            <CardDescription>
              {step === 0 && "When would you like to play?"}
              {step === 1 && "What type of device do you want to use?"}
              {step === 2 && "Select your preferred start and end time."}
              {step === 3 && "Tell us a bit about yourself."}
              {step === 4 && "Please review your booking details before confirming."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 0: Date */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="booking-date">Date</Label>
                  <Input
                    id="booking-date"
                    type="date"
                    value={form.date}
                    onChange={(e) => updateField("date", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="max-w-xs"
                  />
                </div>
              </div>
            )}

            {/* Step 1: Device type */}
            {step === 1 && (
              <div>
                {typesLoading ? (
                  <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Skeleton key={i} className="h-24 rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
                    {deviceTypes?.map((dt: any) => (
                      <button
                        key={dt.id}
                        type="button"
                        onClick={() => {
                          updateField("device_type", dt.id);
                          updateField("device_type_name", dt.name);
                        }}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 text-center transition-all hover:shadow-md",
                          form.device_type === dt.id
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-muted hover:border-muted-foreground/25"
                        )}
                      >
                        <Monitor className="h-6 w-6 text-muted-foreground" />
                        <span className="text-sm font-medium">{dt.name}</span>
                      </button>
                    ))}
                    {deviceTypes?.length === 0 && (
                      <p className="col-span-full text-center text-sm text-muted-foreground py-8">
                        No device types available at this time.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Time slot */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-time">Start Time</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={form.start_time}
                      onChange={(e) =>
                        updateField("start_time", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-time">End Time</Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={form.end_time}
                      onChange={(e) =>
                        updateField("end_time", e.target.value)
                      }
                    />
                  </div>
                </div>
                {form.start_time && form.end_time && (
                  <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                    <Clock className="inline h-3.5 w-3.5 mr-1" />
                    Session from{" "}
                    <span className="font-medium text-foreground">
                      {form.start_time}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium text-foreground">
                      {form.end_time}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Details */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name *</Label>
                    <Input
                      id="first-name"
                      value={form.first_name}
                      onChange={(e) =>
                        updateField("first_name", e.target.value)
                      }
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name *</Label>
                    <Input
                      id="last-name"
                      value={form.last_name}
                      onChange={(e) =>
                        updateField("last_name", e.target.value)
                      }
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="+1 234 567 890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={form.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    placeholder="Any special requests..."
                  />
                </div>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Date
                    </span>
                    <span className="font-medium">{form.date}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Monitor className="h-4 w-4" /> Device Type
                    </span>
                    <Badge variant="secondary">{form.device_type_name}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" /> Time
                    </span>
                    <span className="font-medium">
                      {form.start_time} - {form.end_time}
                    </span>
                  </div>
                  <hr />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">
                      {form.first_name} {form.last_name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{form.email}</span>
                  </div>
                  {form.phone && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Phone</span>
                      <span className="font-medium">{form.phone}</span>
                    </div>
                  )}
                  {form.notes && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Notes</span>
                      <span className="font-medium">{form.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation buttons */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          {step < 4 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={bookingMutation.isPending}
            >
              {bookingMutation.isPending
                ? "Submitting..."
                : "Confirm Booking"}
              {!bookingMutation.isPending && (
                <Check className="h-4 w-4 ml-1" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
