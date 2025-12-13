
import { MentionIndices } from "./types";

export function useMentionDetection() {
  // Calculate mention string position in text
  const getMentionIndices = (text: string, caretPos: number): MentionIndices | null => {
    let startIndex = caretPos - 1;
    
    // Find the @ character before the cursor
    while (startIndex >= 0 && text[startIndex] !== '@') {
      startIndex--;
    }
    
    // If we didn't find @ or it's not preceded by a space or start of text, no valid mention
    if (startIndex < 0) {
      return null;
    }
    
    // Make sure @ is at beginning of text or has a space/newline before it
    if (startIndex > 0 && !/[\s\n]/.test(text[startIndex - 1])) {
      return null;
    }
    
    // Log the found indices for debugging
    console.log("Found mention indices:", { 
      start: startIndex, 
      end: caretPos, 
      query: text.substring(startIndex + 1, caretPos) 
    });
    
    return {
      start: startIndex,
      end: caretPos,
      query: text.substring(startIndex + 1, caretPos)
    };
  };

  return {
    getMentionIndices
  };
}
