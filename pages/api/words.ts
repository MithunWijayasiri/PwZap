import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchRandomWords } from '../../services/wordService';

type ResponseData = {
  words: string[];
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ words: [], error: 'Method not allowed' });
  }

  const count = parseInt(req.query.count as string) || 4;
  const blockedWordsParam = req.query.blockedWords as string;
  
  // Parse blocked words from query parameter if provided
  let blockedWords: string[] = [];
  try {
    if (blockedWordsParam) {
      blockedWords = JSON.parse(atob(blockedWordsParam));
    }
  } catch (error) {
    console.error('Error parsing blocked words:', error);
  }

  try {
    const words = await fetchRandomWords(count, blockedWords);
    res.status(200).json({ words });
  } catch (error) {
    console.error('Error fetching random words:', error);
    res.status(500).json({ words: [], error: 'Failed to fetch words' });
  }
}