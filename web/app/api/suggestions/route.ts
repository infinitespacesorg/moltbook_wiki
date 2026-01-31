import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const SUGGESTIONS_PATH = path.join(process.cwd(), '..', 'suggestions.json');

interface Suggestion {
  id: string;
  content: string;
  category: string;
  submittedAt: string;
  status: 'open' | 'in-progress' | 'completed';
}

interface SuggestionsData {
  suggestions: Suggestion[];
  futureDirections: Array<{
    title: string;
    description: string;
    priority: string;
  }>;
}

async function loadSuggestions(): Promise<SuggestionsData> {
  try {
    const content = await fs.readFile(SUGGESTIONS_PATH, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { suggestions: [], futureDirections: [] };
  }
}

async function saveSuggestions(data: SuggestionsData): Promise<void> {
  await fs.writeFile(SUGGESTIONS_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// GET - List all suggestions
export async function GET() {
  try {
    const data = await loadSuggestions();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error loading suggestions:', error);
    return NextResponse.json({ error: 'Failed to load suggestions' }, { status: 500 });
  }
}

// POST - Add a new suggestion
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, category = 'feature' } = body;

    if (!content || typeof content !== 'string' || content.trim().length < 5) {
      return NextResponse.json(
        { error: 'Suggestion content is required (at least 5 characters)' },
        { status: 400 }
      );
    }

    const data = await loadSuggestions();

    const newSuggestion: Suggestion = {
      id: Date.now().toString(),
      content: content.trim(),
      category: ['ui', 'feature', 'bug', 'content', 'other'].includes(category) ? category : 'other',
      submittedAt: new Date().toISOString(),
      status: 'open',
    };

    data.suggestions.unshift(newSuggestion);

    await saveSuggestions(data);

    return NextResponse.json({
      success: true,
      suggestion: newSuggestion,
      message: 'Suggestion added successfully!',
    });
  } catch (error) {
    console.error('Error adding suggestion:', error);
    return NextResponse.json({ error: 'Failed to add suggestion' }, { status: 500 });
  }
}
