import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { readJson, writeJson } from '@/backend/src/utils/storage';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-lumina-key-2026';

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; username: string; isAdmin: boolean; studentId: string };
  } catch {
    return null;
  }
}

const detectSubject = (text: string): string => {
  const lower = text.toLowerCase();
  if (lower.includes('math') || lower.includes('mathematics')) return 'Math';
  if (lower.includes('physics')) return 'Physics';
  if (lower.includes('chemistry')) return 'Chemistry';
  if (lower.includes('biology') || lower.includes('bio')) return 'Biology';
  if (lower.includes('english')) return 'English';
  if (lower.includes('hindi')) return 'Hindi';
  if (lower.includes('reasoning')) return 'Reasoning';
  if (lower.includes('current affairs')) return 'Current Affairs';
  return 'General';
};

const parseBatchText = (text: string): any[] => {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const subjectsMap: Record<string, any> = {};

  let currentSubjectName = 'General';
  let currentChapterName = 'Default Chapter';

  const urlRegex = /(https?:\/\/[^\s]+)/g;

  for (const line of lines) {
    // Try to detect subject
    const detectedSub = detectSubject(line);
    if (detectedSub !== 'General') {
      currentSubjectName = detectedSub;
    }

    // Try to detect chapter
    const chapterMatch = line.match(/(Class \d+|Lecture \d+|Chapter \d+|Part \d+|Class-\d+|L-\d+)/i);
    if (chapterMatch) {
      currentChapterName = chapterMatch[0];
    }

    const urls = line.match(urlRegex);
    if (urls) {
      if (!subjectsMap[currentSubjectName]) {
        subjectsMap[currentSubjectName] = { name: currentSubjectName, chapters: [] };
      }

      let chapter = subjectsMap[currentSubjectName].chapters.find((c: any) => c.name === currentChapterName);
      if (!chapter) {
        chapter = { name: currentChapterName, items: [] };
        subjectsMap[currentSubjectName].chapters.push(chapter);
      }

      urls.forEach(url => {
        const lowerLine = line.toLowerCase();
        let type: 'video' | 'pdf' | 'notes' = 'video';
        if (url.toLowerCase().endsWith('.pdf') || lowerLine.includes('pdf')) {
          type = 'pdf';
        } else if (lowerLine.includes('notes') || lowerLine.includes('material')) {
          type = 'notes';
        }
        
        const title = line.replace(url, '').trim() || `${currentChapterName} - Item ${chapter!.items.length + 1}`;
        chapter!.items.push({ title, url, type });
      });
    }
  }

  // Fallback: If no subjects were created but there is text, try to find any URLs
  if (Object.keys(subjectsMap).length === 0) {
    const allUrls = text.match(urlRegex);
    if (allUrls) {
      subjectsMap['General'] = {
        name: 'General',
        chapters: [{
          name: 'All Materials',
          items: allUrls.map((url, i) => ({
            title: `Material ${i + 1}`,
            url,
            type: url.toLowerCase().endsWith('.pdf') ? 'pdf' : 'video'
          }))
        }]
      };
    }
  }

  return Object.values(subjectsMap);
};

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const batches = await readJson<any>('batches.json');
  // Every user sees only their own batches in the main dashboard
  const userBatches = batches.filter((b: any) => b.userId === user.id);
  return NextResponse.json(userBatches);
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const { title, content } = await request.json();
    if (!title || !content) return NextResponse.json({ message: 'Title and content are required' }, { status: 400 });

    const subjects = parseBatchText(content);
    const batches = await readJson<any>('batches.json');

    const newBatch = {
      id: uuidv4(),
      userId: user.id,
      studentId: user.studentId,
      title,
      subjects,
      rawContent: content,
      createdAt: new Date().toISOString()
    };

    batches.push(newBatch);
    await writeJson('batches.json', batches);

    return NextResponse.json(newBatch, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
