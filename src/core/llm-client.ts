import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import type { ModelRef, ToolDefinition } from '../types/test.types.js';

export interface ChatOptions {
  tools?: ToolDefinition[];
}

export interface LlmClient {
  chat(system: string, user: string, options?: ChatOptions): Promise<string>;
}

function serializeToolCall(name: string, input: unknown): string {
  return `\n[Tool Call: ${name}]\nInput: ${JSON.stringify(input)}\n`;
}

function createAnthropicClient(model: string, apiKey: string): LlmClient {
  const client = new Anthropic({ apiKey });

  return {
    async chat(system: string, user: string, options?: ChatOptions): Promise<string> {
      const tools = options?.tools?.map((t) => ({
        name: t.name,
        description: t.description ?? '',
        input_schema: {
          type: 'object' as const,
          ...t.input_schema,
        },
      }));

      const response = await client.messages.create({
        model,
        max_tokens: 4096,
        system,
        messages: [{ role: 'user', content: user }],
        ...(tools && tools.length > 0 ? { tools } : {}),
      });

      // Serialize all content blocks — text + tool calls
      const parts: string[] = [];
      for (const block of response.content) {
        if (block.type === 'text') {
          parts.push(block.text);
        } else if (block.type === 'tool_use') {
          parts.push(serializeToolCall(block.name, block.input));
        }
      }

      const result = parts.join('\n');
      if (!result) {
        throw new Error('Empty response from Anthropic');
      }
      return result;
    },
  };
}

function createOpenAIClient(model: string, apiKey: string): LlmClient {
  const client = new OpenAI({ apiKey });

  return {
    async chat(system: string, user: string, options?: ChatOptions): Promise<string> {
      const tools = options?.tools?.map((t) => ({
        type: 'function' as const,
        function: {
          name: t.name,
          description: t.description ?? '',
          parameters: t.input_schema,
        },
      }));

      const response = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        ...(tools && tools.length > 0 ? { tools } : {}),
      });

      const message = response.choices[0]?.message;
      if (!message) {
        throw new Error('Empty response from OpenAI');
      }

      // Serialize text + tool calls
      const parts: string[] = [];
      if (message.content) {
        parts.push(message.content);
      }
      if (message.tool_calls) {
        for (const call of message.tool_calls) {
          if (call.type !== 'function' || !('function' in call)) continue;
          const fn = call.function as { name: string; arguments: string };
          const input = fn.arguments
            ? JSON.parse(fn.arguments)
            : {};
          parts.push(serializeToolCall(fn.name, input));
        }
      }

      const result = parts.join('\n');
      if (!result) {
        throw new Error('Empty response from OpenAI');
      }
      return result;
    },
  };
}

export function createClient(ref: ModelRef, apiKey: string): LlmClient {
  switch (ref.provider) {
    case 'anthropic':
      return createAnthropicClient(ref.model, apiKey);
    case 'openai':
      return createOpenAIClient(ref.model, apiKey);
    default:
      throw new Error(`Unknown provider: ${ref.provider}`);
  }
}
