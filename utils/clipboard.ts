const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      return fallbackCopyTextToClipboard(text);
    }
  } catch (error) {
    console.error("Copy to clipboard failed:", error);
    return fallbackCopyTextToClipboard(text);
  }
};

const fallbackCopyTextToClipboard = (text: string): boolean => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  let success = false;
  try {
    success = document.execCommand("copy");
  } catch (err) {
    console.error("Fallback copy failed:", err);
  } finally {
    document.body.removeChild(textArea);
  }
  
  return success;
};

export { copyToClipboard }; 