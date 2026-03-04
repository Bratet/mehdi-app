"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Receipt, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  session_id: string | null;
  order_id: string | null;
  customer_id: string | null;
  customer_name?: string;
  subtotal: number;
  discount_type: string | null;
  discount_value: number;
  discount_amount: number;
  vat_rate: number;
  vat_amount: number;
  total: number;
  status: string;
  created_at: string | null;
  line_items?: InvoiceLineItem[];
}

type InvoiceStatus = "draft" | "issued" | "paid" | "partial" | "cancelled";

function getStatusBadge(status: string) {
  const s = status as InvoiceStatus;
  switch (s) {
    case "draft":
      return <Badge variant="secondary">Draft</Badge>;
    case "issued":
      return <Badge variant="default">Issued</Badge>;
    case "paid":
      return (
        <Badge className="border-transparent bg-green-600 text-white shadow hover:bg-green-600/80">
          Paid
        </Badge>
      );
    case "partial":
      return (
        <Badge className="border-transparent bg-yellow-500 text-white shadow hover:bg-yellow-500/80">
          Partial
        </Badge>
      );
    case "cancelled":
      return <Badge variant="destructive">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(amount: number): string {
  return `${amount.toFixed(2)} MAD`;
}

function InvoiceTableSkeleton() {
  return (
    <div className="p-6 space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-4 items-center">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
        </div>
      ))}
    </div>
  );
}

export default function BillingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const { toast } = useToast();

  const { data: invoices, isLoading, error } = useQuery<Invoice[]>({
    queryKey: ["invoices"],
    queryFn: async () => {
      try {
        const res = await api.get("/api/v1/invoices");
        return res.data;
      } catch {
        const res = await api.get("/api/v1/billing");
        return res.data;
      }
    },
  });

  const filteredInvoices = (invoices || []).filter((inv) => {
    const matchesSearch =
      searchQuery === "" ||
      inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.customer_name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleRowClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDetailOpen(true);
  };

  const totals = {
    count: filteredInvoices.length,
    totalAmount: filteredInvoices.reduce((sum, inv) => sum + inv.total, 0),
    paidCount: filteredInvoices.filter((inv) => inv.status === "paid").length,
    pendingAmount: filteredInvoices
      .filter((inv) => inv.status === "issued" || inv.status === "partial")
      .reduce((sum, inv) => sum + inv.total, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Billing</h1>
          <p className="text-sm text-muted-foreground">
            Manage invoices and billing records
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Invoices
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.count}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totals.totalAmount)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <Receipt className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.paidCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Amount
            </CardTitle>
            <Receipt className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totals.pendingAmount)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search by invoice # or customer..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="issued">Issued</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <InvoiceTableSkeleton />
          ) : filteredInvoices.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No invoices found</p>
              <p className="text-sm mt-1">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Invoices will appear here once created"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="text-right">Discount</TableHead>
                  <TableHead className="text-right">VAT</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow
                    key={invoice.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(invoice)}
                  >
                    <TableCell className="font-medium">
                      {invoice.invoice_number}
                    </TableCell>
                    <TableCell>{formatDate(invoice.created_at)}</TableCell>
                    <TableCell>
                      {invoice.customer_name || invoice.customer_id || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(invoice.subtotal)}
                    </TableCell>
                    <TableCell className="text-right">
                      {invoice.discount_amount > 0
                        ? `-${formatCurrency(invoice.discount_amount)}`
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(invoice.vat_amount)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(invoice.total)}
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Invoice Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Invoice {selectedInvoice?.invoice_number}
            </DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              {/* Invoice Info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {formatDate(selectedInvoice.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <div className="mt-0.5">
                    {getStatusBadge(selectedInvoice.status)}
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium">
                    {selectedInvoice.customer_name ||
                      selectedInvoice.customer_id ||
                      "Walk-in"}
                  </p>
                </div>
                {selectedInvoice.session_id && (
                  <div>
                    <p className="text-muted-foreground">Session</p>
                    <p className="font-medium text-xs truncate">
                      {selectedInvoice.session_id}
                    </p>
                  </div>
                )}
                {selectedInvoice.order_id && (
                  <div>
                    <p className="text-muted-foreground">Order</p>
                    <p className="font-medium text-xs truncate">
                      {selectedInvoice.order_id}
                    </p>
                  </div>
                )}
              </div>

              {/* Line Items */}
              {selectedInvoice.line_items &&
                selectedInvoice.line_items.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Line Items</p>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedInvoice.line_items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="text-sm">
                              {item.description}
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              {item.quantity}
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              {formatCurrency(item.unit_price)}
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              {formatCurrency(item.total_price)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

              {/* Totals Breakdown */}
              <div className="border-t pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                </div>
                {selectedInvoice.discount_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Discount
                      {selectedInvoice.discount_type === "percentage"
                        ? ` (${selectedInvoice.discount_value}%)`
                        : ""}
                    </span>
                    <span className="text-red-500">
                      -{formatCurrency(selectedInvoice.discount_amount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    VAT ({selectedInvoice.vat_rate}%)
                  </span>
                  <span>{formatCurrency(selectedInvoice.vat_amount)}</span>
                </div>
                <div className="flex justify-between font-semibold text-base border-t pt-2">
                  <span>Total</span>
                  <span>{formatCurrency(selectedInvoice.total)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
