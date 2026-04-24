"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Plus, Pencil, Trash2 } from "lucide-react";
import { liabilitiesApi } from "@/lib/api";
import { Liability, LIABILITY_TYPE_LABELS } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  PageTransition,
  AnimatedList,
  AnimatedListItem,
  AnimatedModal,
} from "@/components/animations";

export default function LiabilitiesPage() {
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchLiabilities = async () => {
    try {
      const res = await liabilitiesApi.getAll();
      setLiabilities(res.data);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiabilities();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await liabilitiesApi.delete(deleteId);
      setLiabilities((prev) => prev.filter((l) => l.id !== deleteId));
      setDeleteId(null);
    } catch {
      // ignore
    } finally {
      setIsDeleting(false);
    }
  };

  const totalBalance = liabilities.reduce(
    (sum, l) => sum + Number(l.balance),
    0
  );

  return (
    <PageTransition>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Liabilities
          </h1>
          <p className="text-gray-600">Track your debts and loans</p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link
            href="/liabilities/new"
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Liability
          </Link>
        </motion.div>
      </motion.div>

      {/* Summary */}
      {liabilities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card mb-6 flex items-center gap-4"
        >
          <div className="icon-container bg-red-50/80 border-red-100/50">
            <CreditCard className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Outstanding</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalBalance, "USD")}
            </p>
            <p className="text-xs text-gray-400">
              {liabilities.length} liabilit{liabilities.length === 1 ? "y" : "ies"} (in native currencies)
            </p>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-white/40 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : liabilities.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-red-50/80 border border-red-100/50 flex items-center justify-center mb-4">
            <CreditCard className="h-8 w-8 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No liabilities yet
          </h3>
          <p className="text-gray-500 mb-6">
            Start tracking your debts and loans to get a complete financial picture.
          </p>
          <Link href="/liabilities/new" className="btn btn-primary">
            Add Your First Liability
          </Link>
        </motion.div>
      ) : (
        <AnimatedList className="space-y-3">
          {liabilities.map((liability) => (
            <AnimatedListItem key={liability.id}>
              <motion.div
                whileHover={{ y: -2 }}
                className="card flex items-center gap-4"
              >
                <div className="icon-container bg-red-50/80 border-red-100/50 flex-shrink-0">
                  <CreditCard className="h-5 w-5 text-red-500" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-gray-900 truncate">
                      {liability.name}
                    </p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 flex-shrink-0">
                      {LIABILITY_TYPE_LABELS[liability.type]}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                    <span className="font-medium text-gray-900">
                      {formatCurrency(Number(liability.balance), liability.currency)}
                    </span>
                    {liability.interestRate != null && (
                      <span>
                        {(Number(liability.interestRate) * 100).toFixed(2)}% APR
                      </span>
                    )}
                    {liability.minimumPayment != null && (
                      <span>
                        Min: {formatCurrency(Number(liability.minimumPayment), liability.currency)}/mo
                      </span>
                    )}
                    {liability.dueDate && (
                      <span>Due: {formatDate(liability.dueDate)}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Link
                      href={`/liabilities/${liability.id}/edit`}
                      className="p-2 rounded-xl bg-white/40 hover:bg-white/70 text-gray-600 hover:text-gray-900 transition-all"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </motion.div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setDeleteId(liability.id)}
                    className="p-2 rounded-xl bg-red-50/60 hover:bg-red-100/80 text-red-500 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                </div>
              </motion.div>
            </AnimatedListItem>
          ))}
        </AnimatedList>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatedModal isOpen={!!deleteId} onClose={() => setDeleteId(null)}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Delete Liability
          </h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this liability? This action cannot be
            undone.
          </p>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDelete}
              disabled={isDeleting}
              className="btn bg-red-500 text-white hover:bg-red-600 flex-1"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setDeleteId(null)}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </motion.button>
          </div>
        </div>
      </AnimatedModal>
    </PageTransition>
  );
}
