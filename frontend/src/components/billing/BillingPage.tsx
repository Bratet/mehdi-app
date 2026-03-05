"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Receipt, ChevronDown, Printer, AlertCircle, RefreshCw, FileText } from "lucide-react"
import { api } from "@/lib/api"
import { Invoice } from "@/types"
import { cn, formatCurrency } from "@/lib/utils"

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.get<Invoice[]>("/api/billing/invoices")
      setInvoices(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch invoices")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const handlePrint = (invoice: Invoice) => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const itemsHtml = invoice.items
      .map(
        (item) =>
          `<tr>
            <td style="text-align:left;padding:4px 0">${item.description}</td>
            <td style="text-align:center;padding:4px 0">${item.quantity}</td>
            <td style="text-align:right;padding:4px 0">${formatCurrency(item.unit_price)}</td>
            <td style="text-align:right;padding:4px 0">${formatCurrency(item.total_price)}</td>
          </tr>`
      )
      .join("")

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice #${invoice.id}</title>
          <style>
            body { font-family: monospace; max-width: 300px; margin: 0 auto; padding: 20px; font-size: 12px; }
            .dashed { border-top: 1px dashed #333; margin: 8px 0; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; padding: 4px 0; border-bottom: 1px dashed #333; }
            .center { text-align: center; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .total { font-size: 16px; }
          </style>
        </head>
        <body>
          <div class="center"><strong>GAME CENTER</strong></div>
          <div class="center" style="margin-bottom:8px">Invoice #${invoice.id}</div>
          <div class="dashed"></div>
          <div>Date: ${new Date(invoice.created_at).toLocaleDateString()}</div>
          <div>Device: ${invoice.device_name}</div>
          <div>Duration: ${invoice.session_duration}</div>
          <div class="dashed"></div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th class="center">Qty</th>
                <th class="right">Price</th>
                <th class="right">Total</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div class="dashed"></div>
          <div class="right">Session: ${formatCurrency(invoice.session_cost)}</div>
          <div class="right">Products: ${formatCurrency(invoice.products_cost)}</div>
          <div class="dashed"></div>
          <div class="right bold total">TOTAL: ${formatCurrency(invoice.total_cost)}</div>
          <div class="dashed"></div>
          <div>Payment: ${invoice.payment_method}</div>
          <div class="center" style="margin-top:16px">Thank you!</div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="h-8 w-40 bg-border/50 rounded-lg animate-pulse" />
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-border/50 rounded-[16px] h-20 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 md:p-6 flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-danger" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Failed to load invoices</h3>
        <p className="text-text-secondary text-sm mb-4">{error}</p>
        <button onClick={fetchInvoices} className="bg-primary text-background rounded-xl h-11 px-6 font-semibold text-sm flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-text-secondary text-sm mt-1">
          {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Empty state */}
      {invoices.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-text-secondary" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No invoices yet</h3>
          <p className="text-text-secondary text-sm">
            Invoices will appear here after sessions are completed
          </p>
        </motion.div>
      ) : (
        /* Invoice List */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          {invoices.map((invoice, index) => (
            <motion.div
              key={invoice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="bg-card border border-border rounded-[16px] overflow-hidden"
            >
              {/* Invoice row */}
              <button
                onClick={() => toggleExpand(invoice.id)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Receipt className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{invoice.device_name}</p>
                    <p className="text-text-secondary text-xs">{formatDate(invoice.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="font-bold text-sm">{formatCurrency(invoice.total_cost)}</p>
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full",
                        invoice.payment_method === "cash"
                          ? "bg-available/10 text-available"
                          : "bg-primary/10 text-primary"
                      )}
                    >
                      {invoice.payment_method === "cash" ? "Cash" : "Digital"}
                    </span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-text-secondary transition-transform",
                      expandedId === invoice.id && "rotate-180"
                    )}
                  />
                </div>
              </button>

              {/* Expanded receipt detail */}
              <AnimatePresence>
                {expandedId === invoice.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4">
                      <div className="print-receipt bg-background border border-border rounded-xl p-4 font-mono text-xs">
                        {/* Receipt header */}
                        <div className="text-center mb-2">
                          <p className="font-bold text-sm">GAME CENTER</p>
                          <p className="text-text-secondary">Invoice #{invoice.id}</p>
                        </div>

                        <div className="border-t border-dashed border-border my-2" />

                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-text-secondary">Date:</span>
                            <span>{formatDate(invoice.created_at)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-secondary">Device:</span>
                            <span>{invoice.device_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-secondary">Duration:</span>
                            <span>{invoice.session_duration}</span>
                          </div>
                        </div>

                        <div className="border-t border-dashed border-border my-2" />

                        {/* Items */}
                        <div className="space-y-1">
                          <div className="flex justify-between font-bold text-text-secondary">
                            <span className="flex-1">Item</span>
                            <span className="w-8 text-center">Qty</span>
                            <span className="w-16 text-right">Price</span>
                            <span className="w-20 text-right">Total</span>
                          </div>
                          {invoice.items.map((item) => (
                            <div key={item.id} className="flex justify-between">
                              <span className="flex-1 truncate">{item.description}</span>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <span className="w-16 text-right">{formatCurrency(item.unit_price)}</span>
                              <span className="w-20 text-right">{formatCurrency(item.total_price)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-dashed border-border my-2" />

                        {/* Subtotals */}
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-text-secondary">Session:</span>
                            <span>{formatCurrency(invoice.session_cost)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-secondary">Products:</span>
                            <span>{formatCurrency(invoice.products_cost)}</span>
                          </div>
                        </div>

                        <div className="border-t border-dashed border-border my-2" />

                        {/* Total */}
                        <div className="flex justify-between font-bold text-base">
                          <span>TOTAL</span>
                          <span>{formatCurrency(invoice.total_cost)}</span>
                        </div>

                        <div className="border-t border-dashed border-border my-2" />

                        <div className="flex justify-between">
                          <span className="text-text-secondary">Payment:</span>
                          <span className="capitalize">{invoice.payment_method}</span>
                        </div>

                        <p className="text-center text-text-secondary mt-3">Thank you!</p>
                      </div>

                      {/* Print button */}
                      <button
                        onClick={() => handlePrint(invoice)}
                        className="mt-3 w-full flex items-center justify-center gap-2 bg-primary text-background rounded-xl h-11 px-6 font-semibold text-sm hover:opacity-90 transition-opacity"
                      >
                        <Printer className="w-4 h-4" />
                        Print Receipt
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
