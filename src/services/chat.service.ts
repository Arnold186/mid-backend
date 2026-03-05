import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getMessagesByRoom = async (room: string) => {
  return await prisma.chatMessage.findMany({
    where: { room },
    orderBy: { timestamp: 'asc' },
  });
};

export const createMessage = async (input: {
  room: string;
  senderId: string;
  senderName: string;
  senderRole: 'ADMIN' | 'TEACHER' | 'STUDENT';
  message: string;
  timestamp?: Date;
}) => {
  return await prisma.chatMessage.create({
    data: {
      room: input.room,
      senderId: input.senderId,
      senderName: input.senderName,
      senderRole: input.senderRole,
      message: input.message,
      timestamp: input.timestamp ?? new Date(),
    },
  });
};
