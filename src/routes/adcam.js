const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { USERS } = require('../data');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// GET /quota - Check usage
router.get('/quota', authenticateToken, (req, res) => {
  const user = USERS.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  
  res.json({ 
    scan_count: user.scan_count || 0,
    limit: 5,
    is_elite: user.is_elite || false 
  });
});

// POST /analyze - Generate Ad Copy
router.post('/analyze', authenticateToken, async (req, res) => {
  try {
    const user = USERS.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check Quota
    const currentCount = user.scan_count || 0;
    if (currentCount >= 5 && !user.is_elite) {
      return res.status(403).json({ 
        message: 'Quota exceeded. Please upgrade.',
        code: 'QUOTA_EXCEEDED' 
      });
    }

    const { image } = req.body; // Base64 string
    if (!image) {
      return res.status(400).json({ message: 'Image is required' });
    }

    // Call OpenAI
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

    const result = JSON.parse(response.choices[0].message.content);

    // Increment Quota
    user.scan_count = currentCount + 1;

    res.json({ 
      result, 
      scan_count: user.scan_count 
    });

  } catch (error) {
    console.error('AdCam Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
