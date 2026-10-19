const http = require('http');
const url = require('url');
const db_opt = require('./db.js');

const port = process.env.PORT || 8855;

function parseJsonBody(req, maxBytes = 1048576) {
    return new Promise((resolve, reject) => {
        let size = 0;
        const chunks = [];
        req.on('data', chunk => {
            size += chunk.length;
            if (size > maxBytes) {
                reject(new Error('Payload too large'));
                req.destroy();
                return;
            }
            chunks.push(chunk);
        });
        req.on('end', () => {
            try {
                const bodyStr = Buffer.concat(chunks).toString('utf8');
                const parsed = bodyStr ? JSON.parse(bodyStr) : {};
                resolve(parsed);
            } catch (err) {
                reject(new Error('Invalid JSON format'));
            }
        });
        req.on('error', reject);
    });
}

function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
    // 跨域预检
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400'
        });
        return res.end();
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    try {
        if (req.method === 'GET' && pathname === '/getRemark') {
            const { token, username } = parsedUrl.query;
            if (!token || !username) {
                return sendJson(res, 400, { success: false, error: 'Missing token or username' });
            }
            const doc = await db_opt.getRemark(token, username);
            return sendJson(res, 200, {
                success: true,
                data: doc && doc.remark ? doc.remark : 'no remark'
            });
        }

        if (req.method === 'GET' && pathname === '/getAllRemarks') {
            const { token } = parsedUrl.query;
            if (!token) {
                return sendJson(res, 400, { success: false, error: 'Missing token' });
            }
            const list = await db_opt.getAllRemarks(token);
            const dict = {};
            list.forEach(item => {
                if (item.username && item.remark) {
                    dict[item.username] = item.remark;
                }
            });
            return sendJson(res, 200, { success: true, data: dict });
        }

        if (req.method === 'POST' && pathname === '/updateRemark') {
            const body = await parseJsonBody(req);
            const { token, username, remark } = body;
            if (!token || !username) {
                return sendJson(res, 400, { success: false, error: 'Missing token or username' });
            }
            await db_opt.updateRemark(token, username, remark);
            return sendJson(res, 200, { success: true });
        }

        sendJson(res, 404, { success: false, error: 'Not Found' });
    } catch (err) {
        console.error('Server error:', err);
        sendJson(res, 500, { success: false, error: err.message || 'Internal server error' });
    }
});

server.listen(port, () => {
    console.log(`[GithubRemark Server] running on http://127.0.0.1:${port}`);
});
