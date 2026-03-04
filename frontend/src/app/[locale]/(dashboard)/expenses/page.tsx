"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Wallet, Plus, DollarSign } from "lucide-react";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ExpensesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [newExpense, setNewExpense] = useState({
    category: "",
    category_id: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: expenses, isLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: () => api.get("/api/v1/expenses").then((r) => r.data),
  });

  const { data: categories } = useQuery({
    queryKey: ["expense-categories"],
    queryFn: () => api.get("/api/v1/expenses/categories").then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/api/v1/expenses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setDialogOpen(false);
      setNewExpense({
        category: "",
        category_id: "",
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
      toast({ title: "Expense added" });
    },
    onError: (e: any) => {
      toast({
        title: "Error",
        description: e.response?.data?.detail || "Failed to add expense",
        variant: "destructive",
      });
    },
  });

  const filtered = expenses?.filter((exp: any) => {
    if (filterCategory === "all") return true;
    const expCat =
      exp.category?.name || exp.category_id || exp.category || "";
    return expCat === filterCategory;
  });

  const summary = useMemo(() => {
    if (!expenses) return { monthTotal: 0, weekTotal: 0, count: 0 };
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    startOfWeek.setHours(0, 0, 0, 0);

    let monthTotal = 0;
    let weekTotal = 0;

    expenses.forEach((exp: any) => {
      const expDate = new Date(exp.date || exp.created_at);
      const amount = parseFloat(exp.amount) || 0;
      if (expDate >= startOfMonth) monthTotal += amount;
      if (expDate >= startOfWeek) weekTotal += amount;
    });

    return { monthTotal, weekTotal, count: expenses.length };
  }, [expenses]);

  const handleCategorySelect = (catId: string) => {
    const cat = categories?.find(
      (c: any) => (c.id || c) === catId
    );
    setNewExpense({
      ...newExpense,
      category_id: catId,
      category: typeof cat === "string" ? cat : cat?.name || catId,
    });
  };

  const handleCreate = () => {
    createMutation.mutate({
      category_id: newExpense.category_id || undefined,
      category: newExpense.category || undefined,
      amount: parseFloat(newExpense.amount),
      description: newExpense.description,
      date: newExpense.date,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select onValueChange={handleCategorySelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat: any) => {
                      const id = typeof cat === "string" ? cat : cat.id;
                      const label = typeof cat === "string" ? cat : cat.name;
                      return (
                        <SelectItem key={id} value={id}>
                          {label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount (MAD)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newExpense.amount}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, amount: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  placeholder="Expense description"
                  value={newExpense.description}
                  onChange={(e) =>
                    setNewExpense({
                      ...newExpense,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, date: e.target.value })
                  }
                />
              </div>
              <Button
                className="w-full"
                onClick={handleCreate}
                disabled={
                  (!newExpense.category_id && !newExpense.category) ||
                  !newExpense.amount ||
                  createMutation.isPending
                }
              >
                {createMutation.isPending ? "Adding..." : "Add Expense"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total This Month
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {summary.monthTotal.toFixed(2)} MAD
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total This Week
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {summary.weekTotal.toFixed(2)} MAD
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Number of Expenses
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold">{summary.count}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-3 flex-wrap">
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((cat: any) => {
              const val = typeof cat === "string" ? cat : cat.name || cat.id;
              const label = typeof cat === "string" ? cat : cat.name;
              return (
                <SelectItem key={val} value={val}>
                  {label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : filtered?.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No expenses found</p>
            <p className="text-sm mt-1">
              Add your first expense to get started
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
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount (MAD)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered?.map((exp: any) => (
                  <TableRow key={exp.id}>
                    <TableCell>
                      {new Date(
                        exp.date || exp.created_at
                      ).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="capitalize">
                      {exp.category?.name || exp.category || "-"}
                    </TableCell>
                    <TableCell>{exp.description || "-"}</TableCell>
                    <TableCell className="text-right font-medium">
                      {parseFloat(exp.amount).toFixed(2)}
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
