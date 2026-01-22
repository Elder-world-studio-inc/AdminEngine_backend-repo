const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const db = require('../db');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// GET /quota - Check usage
router.get('/quota', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('SELECT scan_count, is_elite FROM users WHERE id = $1', [req.user.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];
    
    res.json({ 
      scan_count: user.scan_count || 0,
      limit: 5,
      is_elite: user.is_elite || false 
    });
  } catch (error) {
    console.error('Quota Error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /analyze (Legacy) & POST /v1/ad-scans (New Standard)
const handleAnalyze = async (req, res) => {
  try {
    // 1. Get User Data
    const userResult = await db.query('SELECT scan_count, is_elite FROM users WHERE id = $1', [req.user.id]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];

    // 2. Check Quota
    const currentCount = user.scan_count || 0;
    if (currentCount >= 5 && !user.is_elite) {
      return res.status(403).json({ 
        message: 'Upgrade to Pro', // Exact message from requirements
        code: 'QUOTA_EXCEEDED' 
      });
    }

    const { image } = req.body; // Base64 string
    if (!image) {
      return res.status(400).json({ message: 'Image is required' });
    }

    // 3. Call OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this product image and generate marketing copy. Return a JSON object with: 1. 'meta': array of 3 objects {headline, body}. 2. 'tiktok': array of 2 scripts (string). 3. 'google': array of 3 headlines (string). Keep it punchy and high-converting." },
            {
              type: "image_url",
              image_url: {
                "url": image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const aiResult = JSON.parse(response.choices[0].message.content);

    // 4. Update Database (Transaction)
    const client = await db.pool ? await db.pool.connect() : { query: db.query, release: () => {} }; // Handle pool vs single query
    
    try {
      // If we had a transaction block, we would start it here. 
      // For simplicity, we run sequential queries.
      
      // Insert Record
      await db.query(
        'INSERT INTO ad_scans (user_id, image_data, result) VALUES ($1, $2, $3)',
        [req.user.id, 'image_data_placeholder', aiResult] // Don't store full base64 to save DB space unless necessary
      );

      // Increment Count
      const updateResult = await db.query(
        'UPDATE users SET scan_count = scan_count + 1 WHERE id = $1 RETURNING scan_count',
        [req.user.id]
      );

      res.json({ 
        result: aiResult, 
        scan_count: updateResult.rows[0].scan_count 
      });

    } catch (dbError) {
      console.error('DB Transaction Error:', dbError);
      throw dbError;
    } 

  } catch (error) {
    console.error('AdCam Error:', error);
    res.status(500).json({ error: error.message });
  }
};

router.post('/analyze', authenticateToken, handleAnalyze);
router.post('/v1/ad-scans', authenticateToken, handleAnalyze);

module.exports = router;
