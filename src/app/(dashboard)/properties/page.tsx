"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { propertiesApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Property } from "@/types";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import {
  Building2,
  PlusCircle,
  Loader2,
  Users,
  ArrowRight,
  Share2,
  TrendingUp,
  TrendingDown,
  MapPin,
} from "lucide-react";
import {
  PageTransition,
  AnimatedList,
  AnimatedListItem,
  Floating,
} from "@/components/animations";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<{
    owned: Property[];
    shared: Property[];
  }>({ owned: [], shared: [] });
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAuthStore();
  const displayCurrency = user?.displayCurrency || "USD";

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await propertiesApi.getAll();
        setProperties(response.data);
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, []);

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

  return (
    <PageTransition>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
      >
        <div>
          <div className="flex justify-center">
            <Image
              src="/properties.webp"
              alt="Properties"
              width={200}
              height={200}
            />
          </div>
          <h1 className="text-2xl text-center font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            My Properties
          </h1>
          <p className="text-gray-600">
            Track expenses and profits for your properties
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link href="/properties/new" className="btn btn-salmon">
            <PlusCircle className="h-5 w-5 mr-2" />
            New Property
          </Link>
        </motion.div>
      </motion.div>

      {properties.owned.length === 0 && properties.shared.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card text-center py-16"
        >
          <Floating>
            <div className="empty-state-icon mx-auto">
              <Building2 className="h-10 w-10 text-gray-400" />
            </div>
          </Floating>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No properties yet
          </h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            Add your first property to start tracking rental income, expenses,
            and profit margins
          </p>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link href="/properties/new" className="btn btn-salmon inline-flex">
              <PlusCircle className="h-5 w-5 mr-2" />
              Add Property
            </Link>
          </motion.div>
        </motion.div>
      ) : (
        <AnimatedList className="grid gap-4">
          {/* Owned properties */}
          {properties.owned.map((property) => (
            <AnimatedListItem key={property.id}>
              <PropertyCard
                property={property}
                isOwner
                displayCurrency={displayCurrency}
              />
            </AnimatedListItem>
          ))}
          {/* Shared properties */}
          {properties.shared.map((property) => (
            <AnimatedListItem key={property.id}>
              <PropertyCard
                property={property}
                isOwner={false}
                displayCurrency={displayCurrency}
              />
            </AnimatedListItem>
          ))}
        </AnimatedList>
      )}
    </PageTransition>
  );
}

function PropertyCard({
  property,
  isOwner,
  displayCurrency,
}: {
  property: Property;
  isOwner: boolean;
  displayCurrency: string;
}) {
  const sharedCount = property.shares?.filter(
    (s) => s.status === "ACCEPTED",
  ).length;

  const netBalance = property.netBalance || 0;
  const isPositive = netBalance >= 0;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link
        href={`/properties/${property.id}`}
        className="card card-hover block"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <motion.div
              className={
                isOwner
                  ? "icon-container-salmon"
                  : "icon-container bg-blue-50/80 border-blue-100/50"
              }
              whileHover={{ rotate: 5, scale: 1.05 }}
            >
              {isOwner ? (
                <Building2 className="h-6 w-6 text-salmon" />
              ) : (
                <Share2 className="h-6 w-6 text-blue-600" />
              )}
            </motion.div>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {property.name}
              </h3>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm text-gray-500">
                {property.address && (
                  <span className="flex items-center gap-1 truncate max-w-[200px]">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{property.address}</span>
                  </span>
                )}
                {!isOwner && property.user && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50/80 text-blue-600 rounded-lg border border-blue-100/50 text-xs">
                    <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-medium">
                      {getInitials(property.user.name)}
                    </div>
                    <span className="hidden sm:inline">
                      {property.user.name}
                    </span>
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-salmon/60" />
                  {property.transactions?.length || 0} transactions
                </span>
                {isOwner && sharedCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      Shared with {sharedCount}
                    </span>
                  </span>
                )}
                <span className="hidden sm:inline text-gray-400">
                  Updated {formatDate(property.updatedAt)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-4 pl-[64px] sm:pl-0">
            <div className="text-left sm:text-right">
              <motion.div
                className="flex items-center gap-2 justify-start sm:justify-end"
                key={netBalance}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
              >
                {isPositive ? (
                  <TrendingUp className="h-5 w-5 text-green-500" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-500" />
                )}
                <span
                  className={`text-2xl font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}
                >
                  {formatCurrency(Math.abs(netBalance), displayCurrency)}
                </span>
              </motion.div>
              <p className="text-sm text-gray-500">
                {isPositive ? "Net Profit" : "Net Loss"}
              </p>
            </div>
            <motion.div className="text-gray-400" whileHover={{ x: 4 }}>
              <ArrowRight className="h-5 w-5" />
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
