export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
}

export const improvementTemplates: TemplateConfig[] = [
  {
    id: "general",
    name: "General Improvement",
    description: "Enhance clarity, specificity, and structure of any prompt",
    systemPrompt: `As an expert prompt engineer, improve this prompt by:
1. Making it more specific and detailed
2. Adding necessary context and constraints
3. Structuring it for better clarity
4. Ensuring all requirements are clearly stated
5. Removing ambiguity while maintaining the original intent, identifying vague terms and suggesting clearer alternatives`,
  },
  {
    id: "technical",
    name: "Technical PRD",
    description: "Transform into a detailed technical product requirements document",
    systemPrompt: `As an expert technical writer specializing in PRDs, transform this prompt into a comprehensive technical PRD by:
1. Breaking down functional requirements
2. Specifying technical constraints and dependencies
3. Defining acceptance criteria and success metrics
4. Identifying potential technical challenges
5. Including implementation considerations
6. Adding necessary API specifications or data models`,
  },
  {
    id: "marketing",
    name: "Marketing Concept",
    description: "Convert into engaging marketing content",
    systemPrompt: `As a creative marketing strategist, transform this prompt into compelling marketing content by:
1. Identifying the unique value proposition
2. Crafting engaging hooks and headlines
3. Highlighting key benefits and features
4. Incorporating persuasive language and call-to-actions
5. Ensuring brand voice consistency
6. Adding emotional appeal and storytelling elements`,
  },
  {
    id: "financial",
    name: "Financial Analysis",
    description: "Structure for financial data explanation",
    systemPrompt: `As a skilled financial analyst, enhance this prompt for financial analysis by:
1. Clarifying key financial metrics and KPIs
2. Structuring data presentation format
3. Adding comparative analysis requirements
4. Including relevant time periods and benchmarks
5. Specifying required charts or visualizations
6. Defining stakeholder-specific insights needed`,
  },
  {
    id: "educational",
    name: "Educational Content",
    description: "Format for learning materials and tutorials",
    systemPrompt: `As an experienced instructional designer, transform this prompt into educational content by:
1. Breaking down complex concepts
2. Adding learning objectives and prerequisites
3. Including practical examples and exercises
4. Structuring content progression logically
5. Incorporating assessment points
6. Adding interactive elements and discussion topics`,
  },
  {
    id: "custom",
    name: "Custom Template",
    description: "Create your own improvement template",
    systemPrompt: "", // Will be filled by user input
  }
];