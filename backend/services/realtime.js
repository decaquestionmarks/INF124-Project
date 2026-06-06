const { WebSocketServer, WebSocket } = require('ws');
const { verifyIdToken } = require('./auth');

const clientsByUser = new Map();
const DEFAULT_MEMBER_ID = 'self';

const getUserId = (decodedToken = {}) => {
  return decodedToken.uid || decodedToken.sub || decodedToken.user_id || String(decodedToken.email || '');
};

const addClient = (uid, date, memberId, ws) => {
  if (!clientsByUser.has(uid)) {
    clientsByUser.set(uid, new Set());
  }

  const client = { uid, date, memberId, ws };
  clientsByUser.get(uid).add(client);

  ws.on('close', () => {
    const clients = clientsByUser.get(uid);
    if (!clients) return;

    clients.delete(client);
    if (clients.size === 0) {
      clientsByUser.delete(uid);
    }
  });

  return client;
};

const sendJson = (ws, payload) => {
  if (ws.readyState !== WebSocket.OPEN) return;
  ws.send(JSON.stringify(payload));
};

const broadcastGoalUpdate = (uid, date, memberId = DEFAULT_MEMBER_ID, payload) => {
  const clients = clientsByUser.get(uid);
  if (!clients) return;

  clients.forEach((client) => {
    if (client.date !== date) return;
    if (client.memberId !== memberId) return;

    sendJson(client.ws, {
      type: 'goal:update',
      payload,
    });
  });
};

const setupRealtime = (server) => {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', async (request, socket, head) => {
    const url = new URL(request.url, 'http://localhost');

    if (url.pathname !== '/users/me/goal/live') {
      socket.destroy();
      return;
    }

    const token = url.searchParams.get('token');
    const date = url.searchParams.get('date');
    const memberId = url.searchParams.get('memberId') || DEFAULT_MEMBER_ID;

    if (!token || !date) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    try {
      const decodedToken = await verifyIdToken(token);
      const uid = getUserId(decodedToken);

      if (!uid) {
        throw new Error('Unable to identify user');
      }

      wss.handleUpgrade(request, socket, head, (ws) => {
        addClient(uid, date, memberId, ws);
        sendJson(ws, { type: 'goal:subscribed', payload: { date, memberId } });
      });
    } catch (error) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
    }
  });

  return wss;
};

module.exports = {
  broadcastGoalUpdate,
  setupRealtime,
};
