export function validatePhoneNumber(phone: string): boolean {
  // Remove any spaces or special characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Check if it's exactly 10 digits and starts with 6 or 9
  return cleanPhone.length === 10 && (cleanPhone.startsWith('6') || cleanPhone.startsWith('9'));
}

export function detectSeverity(tags: string[], description: string): 'High' | 'Medium' | 'Low' {
  const highSeverityTags = ['injury', 'trapped'];
  const mediumSeverityTags = ['lost', 'suspicious'];
  
  // Check for life-threatening keywords in description
  const criticalWords = ['bleeding', 'unconscious', 'heart', 'breathing', 'chest pain', 'stroke'];
  const descriptionLower = description.toLowerCase();
  
  if (tags.some(tag => highSeverityTags.includes(tag)) || 
      criticalWords.some(word => descriptionLower.includes(word))) {
    return 'High';
  }
  
  if (tags.some(tag => mediumSeverityTags.includes(tag))) {
    return 'Medium';
  }
  
  return 'Low';
}