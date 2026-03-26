'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { portfoliosApi, assetsApi } from '@/lib/api';
import { Portfolio, Asset, AssetType, ASSET_TYPE_LABELS, Permission } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  PlusCircle,
  Loader2,
  Share2,
  Edit,
  Trash2,
  Home,
  Landmark,
  Bitcoin,
  TrendingUp,
  PiggyBank,
  MoreVertical,
} from 'lucide-react';

const ASSET_ICONS: Record<AssetType, React.ElementType> = {
  [AssetType.BANK_ACCOUNT]: Landmark,
  [AssetType.REAL_ESTATE]: Home,
  [AssetType.CRYPTO]: Bitcoin,
  [AssetType.STOCK]: TrendingUp,
  [AssetType.INVESTMENT]: PiggyBank,
};

export function PortfolioDetailClient() {
  const params = useParams();
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const portfolioId = params.id as string;

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await portfoliosApi.getOne(portfolioId);
        setPortfolio(response.data);
      } catch (error) {
        console.error('Failed to fetch portfolio:', error);
        router.push('/portfolios');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolio();
  }, [portfolioId, router]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await portfoliosApi.delete(portfolioId);
      router.push('/portfolios');
    } catch (error) {
      console.error('Failed to delete portfolio:', error);
      setIsDeleting(false);
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    try {
      await assetsApi.delete(assetId);
      setPortfolio((prev) =>
        prev
          ? {
              ...prev,
              assets: prev.assets.filter((a) => a.id !== assetId),
              totalValue:
                prev.totalValue -
                (prev.assets.find((a) => a.id === assetId)?.value || 0),
            }
          : null
      );
    } catch (error) {
      console.error('Failed to delete asset:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-pineapple" />
      </div>
    );
  }

  if (!portfolio) {
    return null;
  }

  const canEdit = portfolio.isOwner || portfolio.permission === Permission.EDIT;

  return (
    <div>
      <Link
        href="/portfolios"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Portfolios
      </Link>

      {/* Header */}
      <div className="card mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{portfolio.name}</h1>
            {portfolio.description && (
              <p className="text-gray-600 mt-1">{portfolio.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              {!portfolio.isOwner && (
                <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md">
                  Shared by {portfolio.user.name}
                </span>
              )}
              <span>Created {formatDate(portfolio.createdAt)}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(portfolio.totalValue)}
            </p>
            <p className="text-sm text-gray-500">Total Value</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-6 pt-6 border-t">
          {canEdit && (
            <Link
              href={`/portfolios/${portfolioId}/assets/new`}
              className="btn btn-primary"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Add Asset
            </Link>
          )}
          {portfolio.isOwner && (
            <>
              <Link
                href={`/portfolios/${portfolioId}/share`}
                className="btn btn-outline"
              >
                <Share2 className="h-5 w-5 mr-2" />
                Share
              </Link>
              <Link
                href={`/portfolios/${portfolioId}/edit`}
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
      </div>

      {/* Assets */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Assets</h2>
        {portfolio.assets.length === 0 ? (
          <div className="text-center py-12">
            <PiggyBank className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No assets in this portfolio</p>
            {canEdit && (
              <Link
                href={`/portfolios/${portfolioId}/assets/new`}
                className="btn btn-primary"
              >
                Add Your First Asset
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {portfolio.assets.map((asset) => (
              <AssetRow
                key={asset.id}
                asset={asset}
                canEdit={canEdit}
                onDelete={() => handleDeleteAsset(asset.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Portfolio
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete &quot;{portfolio.name}&quot;? This will
              also delete all assets and shares. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="btn btn-danger flex-1"
              >
                {isDeleting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Delete'
                )}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-outline flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AssetRow({
  asset,
  canEdit,
  onDelete,
}: {
  asset: Asset;
  canEdit: boolean;
  onDelete: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const Icon = ASSET_ICONS[asset.type];

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          <Icon className="h-5 w-5 text-gray-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{asset.name}</p>
          <p className="text-sm text-gray-500">
            {ASSET_TYPE_LABELS[asset.type]}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-semibold text-gray-900">
            {formatCurrency(Number(asset.value), asset.currency)}
          </p>
          {asset.notes && (
            <p className="text-xs text-gray-500 truncate max-w-[150px]">
              {asset.notes}
            </p>
          )}
        </div>
        {canEdit && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg"
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
                    href={`/assets/${asset.id}/edit`}
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
    </div>
  );
}
