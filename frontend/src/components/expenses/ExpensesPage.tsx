"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  X,
  Trash2,
  Pencil,
  Wallet,
  AlertCircle,
  RefreshCw,
  Receipt,
} from "lucide-react"
import { api } from "@/lib/api"
import { Expense, ExpenseSummary } from "@/types"
import { cn, formatCurrency, getExpenseCategoryLabel } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"

const CATEGORY_COLORS: Record<string, string> = {
  rent: "bg-primary/10 text-primary",
  utilities: "bg-warning/10 text-warning",
  supplies: "bg-secondary/10 text-secondary",
  salaries: "bg-purple-500/10 text-purple-500",
  maintenance: "bg-danger/10 text-danger",
  other: "bg-border text-text-secondary",
}

type ExpenseCategory = Expense["category"]

interface ExpenseFormData {
  title: string
  amount: string
  category: ExpenseCategory
  date: string
  notes: string
}

const defaultForm: ExpenseFormData = {
  title: "",
  amount: "",
  category: "supplies",
  date: new Date().toISOString().split("T")[0],
  notes: "",
}

export default function ExpensesPage() {
  const { isAdmin } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [summary, setSummary] = useState<ExpenseSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [form, setForm] = useState<ExpenseFormData>(defaultForm)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [expensesData, summaryData] = await Promise.all([
        api.get<Expense[]>("/api/expenses"),
        api.get<ExpenseSummary[]>("/api/expenses/summary"),
      ])
      setExpenses(expensesData)
      setSummary(summaryData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch expenses")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const openAddModal = () => {
    setEditingExpense(null)
    setForm(defaultForm)
    setModalOpen(true)
  }

  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense)
    setForm({
      title: expense.title,
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.date.split("T")[0],
      notes: expense.notes || "",
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        title: form.title,
        amount: parseFloat(form.amount),
        category: form.category,
        date: form.date,
        notes: form.notes || null,
      }
      if (editingExpense) {
        await api.put(`/api/expenses/${editingExpense.id}`, payload)
      } else {
        await api.post("/api/expenses", payload)
      }
      setModalOpen(false)
      fetchData()
    } catch (err) {
      console.error("Failed to save expense:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/expenses/${id}`)
      setDeleteConfirm(null)
      fetchData()
    } catch (err) {
      console.error("Failed to delete expense:", err)
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="h-8 w-40 bg-border/50 rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-border/50 rounded-[16px] h-24 animate-pulse" />
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
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
        <h3 className="text-lg font-semibold mb-1">Failed to load expenses</h3>
        <p className="text-text-secondary text-sm mb-4">{error}</p>
        <button onClick={fetchData} className="bg-primary text-background rounded-xl h-11 px-6 font-semibold text-sm flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Expenses</h1>
          <p className="text-text-secondary text-sm mt-1">
            {expenses.length} expense{expenses.length !== 1 ? "s" : ""} recorded
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openAddModal}
            className="hidden md:flex items-center gap-2 bg-primary text-background rounded-xl h-11 px-6 font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        )}
      </div>

      {/* Summary Cards */}
      {summary.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {summary.map((item) => (
            <motion.div
              key={item.category}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-border rounded-[16px] p-4"
            >
              <span
                className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other
                )}
              >
                {getExpenseCategoryLabel(item.category)}
              </span>
              <p className="text-lg font-bold mt-2">{formatCurrency(item.total_amount)}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Expenses List */}
      {expenses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
            <Receipt className="w-8 h-8 text-text-secondary" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No expenses yet</h3>
          <p className="text-text-secondary text-sm">
            Track your expenses by adding the first one
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          {expenses.map((expense, index) => (
            <motion.div
              key={expense.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="bg-card border border-border rounded-[16px] p-4 relative group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Wallet className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{expense.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.other
                        )}
                      >
                        {getExpenseCategoryLabel(expense.category)}
                      </span>
                      <span className="text-text-secondary text-xs">
                        {formatDate(expense.date)}
                      </span>
                    </div>
                    {expense.notes && (
                      <p className="text-text-secondary text-xs mt-1 truncate">{expense.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <p className="font-bold text-sm">{formatCurrency(expense.amount)}</p>

                  {isAdmin && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(expense)}
                        className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center hover:bg-primary/20 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5 text-text-secondary" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(expense.id)}
                        className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center hover:bg-danger/20 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-danger" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Delete confirm overlay */}
              <AnimatePresence>
                {deleteConfirm === expense.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-card/95 backdrop-blur-sm rounded-[16px] flex items-center justify-center gap-3 p-4"
                  >
                    <p className="text-sm font-medium">Delete this expense?</p>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-4 h-9 rounded-lg bg-surface text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="px-4 h-9 rounded-lg bg-danger text-white text-sm font-medium"
                    >
                      Delete
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Mobile FAB */}
      {isAdmin && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileTap={{ scale: 0.9 }}
          onClick={openAddModal}
          className="md:hidden fixed bottom-20 right-4 z-40 w-14 h-14 bg-primary text-background rounded-full shadow-glow flex items-center justify-center"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full md:max-w-md bg-card border border-border rounded-t-[20px] md:rounded-[20px] p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">
                  {editingExpense ? "Edit Expense" : "Add Expense"}
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-text-secondary mb-1.5 block">
                    Title
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    className="w-full h-11 px-4 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                    placeholder="Expense title"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-text-secondary mb-1.5 block">
                    Amount (DH)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    required
                    className="w-full h-11 px-4 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-text-secondary mb-1.5 block">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value as ExpenseCategory })
                    }
                    className="w-full h-11 px-4 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                  >
                    <option value="rent">Rent</option>
                    <option value="utilities">Utilities</option>
                    <option value="supplies">Supplies</option>
                    <option value="salaries">Salaries</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-text-secondary mb-1.5 block">
                    Date
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                    className="w-full h-11 px-4 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-text-secondary mb-1.5 block">
                    Notes (optional)
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all resize-none"
                    placeholder="Additional notes..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-background rounded-xl h-11 px-6 font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {submitting
                    ? "Saving..."
                    : editingExpense
                    ? "Update Expense"
                    : "Add Expense"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
