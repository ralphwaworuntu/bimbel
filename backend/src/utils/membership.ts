import { prisma } from '../config/prisma';
import { HttpError } from '../middlewares/errorHandler';

const membershipInclude = {
  package: {
    select: {
      name: true,
      durationDays: true,
      tryoutQuota: true,
      moduleQuota: true,
      allowTryout: true,
      allowPractice: true,
      allowCermat: true,
      materials: {
        include: {
          material: {
            select: { id: true, title: true, category: true, type: true, description: true, fileUrl: true },
          },
        },
      },
    },
  },
  addonTransactions: {
    where: { status: 'PAID', type: 'ADDON' },
    include: {
      addon: {
        select: {
          name: true,
          tryoutBonus: true,
          moduleBonus: true,
          materials: {
            include: {
              material: {
                select: { id: true, title: true, category: true, type: true, description: true, fileUrl: true },
              },
            },
          },
        },
      },
    },
  },
} as const;

export async function getActiveMembership(userId: string) {
  return prisma.transaction.findFirst({
    where: {
      userId,
      status: 'PAID',
      type: 'MEMBERSHIP',
      activatedAt: { not: null },
      OR: [{ expiresAt: { gt: new Date() } }, { expiresAt: null }],
    },
    include: membershipInclude,
    orderBy: { expiresAt: 'desc' },
  });
}

export async function assertActiveMembership(userId: string) {
  const membership = await getActiveMembership(userId);
  if (!membership) {
    throw new HttpError('Membership tidak aktif atau belum divalidasi admin.', 403, {
      code: 'MEMBERSHIP_REQUIRED',
    });
  }
  return membership;
}

type MembershipFeature = 'TRYOUT' | 'PRACTICE' | 'CERMAT';

export function assertMembershipFeature(
  membership: Awaited<ReturnType<typeof getActiveMembership>>,
  feature: MembershipFeature,
) {
  if (!membership?.package) return membership;
  const allowTryout = membership.package.allowTryout ?? true;
  const allowPractice = membership.package.allowPractice ?? true;
  const allowCermat = membership.package.allowCermat ?? true;
  const allowed =
    (feature === 'TRYOUT' && allowTryout) ||
    (feature === 'PRACTICE' && allowPractice) ||
    (feature === 'CERMAT' && allowCermat);
  if (!allowed) {
    throw new HttpError('Paket Anda belum mencakup fitur ini.', 403, { code: 'FEATURE_DISABLED' });
  }
  return membership;
}

export async function assertMembershipFeatureByUser(userId: string, feature: MembershipFeature) {
  const membership = await assertActiveMembership(userId);
  return assertMembershipFeature(membership, feature);
}

export function collectAllowedMaterialIds(membership: Awaited<ReturnType<typeof getActiveMembership>>) {
  if (!membership) return new Set<string>();
  const ids = new Set<string>();
  membership.package?.materials.forEach((item) => ids.add(item.materialId));
  membership.addonTransactions.forEach((trx) => {
    trx.addon?.materials.forEach((item) => ids.add(item.materialId));
  });
  return ids;
}

export async function getMembershipAccess(userId: string) {
  const membership = await assertActiveMembership(userId);
  const allowedMaterialIds = collectAllowedMaterialIds(membership);
  return { membership, allowedMaterialIds };
}

export async function consumeTryoutQuota(userId: string) {
  const membership = await assertActiveMembership(userId);
  assertMembershipFeature(membership, 'TRYOUT');
  if (membership.tryoutQuota > 0 && membership.tryoutUsed >= membership.tryoutQuota) {
    throw new HttpError('Kuota tryout Anda telah habis. Silakan perpanjang paket atau beli addon.', 403, {
      code: 'TRYOUT_QUOTA_EXHAUSTED',
    });
  }

  if (membership.tryoutQuota > 0) {
    const updated = await prisma.transaction.updateMany({
      where: {
        id: membership.id,
        tryoutUsed: { lt: membership.tryoutQuota },
      },
      data: { tryoutUsed: { increment: 1 } },
    });

    if (updated.count === 0) {
      throw new HttpError('Kuota tryout Anda telah habis. Silakan perpanjang paket atau beli addon.', 403, {
        code: 'TRYOUT_QUOTA_EXHAUSTED',
      });
    }
  }

  return membership;
}
