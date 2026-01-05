'use client';

import { useEffect, useState } from 'react';
import { sharingApi } from '@/lib/api';
import { Invitation, Permission } from '@/types';
import { formatDate, getInitials } from '@/lib/utils';
import { Loader2, Bell, Check, X, Eye, Edit } from 'lucide-react';

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const response = await sharingApi.getInvitations();
        setInvitations(response.data);
      } catch (error) {
        console.error('Failed to fetch invitations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvitations();
  }, []);

  const handleRespond = async (id: string, accept: boolean) => {
    try {
      await sharingApi.respondToInvitation(id, accept);
      setInvitations(invitations.filter((inv) => inv.id !== id));
    } catch (error) {
      console.error('Failed to respond to invitation:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-pineapple" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Invitations</h1>
        <p className="text-gray-600">
          Portfolio invitations from other users
        </p>
      </div>

      {invitations.length === 0 ? (
        <div className="card text-center py-12">
          <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No pending invitations
          </h3>
          <p className="text-gray-500">
            When someone shares a portfolio with you, it will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {invitations.map((invitation) => (
            <InvitationCard
              key={invitation.id}
              invitation={invitation}
              onAccept={() => handleRespond(invitation.id, true)}
              onDecline={() => handleRespond(invitation.id, false)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function InvitationCard({
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
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-pineapple/20 flex items-center justify-center text-pineapple-dark font-semibold">
            {getInitials(invitation.portfolio.user.name)}
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {invitation.portfolio.user.name} shared a portfolio with you
            </p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {invitation.portfolio.name}
            </p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                {invitation.permission === Permission.VIEW ? (
                  <>
                    <Eye className="h-4 w-4" />
                    View access
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4" />
                    Edit access
                  </>
                )}
              </span>
              <span>Received {formatDate(invitation.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDecline}
            disabled={isResponding}
            className="btn btn-outline text-red-600 hover:bg-red-50"
          >
            {isResponding ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <X className="h-5 w-5 mr-1" />
                Decline
              </>
            )}
          </button>
          <button
            onClick={handleAccept}
            disabled={isResponding}
            className="btn btn-primary"
          >
            {isResponding ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Check className="h-5 w-5 mr-1" />
                Accept
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
