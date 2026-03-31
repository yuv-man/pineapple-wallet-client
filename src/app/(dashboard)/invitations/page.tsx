'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { sharingApi, propertySharingApi } from '@/lib/api';
import { Invitation, PropertyInvitation, Permission } from '@/types';
import { formatDate, getInitials } from '@/lib/utils';
import { Loader2, Bell, Check, X, Eye, Edit, Wallet, Building2 } from 'lucide-react';
import {
  PageTransition,
  AnimatedList,
  AnimatedListItem,
  Floating,
} from '@/components/animations';

export default function InvitationsPage() {
  const router = useRouter();
  const [portfolioInvitations, setPortfolioInvitations] = useState<Invitation[]>([]);
  const [propertyInvitations, setPropertyInvitations] = useState<PropertyInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const [portfolioRes, propertyRes] = await Promise.all([
          sharingApi.getInvitations(),
          propertySharingApi.getPropertyInvitations(),
        ]);
        setPortfolioInvitations(portfolioRes.data);
        setPropertyInvitations(propertyRes.data);
      } catch (error) {
        console.error('Failed to fetch invitations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvitations();
  }, []);

  const handleRespondPortfolio = async (id: string, accept: boolean) => {
    try {
      await sharingApi.respondToInvitation(id, accept);
      setPortfolioInvitations(portfolioInvitations.filter((inv) => inv.id !== id));
      if (accept) {
        router.push('/portfolios');
      }
    } catch (error) {
      console.error('Failed to respond to invitation:', error);
    }
  };

  const handleRespondProperty = async (id: string, accept: boolean) => {
    try {
      await propertySharingApi.respondToPropertyInvitation(id, accept);
      setPropertyInvitations(propertyInvitations.filter((inv) => inv.id !== id));
      if (accept) {
        router.push('/properties');
      }
    } catch (error) {
      console.error('Failed to respond to invitation:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="h-8 w-8 text-pineapple" />
        </motion.div>
      </div>
    );
  }

  const hasInvitations = portfolioInvitations.length > 0 || propertyInvitations.length > 0;

  return (
    <PageTransition>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Invitations
        </h1>
        <p className="text-gray-600">
          Pending invitations from other users
        </p>
      </motion.div>

      {!hasInvitations ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card text-center py-16"
        >
          <Floating>
            <div className="empty-state-icon mx-auto">
              <Bell className="h-10 w-10 text-gray-400" />
            </div>
          </Floating>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No pending invitations
          </h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            When someone shares a portfolio or property with you, it will appear here
          </p>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {/* Portfolio Invitations */}
          {portfolioInvitations.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Wallet className="h-5 w-5 text-pineapple" />
                Portfolio Invitations
              </h2>
              <AnimatedList className="space-y-4">
                {portfolioInvitations.map((invitation) => (
                  <AnimatedListItem key={invitation.id}>
                    <PortfolioInvitationCard
                      invitation={invitation}
                      onAccept={() => handleRespondPortfolio(invitation.id, true)}
                      onDecline={() => handleRespondPortfolio(invitation.id, false)}
                    />
                  </AnimatedListItem>
                ))}
              </AnimatedList>
            </div>
          )}

          {/* Property Invitations */}
          {propertyInvitations.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-pineapple" />
                Property Invitations
              </h2>
              <AnimatedList className="space-y-4">
                {propertyInvitations.map((invitation) => (
                  <AnimatedListItem key={invitation.id}>
                    <PropertyInvitationCard
                      invitation={invitation}
                      onAccept={() => handleRespondProperty(invitation.id, true)}
                      onDecline={() => handleRespondProperty(invitation.id, false)}
                    />
                  </AnimatedListItem>
                ))}
              </AnimatedList>
            </div>
          )}
        </div>
      )}
    </PageTransition>
  );
}

