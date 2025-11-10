import { Router } from 'express';
import { ChannelModel } from '../models/Channel';
import { MessageModel } from '../models/Message';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all channels
router.get('/', authenticate, async (req, res) => {
  try {
    const channels = await ChannelModel.getAll();
    res.json({ channels });
  } catch (error) {
    console.error('Get channels error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create channel
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, type } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Missing name or type' });
    }

    const channel = await ChannelModel.create(name, type, req.userId!);
    res.status(201).json({ channel });
  } catch (error) {
    console.error('Create channel error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get channel messages
router.get('/:channelId/messages', authenticate, async (req, res) => {
  try {
    const channelId = parseInt(req.params.channelId);
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const messages = await MessageModel.getChannelMessages(channelId, limit, offset);
    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete channel
router.delete('/:channelId', authenticate, async (req, res) => {
  try {
    const channelId = parseInt(req.params.channelId);
    const deleted = await ChannelModel.delete(channelId);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    res.json({ message: 'Channel deleted successfully' });
  } catch (error) {
    console.error('Delete channel error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
