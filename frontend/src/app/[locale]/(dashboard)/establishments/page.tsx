"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { Building2, Plus, MapPin, Phone, Mail } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Establishment {
  id: string;
  name: string;
  slug: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
}

const emptyForm = {
  name: "",
  slug: "",
  address: "",
  phone: "",
  email: "",
};

export default function EstablishmentsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: establishments, isLoading } = useQuery<Establishment[]>({
    queryKey: ["establishments"],
    queryFn: () => api.get("/api/v1/establishments").then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) =>
      api.post("/api/v1/establishments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["establishments"] });
      setDialogOpen(false);
      setForm(emptyForm);
      toast({ title: "Establishment created successfully" });
    },
    onError: () => {
      toast({
        title: "Failed to create establishment",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!form.name.trim() || !form.slug.trim()) return;
    createMutation.mutate(form);
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Establishments</h1>
          <p className="text-sm text-muted-foreground">
            Manage your game center locations
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add Establishment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Establishment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="My Game Center"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => updateField("slug", e.target.value)}
                  placeholder="my-game-center"
                />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="123 Main Street"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="+1 234 567 890"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="contact@example.com"
                  type="email"
                />
              </div>
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={
                  createMutation.isPending ||
                  !form.name.trim() ||
                  !form.slug.trim()
                }
              >
                {createMutation.isPending
                  ? "Creating..."
                  : "Create Establishment"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Loading skeletons */}
      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {establishments?.map((establishment) => (
            <Card
              key={establishment.id}
              className={cn(
                "transition-colors hover:shadow-md cursor-pointer border-l-4",
                establishment.is_active
                  ? "border-l-green-500"
                  : "border-l-gray-300"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {establishment.name}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        /{establishment.slug}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant={
                      establishment.is_active ? "default" : "secondary"
                    }
                    className="text-xs"
                  >
                    {establishment.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {establishment.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{establishment.address}</span>
                    </div>
                  )}
                  {establishment.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span>{establishment.phone}</span>
                    </div>
                  )}
                  {establishment.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{establishment.email}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {establishments?.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No establishments yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Create your first establishment to get started.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