function PortfolioInvitationCard({
  invitation,
  onAccept,
  onDecline,
}: {
  invitation: Invitation;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const [isResponding, setIsResponding] = useState(false);

  const handleAccept = async () => {
    setIsResponding(true);
    await onAccept();
  };

  const handleDecline = async () => {
    setIsResponding(true);
    await onDecline();
  };

  return (
    <motion.div
      className="card"
      whileHover={{ scale: 1.005 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3 sm:gap-4 min-w-0">
          <motion.div
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-pineapple/30 to-pineapple/10
                       backdrop-blur-sm border border-pineapple/20
                       flex items-center justify-center text-pineapple-dark font-semibold
                       shadow-sm shrink-0"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            {getInitials(invitation.portfolio.user.name)}
          </motion.div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 text-sm sm:text-base">
              <span className="font-semibold">{invitation.portfolio.user.name}</span> shared a portfolio
            </p>
            <p className="text-base sm:text-lg font-semibold text-gray-900 mt-1 truncate">
              {invitation.portfolio.name}
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-500">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/50 border border-white/60">
                {invitation.permission === Permission.VIEW ? (
                  <>
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>View</span>
                  </>
                ) : (
                  <>
                    <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Edit</span>
                  </>
                )}
              </span>
              <span className="hidden sm:inline">Received {formatDate(invitation.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 sm:gap-3 shrink-0 pl-[52px] sm:pl-0">
          <motion.button
            onClick={handleDecline}
            disabled={isResponding}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn btn-outline text-red-600 hover:bg-red-50/50 text-sm py-2 px-3 sm:px-4"
          >
            {isResponding ? (
              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
            ) : (
              <>
                <X className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-1" />
                <span className="hidden sm:inline">Decline</span>
              </>
            )}
          </motion.button>
          <motion.button
            onClick={handleAccept}
            disabled={isResponding}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn btn-primary text-sm py-2 px-3 sm:px-4"
          >
            {isResponding ? (
              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
            ) : (
              <>
                <Check className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-1" />
                <span className="hidden sm:inline">Accept</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function PropertyInvitationCard({
  invitation,
  onAccept,
  onDecline,
}: {
  invitation: PropertyInvitation;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const [isResponding, setIsResponding] = useState(false);

  const handleAccept = async () => {
    setIsResponding(true);
    await onAccept();
  };

  const handleDecline = async () => {
    setIsResponding(true);
    await onDecline();
  };

  return (
    <motion.div
      className="card"
      whileHover={{ scale: 1.005 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3 sm:gap-4 min-w-0">
          <motion.div
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-50
                       backdrop-blur-sm border border-blue-200/50
                       flex items-center justify-center text-blue-600 font-semibold
                       shadow-sm shrink-0"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            {getInitials(invitation.property.user.name)}
          </motion.div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 text-sm sm:text-base">
              <span className="font-semibold">{invitation.property.user.name}</span> shared a property
            </p>
            <p className="text-base sm:text-lg font-semibold text-gray-900 mt-1 truncate">
              {invitation.property.name}
            </p>
            {invitation.property.address && (
              <p className="text-sm text-gray-500 truncate">{invitation.property.address}</p>
            )}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-500">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/50 border border-white/60">
                {invitation.permission === Permission.VIEW ? (
                  <>
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>View</span>
                  </>
                ) : (
                  <>
                    <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Edit</span>
                  </>
                )}
              </span>
              <span className="hidden sm:inline">Received {formatDate(invitation.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 sm:gap-3 shrink-0 pl-[52px] sm:pl-0">
          <motion.button
            onClick={handleDecline}
            disabled={isResponding}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn btn-outline text-red-600 hover:bg-red-50/50 text-sm py-2 px-3 sm:px-4"
          >
            {isResponding ? (
              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
            ) : (
              <>
                <X className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-1" />
                <span className="hidden sm:inline">Decline</span>
              </>
            )}
          </motion.button>
          <motion.button
            onClick={handleAccept}
            disabled={isResponding}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn btn-primary text-sm py-2 px-3 sm:px-4"
          >
            {isResponding ? (
              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
            ) : (
              <>
                <Check className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-1" />
                <span className="hidden sm:inline">Accept</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
