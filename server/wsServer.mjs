/**
 * WebSocket Server — Real-time Messaging for AUSTWise
 *
 * Message protocol (JSON):
 *   { type: 'message',      payload: { fromId, toId, text, id, timestamp } }
 *   { type: 'typing',       payload: { fromId, toId, isTyping } }
 *   { type: 'read',         payload: { fromId, peerId } }
 *   { type: 'online',       payload: { userId, online } }
 *   { type: 'subscribe',    payload: { userId, conversationId } }
 *   { type: 'unsubscribe',  payload: { conversationId } }
 *   { type: 'conversations', payload: { userId } }  // request full refresh
 */

import { WebSocketServer } from 'ws';

// Map: userId -> Set<WebSocket>
const userClients = new Map();
// Map: conversationId -> Set<userId>
const conversationSubscribers = new Map();
// Map: userId -> Set<conversationId>
const userSubscriptions = new Map();

export function createWSServer(httpServer) {
  const wss = new WebSocketServer({ server: httpServer });

  wss.on('connection', (ws, req) => {
    let currentUserId = null;

    // Send a confirmation that connection is established
    sendTo(ws, { type: 'connected', payload: { serverTime: Date.now() } });

    /** Register the user ID for this connection */
    function setUserId(userId) {
      if (!userId) return false;
      const prevId = currentUserId;
      currentUserId = userId;

      // Remove from old user mapping
      if (prevId && prevId !== userId) {
        const clients = userClients.get(prevId);
        if (clients) clients.delete(ws);
        if (clients && clients.size === 0) {
          userClients.delete(prevId);
          broadcastOnlineStatus(prevId, false);
        }
      }

      // Add to new user mapping
      if (!userClients.has(userId)) {
        userClients.set(userId, new Set());
      }
      userClients.get(userId).add(ws);

      // Broadcast online status
      broadcastOnlineStatus(userId, true);

      // Send current user info back
      sendTo(ws, { type: 'user-registered', payload: { userId } });

      // Notify user about all currently online users
      const onlineUsers = [];
      for (const [uid] of userClients) {
        if (uid) onlineUsers.push(uid);
      }
      sendTo(ws, { type: 'online-users', payload: { userIds: onlineUsers } });
      return true;
    }

    ws.on('message', (raw) => {
      try {
        const { type, payload } = JSON.parse(raw.toString());
        if (!type || !payload) return;

        switch (type) {
          case 'subscribe':
            handleSubscribe(payload);
            break;

          case 'unsubscribe':
            handleUnsubscribe(payload);
            break;

          case 'message':
            handleMessage(payload);
            break;

          case 'typing':
            handleTyping(payload);
            break;

          case 'read':
            handleRead(payload);
            break;

          case 'reaction':
            handleReaction(payload);
            break;

          case 'delete-message':
            handleDelete(payload);
            break;

          case 'edit-message':
            handleEdit(payload);
            break;

          case 'ping':
            // Keep-alive, no response needed
            break;

          default:
            sendTo(ws, { type: 'error', payload: { message: `Unknown message type: ${type}` } });
        }
      } catch (err) {
        sendTo(ws, { type: 'error', payload: { message: 'Invalid message format' } });
      }
    });

    ws.on('close', () => {
      if (currentUserId) {
        broadcastOnlineStatus(currentUserId, false);
        cleanupUser(currentUserId);
      }
    });

    ws.on('error', () => {
      if (currentUserId) {
        broadcastOnlineStatus(currentUserId, false);
        cleanupUser(currentUserId);
      }
    });

    /* ─── Message Handlers ─── */

    function handleSubscribe(payload) {
      const { userId, conversationId } = payload;
      const targetUserId = userId || currentUserId;

      if (!targetUserId) {
        sendTo(ws, { type: 'error', payload: { message: 'userId is required for subscribe' } });
        return;
      }

      // Register user on this connection if not already done
      if (!currentUserId || currentUserId !== targetUserId) {
        setUserId(targetUserId);
      } else if (!userClients.has(targetUserId) || !userClients.get(targetUserId).has(ws)) {
        // Ensure this ws is in the user's client set
        if (!userClients.has(targetUserId)) {
          userClients.set(targetUserId, new Set());
        }
        userClients.get(targetUserId).add(ws);
      }

      // Subscribe to conversation if provided
      if (conversationId) {
        if (!conversationSubscribers.has(conversationId)) {
          conversationSubscribers.set(conversationId, new Set());
        }
        conversationSubscribers.get(conversationId).add(targetUserId);

        if (!userSubscriptions.has(targetUserId)) {
          userSubscriptions.set(targetUserId, new Set());
        }
        userSubscriptions.get(targetUserId).add(conversationId);

        sendTo(ws, { type: 'subscribed', payload: { conversationId } });
      }
    }

    function handleUnsubscribe(payload) {
      const { conversationId } = payload;
      if (!currentUserId || !conversationId) return;

      const subscribers = conversationSubscribers.get(conversationId);
      if (subscribers) {
        subscribers.delete(currentUserId);
        if (subscribers.size === 0) conversationSubscribers.delete(conversationId);
      }

      const subs = userSubscriptions.get(currentUserId);
      if (subs) {
        subs.delete(conversationId);
        if (subs.size === 0) userSubscriptions.delete(currentUserId);
      }
    }

    function handleMessage(payload) {
      const { fromId, toId, text, id, timestamp } = payload;

      if (!fromId || !toId || !text || !id) {
        sendTo(ws, { type: 'error', payload: { message: 'fromId, toId, text, and id are required' } });
        return;
      }

      const messageData = {
        type: 'message',
        payload: { fromId, toId, text, id, timestamp: timestamp || new Date().toISOString() },
      };

      // Relay to recipient
      broadcastToUser(toId, messageData);

      // Also send back to sender to confirm delivery
      broadcastToUser(fromId, {
        type: 'message-status',
        payload: { messageId: id, status: 'delivered', timestamp: new Date().toISOString() },
      });
    }

    function handleTyping(payload) {
      const { toId, isTyping } = payload;
      if (!currentUserId || !toId) return;

      broadcastToUser(toId, {
        type: 'typing',
        payload: { fromId: currentUserId, isTyping },
      });
    }

    function handleRead(payload) {
      const { peerId, conversationId } = payload;
      if (!currentUserId || !peerId) return;

      broadcastToUser(peerId, {
        type: 'read',
        payload: { fromId: currentUserId, conversationId },
      });
    }

    function handleReaction(payload) {
      const { messageId, emoji, userId, conversationId } = payload;
      if (!messageId || !emoji || !userId || !conversationId) return;

      // Forward reaction to all other participants in the conversation
      const [userA, userB] = conversationId.split('|');
      const peerId = userA === userId ? userB : userA;

      broadcastToUser(peerId, {
        type: 'reaction',
        payload: { messageId, emoji, userId, conversationId },
      });
    }

    function handleDelete(payload) {
      const { messageId, userId, conversationId } = payload;
      if (!messageId || !userId || !conversationId) return;

      const [userA, userB] = conversationId.split('|');
      const peerId = userA === userId ? userB : userA;

      broadcastToUser(peerId, {
        type: 'delete-message',
        payload: { messageId, userId, conversationId },
      });
    }

    function handleEdit(payload) {
      const { messageId, text, userId, conversationId } = payload;
      if (!messageId || !text || !userId || !conversationId) return;

      const [userA, userB] = conversationId.split('|');
      const peerId = userA === userId ? userB : userA;

      broadcastToUser(peerId, {
        type: 'edit-message',
        payload: { messageId, text, userId, conversationId },
      });
    }
  });

  console.log('🔌 WebSocket server initialized');
  return wss;
}

/* ─── Internal Helpers ─── */

function sendTo(ws, data) {
  try {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(data));
    }
  } catch {
    // connection might be closed
  }
}

function broadcastToUser(userId, data) {
  const clients = userClients.get(userId);
  if (!clients) return;
  for (const ws of clients) {
    sendTo(ws, data);
  }
}

function broadcastOnlineStatus(userId, online) {
  const data = { type: 'online', payload: { userId, online } };
  for (const [uid, clients] of userClients) {
    if (uid && uid !== userId) {
      for (const ws of clients) {
        sendTo(ws, data);
      }
    }
  }
}

function cleanupUser(userId) {
  userClients.delete(userId);
  const subs = userSubscriptions.get(userId);
  if (subs) {
    for (const convId of subs) {
      const subscribers = conversationSubscribers.get(convId);
      if (subscribers) {
        subscribers.delete(userId);
        if (subscribers.size === 0) conversationSubscribers.delete(convId);
      }
    }
  }
  userSubscriptions.delete(userId);
}
