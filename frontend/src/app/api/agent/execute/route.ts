import { NextRequest } from 'next/server';
import { getServiceAccessByToken, getAgentSystemPrompt, addMessageToTask, getAgentTaskById, getAgentTasksByUser, createAgentTask, getListingById } from '@/data/store';

const NVIDIA_API_BASE = 'https://integrate.api.nvidia.com/v1';
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_MODEL = process.env.NVIDIA_MODEL || 'meta/llama-3.1-405b-instruct';

export async function POST(req: NextRequest) {
  try {
    const { accessToken, message, taskId, listingId, userId } = await req.json();

    if (!accessToken || !message) {
      return new Response(JSON.stringify({ error: 'Missing accessToken or message' }), { status: 400 });
    }

    const access = getServiceAccessByToken(accessToken);
    if (!access) {
      return new Response(JSON.stringify({ error: 'Invalid or expired access token' }), { status: 401 });
    }

    const listing = getListingById(access.listingId);
    const systemPrompt = getAgentSystemPrompt(listing?.category || '');

    let task = taskId ? getAgentTaskById(taskId) : undefined;

    if (!task) {
      task = createAgentTask(access.id, userId || access.buyerUserId, access.listingId);
    }

    addMessageToTask(task.id, { role: 'user', content: message, timestamp: new Date().toISOString() });

    const conversationHistory = task.messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-20)
    ];

    if (!NVIDIA_API_KEY) {
      const demoResponse = `[Demo Mode - No NVIDIA API Key]\n\nYou asked: "${message}"\n\nThis is a demo response from the ${listing?.title || 'agent'}. In production, this would use NVIDIA's LLM to generate a real response.\n\nTo enable real AI responses, set the NVIDIA_API_KEY environment variable.`;
      addMessageToTask(task.id, { role: 'assistant', content: demoResponse, timestamp: new Date().toISOString() });
      return new Response(JSON.stringify({ response: demoResponse, taskId: task.id }));
    }

    const response = await fetch(`${NVIDIA_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: NVIDIA_MODEL,
        messages,
        max_tokens: 2048,
        temperature: 0.7,
        stream: true,
      })
    });

    if (!response.ok) {
      const err = await response.text();
      addMessageToTask(task.id, { role: 'assistant', content: `Error: Failed to get AI response. Status: ${response.status}`, timestamp: new Date().toISOString() });
      return new Response(JSON.stringify({ error: 'AI service unavailable', details: err }), { status: 502 });
    }

    const encoder = new TextEncoder();
    let fullResponse = '';

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data: ')) continue;
              const data = trimmed.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  fullResponse += content;
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                }
              } catch {}
            }
          }

          addMessageToTask(task.id, { role: 'assistant', content: fullResponse, timestamp: new Date().toISOString() });
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, taskId: task.id })}\n\n`));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const taskId = searchParams.get('taskId');

  if (taskId) {
    const task = getAgentTaskById(taskId);
    if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ task });
  }

  if (userId) {
    const tasks = getAgentTasksByUser(userId);
    return NextResponse.json({ tasks });
  }

  return NextResponse.json({ error: 'Missing userId or taskId' }, { status: 400 });
}

import { NextResponse } from 'next/server';
