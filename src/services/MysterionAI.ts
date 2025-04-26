import { AIService } from 'services/MysterionAI';

export class ChatAI {
  private aiService = new AIService();

  async getResponse(userInput: string): Promise<string> {
    // Process the input and fetch AI response
    return this.aiService.generateResponse(userInput);
  }
}