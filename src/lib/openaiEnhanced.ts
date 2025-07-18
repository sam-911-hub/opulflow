import { retry } from './errorHandling';

// Enhanced OpenAI integration with more features

export interface OpenAIRequestOptions {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  user?: string;
  functions?: any[];
  functionCall?: string | { name: string };
}

export interface OpenAIResponse {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  functionCall?: {
    name: string;
    arguments: string;
  };
}

export interface OpenAICompletionOptions {
  type: 'completion' | 'chat';
  messages?: Array<{
    role: 'system' | 'user' | 'assistant' | 'function';
    content: string;
    name?: string;
  }>;
  prompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  functions?: any[];
  functionCall?: string | { name: string };
}

/**
 * Generate text using OpenAI API with enhanced features
 */
export async function generateEnhancedText(options: OpenAIRequestOptions): Promise<OpenAIResponse> {
  const { 
    prompt, 
    model = 'gpt-4', 
    temperature = 0.7, 
    maxTokens = 1000,
    systemPrompt = 'You are a helpful assistant.',
    user,
    functions,
    functionCall
  } = options;
  
  // Check if OpenAI API key is configured
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }
  
  try {
    // Prepare messages for chat completion
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: prompt
      }
    ];
    
    // Add user identifier if provided
    if (user) {
      messages[1].name = user;
    }
    
    // Prepare request body
    const requestBody: any = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens
    };
    
    // Add functions if provided
    if (functions && functions.length > 0) {
      requestBody.functions = functions;
      
      if (functionCall) {
        requestBody.function_call = functionCall;
      }
    }
    
    // Make API call with retry logic
    const response = await retry(async () => {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || 'OpenAI API error');
      }
      
      return res.json();
    });
    
    // Extract response text
    const responseMessage = response.choices[0].message;
    const responseText = responseMessage.content || '';
    
    // Check for function call
    let functionCallData;
    if (responseMessage.function_call) {
      functionCallData = {
        name: responseMessage.function_call.name,
        arguments: responseMessage.function_call.arguments
      };
    }
    
    return {
      text: responseText,
      usage: {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens
      },
      functionCall: functionCallData
    };
    
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error(`Failed to generate text with OpenAI: ${error.message}`);
  }
}

/**
 * Generate content for specific use cases
 */
export async function generateContent(type: 'email' | 'call-script' | 'social-post', options: {
  topic: string;
  tone?: 'professional' | 'casual' | 'persuasive';
  length?: 'short' | 'medium' | 'long';
  recipient?: string;
  context?: string;
}): Promise<string> {
  const { topic, tone = 'professional', length = 'medium', recipient, context } = options;
  
  // Create system prompt based on content type
  let systemPrompt = '';
  let userPrompt = '';
  
  switch (type) {
    case 'email':
      systemPrompt = `You are an expert email copywriter. Write ${tone} emails that are ${length} in length.`;
      userPrompt = `Write an email about "${topic}"${recipient ? ` to ${recipient}` : ''}${context ? `. Context: ${context}` : ''}.`;
      break;
    case 'call-script':
      systemPrompt = `You are an expert sales call script writer. Write ${tone} call scripts that are ${length} in length.`;
      userPrompt = `Write a call script about "${topic}"${context ? `. Context: ${context}` : ''}.`;
      break;
    case 'social-post':
      systemPrompt = `You are an expert social media copywriter. Write ${tone} posts that are ${length} in length.`;
      userPrompt = `Write a social media post about "${topic}"${context ? `. Context: ${context}` : ''}.`;
      break;
  }
  
  // Generate content
  const response = await generateEnhancedText({
    prompt: userPrompt,
    systemPrompt,
    temperature: tone === 'professional' ? 0.5 : 0.7
  });
  
  return response.text;
}