import { ExamBlockType } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { HttpError } from '../../middlewares/errorHandler';

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function ensureExamAccess(userId: string, type: ExamBlockType) {
  const activeBlock = await prisma.examBlock.findFirst({ where: { userId, type, resolvedAt: null } });
  if (activeBlock) {
    throw new HttpError('Akses ujian sedang diblokir. Hubungi admin untuk kode buka blokir.', 423);
  }
}

export async function recordExamViolation(userId: string, type: ExamBlockType, reason?: string) {
  const existing = await prisma.examBlock.findFirst({ where: { userId, type, resolvedAt: null } });
  const code = generateCode();
  if (existing) {
    return prisma.examBlock.update({
      where: { id: existing.id },
      data: {
        violationCount: { increment: 1 },
        code,
        blockedAt: new Date(),
        reason: reason ?? existing.reason,
      },
    });
  }
  return prisma.examBlock.create({ data: { userId, type, reason: reason ?? null, code } });
}

export async function listUserExamBlocks(userId: string) {
  return prisma.examBlock.findMany({
    where: { userId, resolvedAt: null },
    orderBy: { blockedAt: 'desc' },
    select: {
      id: true,
      type: true,
      reason: true,
      blockedAt: true,
      violationCount: true,
    },
  });
}

export async function unlockExamBlock(userId: string, type: ExamBlockType, code: string) {
  const block = await prisma.examBlock.findFirst({ where: { userId, type, resolvedAt: null } });
  if (!block) {
    throw new HttpError('Tidak ada blokir aktif untuk ujian ini.', 404);
  }
  if (block.code !== code) {
    throw new HttpError('Kode buka blokir salah.', 400);
  }
  await prisma.examBlock.update({
    where: { id: block.id },
    data: { resolvedAt: new Date(), code: generateCode() },
  });
}

export async function regenerateExamBlockCode(blockId: string) {
  const block = await prisma.examBlock.findUnique({ where: { id: blockId } });
  if (!block || block.resolvedAt) {
    throw new HttpError('Blokir ujian tidak ditemukan atau sudah selesai.', 404);
  }
  const code = generateCode();
  return prisma.examBlock.update({ where: { id: blockId }, data: { code } });
}
