import OpenAI from 'openai';

export interface SentimentAnalysisResult {
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number; // 0-1 (0=very negative, 0.5=neutral, 1=very positive)
  summary: string;
  keyThemes: string[];
  strengthsIdentified: string[];
  areasForImprovementIdentified: string[];
  recommendations: string[];
  tone: 'constructive' | 'harsh' | 'encouraging' | 'neutral';
  confidence: number; // 0-1
}

export interface ReviewContext {
  employeeName: string;
  position: string;
  reviewType: string;
  overallRating: number | null;
  ratings: Array<{
    categoryName: string;
    rating: number;
    comments: string | null;
  }>;
  strengths: string | null;
  areasForImprovement: string | null;
  achievements: string | null;
  reviewerComments: string | null;
  employeeComments: string | null;
}

/**
 * AI Sentiment Analyzer
 * Analyzes performance review feedback for sentiment and insights
 */
export class AISentimentAnalyzer {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Analyze sentiment of performance review
   */
  async analyzeReview(context: ReviewContext): Promise<SentimentAnalysisResult> {
    try {
      const systemPrompt = `You are an AI HR sentiment analyzer specializing in performance review analysis.
Your role is to analyze performance review feedback and provide insights about sentiment, tone, and key themes.

Consider:
- Overall sentiment (positive, neutral, negative)
- Constructiveness of feedback
- Balance between praise and criticism
- Actionability of improvement suggestions
- Cultural sensitivity (Indonesian workplace context)
- Potential bias or unfairness

Respond in JSON format:
{
  "sentiment": "positive|neutral|negative",
  "sentimentScore": number (0-1),
  "summary": "brief summary of the review",
  "keyThemes": ["theme1", "theme2"],
  "strengthsIdentified": ["strength1", "strength2"],
  "areasForImprovementIdentified": ["area1", "area2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "tone": "constructive|harsh|encouraging|neutral",
  "confidence": number (0-1)
}`;

      const userPrompt = this.buildPrompt(context);

      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0]?.message?.content ?? '{}');

