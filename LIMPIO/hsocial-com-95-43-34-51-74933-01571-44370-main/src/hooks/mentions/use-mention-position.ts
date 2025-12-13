
import { useState, useEffect } from "react";
import { MentionPosition } from "./types";

export function useMentionPosition() {
  const [mentionPosition, setMentionPosition] = useState<MentionPosition>({ top: 0, left: 0 });

  const calculateMentionPosition = (
    inputElement: HTMLTextAreaElement | HTMLInputElement, 
    caretPosition: number
  ) => {
    try {
      // Get input dimensions and position
      const inputRect = inputElement.getBoundingClientRect();
      
      // Create a ghost div to measure text dimensions accurately
      const ghostDiv = document.createElement('div');
      
      // Copy the input's styles to the ghost div
      const inputStyle = window.getComputedStyle(inputElement);
      Object.assign(ghostDiv.style, {
        width: `${inputElement.offsetWidth}px`,
        fontFamily: inputStyle.fontFamily,
        fontSize: inputStyle.fontSize,
        fontWeight: inputStyle.fontWeight,
        letterSpacing: inputStyle.letterSpacing,
        paddingLeft: inputStyle.paddingLeft,
        paddingTop: inputStyle.paddingTop,
        border: '1px solid red',
        position: 'fixed',
        top: '-999px',
        left: '0',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        visibility: 'hidden'
      });
      
      // Add the ghost div to the DOM
      document.body.appendChild(ghostDiv);
      
      // Get text before the caret
      const textBeforeCaret = inputElement.value.substring(0, caretPosition);
      const lines = textBeforeCaret.split('\n');
      
      // Insert text into the ghost div
      ghostDiv.textContent = lines[lines.length - 1];
      
      // Measure the width of the text
      const textWidth = ghostDiv.clientWidth;
      
      // Calculate the position
      const lineHeight = parseInt(inputStyle.lineHeight) || parseInt(inputStyle.fontSize) * 1.2;
      const charactersPerLine = Math.floor(inputElement.clientWidth / (parseInt(inputStyle.fontSize) * 0.6));
      const numLines = Math.ceil(textBeforeCaret.length / charactersPerLine);
      
      let top = inputRect.top + lineHeight * (lines.length);
      let left = inputRect.left + ghostDiv.offsetWidth;
      
      // Clean up
      document.body.removeChild(ghostDiv);
      
      // Assign the calculated position
      console.log("Calculated mention position:", { top, left, lineHeight, lines: lines.length });
      
      // Make sure the mention list appears below the caret
      if (inputElement.tagName.toLowerCase() === 'textarea') {
        // For textareas we need to compute the vertical position based on line breaks
        const lineCount = textBeforeCaret.split('\n').length;
        top = inputRect.top + (lineCount * lineHeight) + 8;
        
        // Horizontal position is based on the current line's width
        const currentLineText = textBeforeCaret.split('\n').pop() || '';
        left = inputRect.left + (currentLineText.length * (parseInt(inputStyle.fontSize) * 0.6));
      }
      
      // Adjust for scrolling within the textarea
      if (inputElement.scrollTop > 0) {
        top -= inputElement.scrollTop;
      }
      
      // Ensure the position is within viewport bounds
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Add some offset to position the menu correctly
      top += 20; // Position below the caret
      
      // Make sure it doesn't go off-screen
      if (top + 200 > viewportHeight) {
        top = Math.max(50, top - 250); // 200px for menu height + 50px buffer
      }
      
      if (left + 250 > viewportWidth) {
        left = Math.max(10, viewportWidth - 260); // 250px for menu width + 10px buffer
      }
      
      setMentionPosition({ top, left });
    } catch (error) {
      console.error("Error calculating mention position:", error);
      // Fallback to a default position
      setMentionPosition({ top: inputElement.getBoundingClientRect().bottom + 5, left: inputElement.getBoundingClientRect().left });
    }
  };

  return { mentionPosition, calculateMentionPosition };
}
