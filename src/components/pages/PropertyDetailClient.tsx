"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { propertiesApi, propertyTransactionsApi } from "@/lib/api";
import {
  Property,
  PropertyTransaction,
  TransactionType,
  Permission,
  EXPENSE_CATEGORY_ICONS,
  PROFIT_CATEGORY_ICONS,
} from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
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
  MoreVertical,
  MapPin,
  Calendar,
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
} from "lucide-react";
import { PageTransition } from "@/components/animations";

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
          <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-white/50">
            {canEdit && (
              <Link
                href={`/properties/${propertyId}/transactions/new`}
                className="btn btn-salmon"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Add Transaction
              </Link>
            )}
            {property.isOwner && (
              <>
                <Link
                  href={`/properties/${propertyId}/share`}
                  className="btn btn-outline"
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Share
                </Link>
                <Link
                  href={`/properties/${propertyId}/edit`}
                  className="btn btn-outline"
                >
                  <Edit className="h-5 w-5 mr-2" />
                  Edit
                </Link>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn btn-outline text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  Delete
                </button>
              </>
            )}
          </div>
        </motion.div>

        {/* Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Transactions
          </h2>
          {!property.transactions || property.transactions.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No transactions recorded yet</p>
              {canEdit && (
                <Link
                  href={`/properties/${propertyId}/transactions/new`}
                  className="btn btn-salmon"
                >
                  Add First Transaction
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {property.transactions.map((transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  canEdit={canEdit}
                  onDelete={() => handleDeleteTransaction(transaction.id)}
                />
              ))}
            </div>
          )}
        </motion.div>

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
  const [showMenu, setShowMenu] = useState(false);
  const isExpense = transaction.type === TransactionType.EXPENSE;
  const categoryName = transaction.category?.name || "Unknown";
  const Icon = CATEGORY_ICONS[categoryName] || (isExpense ? Minus : Plus);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-between py-4"
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isExpense
              ? "bg-red-50 border border-red-100"
              : "bg-green-50 border border-green-100"
          }`}
        >
          <Icon
            className={`h-5 w-5 ${isExpense ? "text-red-600" : "text-green-600"}`}
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900">{categoryName}</p>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                isExpense
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {isExpense ? "Expense" : "Profit"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(transaction.date)}</span>
            {transaction.description && (
              <>
                <span className="text-gray-300">•</span>
                <span className="truncate max-w-[200px]">
                  {transaction.description}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <p
          className={`font-semibold text-lg ${isExpense ? "text-red-600" : "text-green-600"}`}
        >
          {isExpense ? "-" : "+"}
          {formatCurrency(Number(transaction.amount), transaction.currency)}
        </p>
        {canEdit && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="h-4 w-4 text-gray-500" />
            </button>
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border z-20 py-1 min-w-[120px]">
                  <Link
                    href={`/properties/${transaction.propertyId}/transactions/${transaction.id}/edit`}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Link>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete();
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default PropertyDetailClient;