      return {
        sentiment: result.sentiment ?? 'neutral',
        sentimentScore: result.sentimentScore ?? 0.5,
        summary: result.summary ?? 'Review analyzed',
        keyThemes: result.keyThemes ?? [],
        strengthsIdentified: result.strengthsIdentified ?? [],
        areasForImprovementIdentified: result.areasForImprovementIdentified ?? [],
        recommendations: result.recommendations ?? [],
        tone: result.tone ?? 'neutral',
        confidence: result.confidence ?? 0.8,
      };
    } catch (error) {
      console.error('Sentiment analysis failed:', error);

      // Fallback to basic sentiment based on rating
      return this.basicSentimentAnalysis(context);
    }
  }

  /**
   * Analyze employee comments for concerns
   */
  async analyzeEmployeeComments(comments: string): Promise<{
    hasConcerns: boolean;
    concernLevel: 'low' | 'medium' | 'high';
    concerns: string[];
    suggestions: string[];
  }> {
    try {
      const systemPrompt = `You are an AI HR assistant analyzing employee feedback on performance reviews.
Identify any concerns, disagreements, or issues the employee has raised.

Respond in JSON format:
{
  "hasConcerns": boolean,
  "concernLevel": "low|medium|high",
  "concerns": ["concern1", "concern2"],
  "suggestions": ["suggestion1", "suggestion2"]
}`;

      const userPrompt = `Employee Comments:\n${comments}\n\nAnalyze for concerns and issues.`;

      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0]?.message?.content ?? '{}');

      return {
        hasConcerns: result.hasConcerns ?? false,
        concernLevel: result.concernLevel ?? 'low',
        concerns: result.concerns ?? [],
        suggestions: result.suggestions ?? [],
      };
    } catch (error) {
      console.error('Employee comments analysis failed:', error);
      return {
        hasConcerns: false,
        concernLevel: 'low',
        concerns: [],
        suggestions: [],
      };
    }
  }

  /**
   * Detect potential bias in review
   */
  async detectBias(context: ReviewContext): Promise<{
    hasPotentialBias: boolean;
    biasType: string | null;
    confidence: number;
    explanation: string;
  }> {
    try {
      const systemPrompt = `You are an AI bias detection expert for HR performance reviews.
Identify potential bias in performance reviews such as:
- Gender bias
- Age bias
- Recency bias
- Halo/horn effect
- Cultural bias
- Vague or subjective feedback without examples

Respond in JSON format:
{
  "hasPotentialBias": boolean,
  "biasType": "type of bias or null",
  "confidence": number (0-1),
  "explanation": "explanation"
}`;

      const userPrompt = this.buildPrompt(context);

      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      });

      const result = JSON.parse(response.choices[0]?.message?.content ?? '{}');

      return {
        hasPotentialBias: result.hasPotentialBias ?? false,
        biasType: result.biasType ?? null,
        confidence: result.confidence ?? 0.5,
        explanation: result.explanation ?? 'No bias detected',
      };
    } catch (error) {
      console.error('Bias detection failed:', error);
      return {
        hasPotentialBias: false,
        biasType: null,
        confidence: 0.5,
        explanation: 'Bias detection unavailable',
      };
    }
  }

  /**
   * Generate improvement suggestions for reviewer
   */
  async suggestImprovements(context: ReviewContext): Promise<string[]> {
    try {
      const systemPrompt = `You are an AI HR coach helping managers improve their performance review feedback.
Analyze the review and suggest how the reviewer can improve their feedback to be:
- More specific and actionable
- Better balanced between strengths and areas for improvement
- More constructive and development-focused
- Supported by concrete examples

Return an array of suggestions in JSON format:
{ "suggestions": ["suggestion1", "suggestion2"] }`;

      const userPrompt = this.buildPrompt(context);

      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.4,
      });

      const result = JSON.parse(response.choices[0]?.message?.content ?? '{}');
      return result.suggestions ?? [];
    } catch (error) {
      console.error('Improvement suggestions failed:', error);
      return [];
    }
  }

  /**
   * Build prompt from review context
   */
  private buildPrompt(context: ReviewContext): string {
    return `
Performance Review Analysis:

Employee: ${context.employeeName}
Position: ${context.position}
Review Type: ${context.reviewType}
Overall Rating: ${context.overallRating ?? 'Not set'}

Category Ratings:
${context.ratings.map((r) => `- ${r.categoryName}: ${r.rating}/5${r.comments ? `\n  Comments: ${r.comments}` : ''}`).join('\n')}

Strengths:
${context.strengths ?? 'Not provided'}

Areas for Improvement:
${context.areasForImprovement ?? 'Not provided'}

Achievements:
${context.achievements ?? 'Not provided'}

Reviewer Comments:
${context.reviewerComments ?? 'Not provided'}

${context.employeeComments ? `Employee Comments:\n${context.employeeComments}` : ''}

Please analyze this performance review.`;
  }

  /**
   * Fallback basic sentiment analysis based on ratings
   */
  private basicSentimentAnalysis(context: ReviewContext): SentimentAnalysisResult {
    const avgRating = context.overallRating ??
      (context.ratings.length > 0
        ? context.ratings.reduce((sum, r) => sum + r.rating, 0) / context.ratings.length
        : 3);

    let sentiment: 'positive' | 'neutral' | 'negative';
    let sentimentScore: number;
    let tone: 'constructive' | 'harsh' | 'encouraging' | 'neutral';

    if (avgRating >= 4) {
      sentiment = 'positive';
      sentimentScore = 0.7 + (avgRating - 4) * 0.3;
      tone = 'encouraging';
    } else if (avgRating >= 3) {
      sentiment = 'neutral';
      sentimentScore = 0.4 + (avgRating - 3) * 0.3;
      tone = 'constructive';
    } else {
      sentiment = 'negative';
      sentimentScore = avgRating / 6; // Scale 1-2 to 0.17-0.33
      tone = context.areasForImprovement ? 'constructive' : 'harsh';
    }

    return {
      sentiment,
      sentimentScore,
      summary: `Performance review with average rating of ${avgRating.toFixed(1)}/5`,
      keyThemes: [],
      strengthsIdentified: context.strengths ? [context.strengths] : [],
      areasForImprovementIdentified: context.areasForImprovement
        ? [context.areasForImprovement]
        : [],
      recommendations: [
        'Consider providing more specific examples',
        'Balance feedback between strengths and areas for improvement',
      ],
      tone,
      confidence: 0.6,
    };
  }
}
