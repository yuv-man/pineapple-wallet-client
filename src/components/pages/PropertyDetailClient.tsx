"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { propertiesApi, propertyTransactionsApi } from "@/lib/api";
import {
  Property,
  PropertyTransaction,
  TransactionType,
  Permission,
} from "@/types";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  PlusCircle,
  Loader2,
  Share2,
  Edit,
  Trash2,
  Building2,
  TrendingUp,
  TrendingDown,
  MapPin,
  Palette,
  Hammer,
  Scale,
  Wrench,
  Receipt,
  Shield,
  Users,
  Home,
  DollarSign,
  Plus,
  Minus,
  Eye,
  X,
} from "lucide-react";
import {
  PageTransition,
  AnimatedList,
  AnimatedListItem,
} from "@/components/animations";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Design: Palette,
  Build: Hammer,
  Lawyer: Scale,
  Maintenance: Wrench,
  Taxes: Receipt,
  Insurance: Shield,
  "Management Fees": Users,
  Rent: Home,
  Sale: DollarSign,
  "Other Income": Plus,
};

export function PropertyDetailClient() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const propertyId = params.id as string;

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await propertiesApi.getOne(propertyId);
        setProperty(response.data);
      } catch (error) {
        console.error("Failed to fetch property:", error);
        router.push("/properties");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId, router]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await propertiesApi.delete(propertyId);
      router.push("/properties");
    } catch (error) {
      console.error("Failed to delete property:", error);
      setIsDeleting(false);
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      await propertyTransactionsApi.delete(transactionId);
      // Refetch to get updated balances
      const response = await propertiesApi.getOne(propertyId);
      setProperty(response.data);
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-8 w-8 text-salmon" />
        </motion.div>
      </div>
    );
  }

  if (!property) {
    return null;
  }

  const canEdit = property.isOwner || property.permission === Permission.EDIT;
  const netBalance = property.netBalance || 0;
  const isPositive = netBalance >= 0;

  return (
    <PageTransition>
      <div>
        <Link
          href="/properties"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Properties
        </Link>

        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="icon-container-salmon">
                <Building2 className="h-6 w-6 text-salmon" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {property.name}
                </h1>
                {property.address && (
                  <p className="text-gray-600 mt-1 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {property.address}
                  </p>
                )}
                {property.description && (
                  <p className="text-gray-500 mt-2">{property.description}</p>
                )}
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  {!property.isOwner && (
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md">
                      Shared by {property.user.name}
                    </span>
                  )}
                  <span>Created {formatDate(property.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Balance Summary */}
            <div className="grid grid-cols-3 gap-4 lg:gap-6">
              <div className="text-center lg:text-right">
                <p className="text-xs text-gray-500 mb-1">Total Profit</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(property.totalProfit || 0)}
                </p>
              </div>
              <div className="text-center lg:text-right">
                <p className="text-xs text-gray-500 mb-1">Total Expenses</p>
                <p className="text-lg font-bold text-red-600">
                  {formatCurrency(property.totalExpenses || 0)}
                </p>
              </div>
              <div className="text-center lg:text-right">
                <p className="text-xs text-gray-500 mb-1">Net Balance</p>
                <div className="flex items-center justify-center lg:justify-end gap-2">
                  {isPositive ? (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  )}
                  <p
                    className={`text-lg font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatCurrency(Math.abs(netBalance))}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-6 pt-6 border-t border-white/40">
            {canEdit && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={`/properties/${propertyId}/transactions/new`}
                  className="btn btn-salmon text-sm sm:text-base py-2 px-3 sm:px-4"
                >
                  <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Add</span> Transaction
                </Link>
              </motion.div>
            )}
            {property.isOwner && (
              <>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href={`/properties/${propertyId}/share`}
                    className="btn btn-outline text-sm sm:text-base py-2 px-3 sm:px-4"
                  >
                    <Share2 className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
                    <span className="hidden sm:inline">Share</span>
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href={`/properties/${propertyId}/edit`}
                    className="btn btn-outline text-sm sm:text-base py-2 px-3 sm:px-4"
                  >
                    <Edit className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
                    <span className="hidden sm:inline">Edit</span>
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="btn btn-outline text-red-600 hover:bg-red-50/50 text-sm sm:text-base py-2 px-3 sm:px-4"
                  >
                    <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </motion.div>
              </>
            )}
          </div>
        </motion.div>

        {/* Transactions */}

        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Transactions
        </h2>
        {!property.transactions || property.transactions.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No transactions recorded yet</p>
            {canEdit && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={`/properties/${propertyId}/transactions/new`}
                  className="btn btn-salmon inline-flex"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Add First Transaction
                </Link>
              </motion.div>
            )}
          </div>
        ) : (
          <AnimatedList className="flex flex-col gap-3">
            {property.transactions.map((transaction) => (
              <AnimatedListItem key={transaction.id}>
                <TransactionRow
                  transaction={transaction}
                  canEdit={canEdit}
                  onDelete={() => handleDeleteTransaction(transaction.id)}
                />
              </AnimatedListItem>
            ))}
          </AnimatedList>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete Property
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete &quot;{property.name}&quot;?
                This will also delete all transactions and shares. This action
                cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="btn bg-red-600 text-white hover:bg-red-700 flex-1"
                >
                  {isDeleting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Delete"
                  )}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

function TransactionRow({
  transaction,
  canEdit,
  onDelete,
}: {
  transaction: PropertyTransaction;
  canEdit: boolean;
  onDelete: () => void;
}) {
  const [showActionModal, setShowActionModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const isExpense = transaction.type === TransactionType.EXPENSE;
  const categoryName = transaction.category?.name || "Unknown";
  const Icon = CATEGORY_ICONS[categoryName] || (isExpense ? Minus : Plus);

  const colors = isExpense
    ? {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-700",
        icon: "text-red-500",
      }
    : {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-700",
        icon: "text-green-500",
      };

  return (
    <>
      {/* Clickable Transaction Row */}
      <motion.div
        onClick={() => setShowActionModal(true)}
        className={cn(
          "flex items-center gap-4 rounded-2xl border-2 p-4 cursor-pointer transition-all duration-200",
          colors.bg,
          colors.border,
          "hover:shadow-md",
        )}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {/* Icon */}
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border bg-white",
            isExpense ? "border-red-200" : "border-green-200",
          )}
        >
          <Icon className={cn("h-6 w-6", colors.icon)} />
        </div>

        {/* Transaction Details (Left) */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900 truncate">
              {categoryName}
            </p>
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                isExpense
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700",
              )}
            >
              {isExpense ? "Expense" : "Profit"}
            </span>
          </div>
          <p className={cn("text-sm", colors.text)}>
            {formatDate(transaction.date)}
          </p>
          {transaction.description && (
            <p className="text-xs text-gray-500 mt-1 truncate">
              {transaction.description}
            </p>
          )}
        </div>

        {/* Amount (Right) */}
        <div className="shrink-0 text-right">
          <p
            className={cn(
              "text-lg font-bold tabular-nums",
              isExpense ? "text-red-600" : "text-green-600",
            )}
          >
            {isExpense ? "-" : "+"}
            {formatCurrency(Number(transaction.amount), transaction.currency)}
          </p>
        </div>
      </motion.div>

      {/* Action Modal */}
      <AnimatePresence>
        {showActionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            onClick={() => setShowActionModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Transaction Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className={cn("p-3 rounded-xl", colors.bg)}>
                  <Icon className={cn("h-6 w-6", colors.icon)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {categoryName}
                  </p>
                  <p className={cn("text-sm", colors.text)}>
                    {isExpense ? "Expense" : "Profit"}
                  </p>
                </div>
                <button
                  onClick={() => setShowActionModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setShowActionModal(false);
                    setShowInfoModal(true);
                  }}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                >
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Eye className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">View Details</p>
                    <p className="text-sm text-gray-500">
                      See all transaction information
                    </p>
                  </div>
                </button>

                {canEdit && (
                  <>
                    <Link
                      href={`/properties/${transaction.propertyId}/transactions/${transaction.id}/edit`}
                      onClick={() => setShowActionModal(false)}
                      className="w-full flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                    >
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <Edit className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Edit Transaction
                        </p>
                        <p className="text-sm text-gray-500">
                          Update amount or details
                        </p>
                      </div>
                    </Link>

                    <button
                      onClick={() => {
                        setShowActionModal(false);
                        onDelete();
                      }}
                      className="w-full flex items-center gap-3 p-4 rounded-xl bg-red-50 hover:bg-red-100 transition-colors text-left"
                    >
                      <div className="p-2 bg-red-100 rounded-lg">
                        <Trash2 className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-red-600">
                          Delete Transaction
                        </p>
                        <p className="text-sm text-red-400">
                          Remove from property
                        </p>
                      </div>
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            onClick={() => setShowInfoModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Transaction Details
                </h3>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              {/* Transaction Info */}
              <div className={cn("p-4 rounded-2xl mb-4", colors.bg)}>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-white/60">
                    <Icon className={cn("h-6 w-6", colors.icon)} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {categoryName}
                    </p>
                    <p className={cn("text-sm", colors.text)}>
                      {isExpense ? "Expense" : "Profit"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount</span>
                  <span
                    className={cn(
                      "font-semibold",
                      isExpense ? "text-red-600" : "text-green-600",
                    )}
                  >
                    {isExpense ? "-" : "+"}
                    {formatCurrency(
                      Number(transaction.amount),
                      transaction.currency,
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Currency</span>
                  <span className="font-medium text-gray-700">
                    {transaction.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium text-gray-700">
                    {formatDate(transaction.date)}
                  </span>
                </div>
                {transaction.description && (
                  <div>
                    <span className="text-gray-500 block mb-1">
                      Description
                    </span>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-xl text-sm">
                      {transaction.description}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default PropertyDetailClient;
