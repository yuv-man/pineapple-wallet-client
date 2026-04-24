"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Loader2,
  CreditCard,
  Home,
  GraduationCap,
  User,
  Car,
  Building,
  Stethoscope,
  MoreHorizontal,
} from "lucide-react";
import { liabilitiesApi } from "@/lib/api";
import { LiabilityType, LIABILITY_TYPE_LABELS } from "@/types";
import { PageTransition } from "@/components/animations";

const FIAT_CURRENCIES = ["USD", "EUR", "GBP", "ILS", "JPY", "CHF", "CAD", "AUD"];

const LIABILITY_ICONS: Record<LiabilityType, React.ElementType> = {
  [LiabilityType.CREDIT_CARD]: CreditCard,
  [LiabilityType.MORTGAGE]: Home,
  [LiabilityType.STUDENT_LOAN]: GraduationCap,
  [LiabilityType.PERSONAL_LOAN]: User,
  [LiabilityType.AUTO_LOAN]: Car,
  [LiabilityType.HOME_EQUITY_LOAN]: Building,
  [LiabilityType.MEDICAL_DEBT]: Stethoscope,
  [LiabilityType.OTHER]: MoreHorizontal,
};

const liabilitySchema = z.object({
  type: z.nativeEnum(LiabilityType),
  name: z.string().min(1, "Name is required").max(100),
  balance: z.number().min(0, "Balance must be positive"),
  currency: z.string().default("USD"),
  interestRate: z.number().min(0).max(100).optional(),
  minimumPayment: z.number().min(0).optional(),
  dueDate: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

type LiabilityForm = z.infer<typeof liabilitySchema>;

export default function NewLiabilityClient() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<LiabilityType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LiabilityForm>({
    resolver: zodResolver(liabilitySchema),
    defaultValues: { currency: "USD" },
  });

  const handleTypeSelect = (type: LiabilityType) => {
    setSelectedType(type);
    setValue("type", type);
  };

  const onSubmit = async (data: LiabilityForm) => {
    setIsLoading(true);
    setError(null);
    try {
      await liabilitiesApi.create({
        ...data,
        interestRate:
          data.interestRate != null ? data.interestRate / 100 : undefined,
      });
      router.push("/liabilities");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create liability");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-2xl">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            href="/liabilities"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 group"
          >
            <motion.div
              whileHover={{ x: -4 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
            </motion.div>
            Back to Liabilities
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="card"
        >
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">
            Add New Liability
          </h1>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl text-red-600 text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Liability Type Selection */}
            <div>
              <label className="label mb-3 block">Liability Type</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.values(LiabilityType).map((type, index) => {
                  const Icon = LIABILITY_ICONS[type];
                  const isSelected = selectedType === type;
                  return (
                    <motion.button
                      key={type}
                      type="button"
                      onClick={() => handleTypeSelect(type)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04, duration: 0.3 }}
                      whileHover={{ y: -2, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={isSelected ? "type-card-selected" : "type-card"}
                    >
                      <motion.div
                        animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        <Icon
                          className={`h-6 w-6 mb-2 ${
                            isSelected ? "text-pineapple" : "text-gray-500"
                          }`}
                        />
                      </motion.div>
                      <p
                        className={`text-xs font-medium ${
                          isSelected ? "text-pineapple-dark" : "text-gray-900"
                        }`}
                      >
                        {LIABILITY_TYPE_LABELS[type]}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
              {errors.type && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.type.message}
                </p>
              )}
            </div>

            {/* Details */}
            <AnimatePresence mode="wait">
              {selectedType && (
                <motion.div
                  key={selectedType}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="name" className="label">
                      Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      className="input mt-1"
                      placeholder="e.g., Chase Visa Card"
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="balance" className="label">
                        Current Balance
                      </label>
                      <input
                        id="balance"
                        type="number"
                        step="0.01"
                        className="input mt-1"
                        placeholder="0.00"
                        {...register("balance", { valueAsNumber: true })}
                      />
                      {errors.balance && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.balance.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="currency" className="label">
                        Currency
                      </label>
                      <select
                        id="currency"
                        className="input mt-1"
                        {...register("currency")}
                      >
                        {FIAT_CURRENCIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="interestRate" className="label">
                        Interest Rate (% APR)
                      </label>
                      <input
                        id="interestRate"
                        type="number"
                        step="0.01"
                        className="input mt-1"
                        placeholder="e.g., 24.90"
                        {...register("interestRate", { valueAsNumber: true })}
                      />
                    </div>
                    <div>
                      <label htmlFor="minimumPayment" className="label">
                        Minimum Payment
                      </label>
                      <input
                        id="minimumPayment"
                        type="number"
                        step="0.01"
                        className="input mt-1"
                        placeholder="0.00"
                        {...register("minimumPayment", { valueAsNumber: true })}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="dueDate" className="label">
                      Due Date (Optional)
                    </label>
                    <input
                      id="dueDate"
                      type="date"
                      className="input mt-1"
                      {...register("dueDate")}
                    />
                  </div>

                  <div>
                    <label htmlFor="notes" className="label">
                      Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      className="input mt-1 min-h-[80px]"
                      placeholder="Add any additional notes..."
                      {...register("notes")}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="btn btn-primary"
                    >
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <Loader2 className="h-5 w-5" />
                        </motion.div>
                      ) : (
                        "Add Liability"
                      )}
                    </motion.button>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link href="/liabilities" className="btn btn-secondary">
                        Cancel
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </div>
    </PageTransition>
  );
}
