import { Request, Response } from 'express';
import { getMessagesByRoom } from '../services/chat.service';

export const fetchMessages = async (req: Request, res: Response) => {
  try {
    const { room } = req.params;
    const messages = await getMessagesByRoom(room);
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};
