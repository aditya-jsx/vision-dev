import { Step, StepType } from '../lib/types';
import { safePath } from './safePath';

export function parseXml(response: string): Step[] {
    // Extract the XML content between <visionArtifact> tags
    const xmlMatch = response.match(/<visionArtifact[^>]*>([\s\S]*?)<\/visionArtifact>/);
    
    if (!xmlMatch) {
      return [];
    }
  
    const xmlContent = xmlMatch[1];
    const steps: Step[] = [];
    let stepId = 1;
  
    // Extract artifact title
    const titleMatch = response.match(/title="([^"]*)"/);
    const artifactTitle = titleMatch ? titleMatch[1] : 'Project Files';
  
    // Add initial artifact step
    steps.push({
      id: stepId++,
      title: artifactTitle,
      description: '',
      type: StepType.CreateFolder,
      status: 'pending'
    });
  
    // Regular expression to find visionAction elements
    const actionRegex = /<visionAction\s+type="([^"]*)"(?:\s+filePath="([^"]*)")?>([\s\S]*?)<\/visionAction>/g;
    
    let match;
    while ((match = actionRegex.exec(xmlContent)) !== null) {
      const [, type, filePath, content] = match;
  
      if (type === 'file') {
        const path = safePath(filePath);
        if (!path) {
          console.warn(`Skipping file with unsafe path: ${filePath}`);
          continue;
        }
        steps.push({
          id: stepId++,
          title: `Create ${path}`,
          description: '',
          type: StepType.CreateFile,
          status: 'pending',
          code: content.trim(),
          path
        });
      } else if (type === 'shell') {
        // Shell command step
        steps.push({
          id: stepId++,
          title: 'Run command',
          description: '',
          type: StepType.RunScript,
          status: 'pending',
          code: content.trim()
        });
      }
    }
  
    return steps;
  }