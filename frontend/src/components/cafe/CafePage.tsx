"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Coffee, X, Trash2, Pencil, Package, AlertCircle, RefreshCw } from "lucide-react"
import { api } from "@/lib/api"
import { Product } from "@/types"
import { cn, formatCurrency, getCategoryEmoji } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "hot_drinks", label: "Hot Drinks" },
  { key: "cold_drinks", label: "Cold Drinks" },
  { key: "snacks", label: "Snacks" },
  { key: "meals", label: "Meals" },
] as const

type CategoryKey = "all" | Product["category"]

interface ProductFormData {
  name: string
  category: Product["category"]
  price: string
  in_stock: boolean
}

const defaultForm: ProductFormData = {
  name: "",
  category: "hot_drinks",
  price: "",
  in_stock: true,
}

export default function CafePage() {
  const { isAdmin } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all")
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductFormData>(defaultForm)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.get<Product[]>("/api/products")
      setProducts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch products")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const filtered = activeCategory === "all"
    ? products
    : products.filter((p) => p.category === activeCategory)

  const openAddModal = () => {
    setEditingProduct(null)
    setForm(defaultForm)
    setModalOpen(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setForm({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      in_stock: product.in_stock,
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        name: form.name,
        category: form.category,
        price: parseFloat(form.price),
        in_stock: form.in_stock,
      }
      if (editingProduct) {
        await api.put(`/api/products/${editingProduct.id}`, payload)
      } else {
        await api.post("/api/products", payload)
      }
      setModalOpen(false)
      fetchProducts()
    } catch (err) {
      console.error("Failed to save product:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/products/${id}`)
      setDeleteConfirm(null)
      fetchProducts()
    } catch (err) {
      console.error("Failed to delete product:", err)
    }
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-40 bg-border/50 rounded-lg animate-pulse" />
          <div className="h-10 w-32 bg-border/50 rounded-xl animate-pulse" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-9 w-24 bg-border/50 rounded-full animate-pulse shrink-0" />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-border/50 rounded-[16px] h-40 animate-pulse" />
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
        <h3 className="text-lg font-semibold mb-1">Failed to load products</h3>
        <p className="text-text-secondary text-sm mb-4">{error}</p>
        <button onClick={fetchProducts} className="bg-primary text-background rounded-xl h-11 px-6 font-semibold text-sm flex items-center gap-2">
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
          <h1 className="text-2xl font-bold">Cafe</h1>
          <p className="text-text-secondary text-sm mt-1">
            {products.length} product{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openAddModal}
            className="hidden md:flex items-center gap-2 bg-primary text-background rounded-xl h-11 px-6 font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={cn(
              "shrink-0 px-4 h-9 rounded-full text-sm font-medium transition-all",
              activeCategory === cat.key
                ? "bg-primary text-background"
                : "bg-card border border-border text-text-secondary hover:text-foreground"
            )}
          >
            {cat.key !== "all" && <span className="mr-1">{getCategoryEmoji(cat.key)}</span>}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
            <Coffee className="w-8 h-8 text-text-secondary" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No products found</h3>
          <p className="text-text-secondary text-sm">
            {activeCategory === "all"
              ? "Add your first product to get started"
              : "No products in this category"}
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {filtered.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="bg-card border border-border rounded-[16px] p-4 relative group"
            >
              {/* Admin actions */}
              {isAdmin && (
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(product)}
                    className="w-7 h-7 rounded-lg bg-surface flex items-center justify-center hover:bg-primary/20 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5 text-text-secondary" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(product.id)}
                    className="w-7 h-7 rounded-lg bg-surface flex items-center justify-center hover:bg-danger/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-danger" />
                  </button>
                </div>
              )}

              <div className="text-3xl mb-3">{getCategoryEmoji(product.category)}</div>
              <h3 className="font-semibold text-sm mb-1 truncate">{product.name}</h3>
              <p className="text-primary font-bold text-base">{formatCurrency(product.price)}</p>
              <span
                className={cn(
                  "mt-2 inline-block text-xs font-medium px-2 py-0.5 rounded-full",
                  product.in_stock
                    ? "bg-available/10 text-available"
                    : "bg-danger/10 text-danger"
                )}
              >
                {product.in_stock ? "In Stock" : "Out of Stock"}
              </span>

              {/* Delete confirm overlay */}
              <AnimatePresence>
                {deleteConfirm === product.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-card/95 backdrop-blur-sm rounded-[16px] flex flex-col items-center justify-center gap-3 p-4"
                  >
                    <p className="text-sm font-medium text-center">Delete this product?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-4 h-9 rounded-lg bg-surface text-sm font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="px-4 h-9 rounded-lg bg-danger text-white text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
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
                  {editingProduct ? "Edit Product" : "Add Product"}
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
                    Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="w-full h-11 px-4 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                    placeholder="Product name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-text-secondary mb-1.5 block">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value as Product["category"] })
                    }
                    className="w-full h-11 px-4 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                  >
                    <option value="hot_drinks">Hot Drinks</option>
                    <option value="cold_drinks">Cold Drinks</option>
                    <option value="snacks">Snacks</option>
                    <option value="meals">Meals</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-text-secondary mb-1.5 block">
                    Price (DH)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                    className="w-full h-11 px-4 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                    placeholder="0.00"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-text-secondary">In Stock</label>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, in_stock: !form.in_stock })}
                    className={cn(
                      "w-12 h-7 rounded-full transition-colors relative",
                      form.in_stock ? "bg-primary" : "bg-border"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 w-6 h-6 bg-white rounded-full transition-transform",
                        form.in_stock ? "translate-x-5" : "translate-x-0.5"
                      )}
                    />
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-background rounded-xl h-11 px-6 font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {submitting
                    ? "Saving..."
                    : editingProduct
                    ? "Update Product"
                    : "Add Product"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
