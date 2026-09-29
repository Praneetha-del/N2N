import React from 'react';
import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';

const ChatMessage = ({ message, isUser }) => {
  const isStreaming = message?.isStreaming || false;
  const content = message?.content || '';

  // ✅ Simple formatting - converts markdown-like syntax to HTML
  const formatContent = (text) => {
    if (!text) return null;

    // Split by new lines
    const lines = text.split('\n');
    const elements = [];
    let inTable = false;
    let tableRows = [];
    let tableHeaders = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Skip empty lines
      if (!trimmedLine && !inTable) {
        elements.push(<br key={`br-${index}`} />);
        return;
      }

      // Check for headers
      if (trimmedLine.startsWith('### ')) {
        elements.push(<h3 key={index} className="text-md font-bold my-1">{trimmedLine.substring(4)}</h3>);
        return;
      }
      if (trimmedLine.startsWith('## ')) {
        elements.push(<h2 key={index} className="text-lg font-bold my-2">{trimmedLine.substring(3)}</h2>);
        return;
      }
      if (trimmedLine.startsWith('# ')) {
        elements.push(<h1 key={index} className="text-xl font-bold my-2">{trimmedLine.substring(2)}</h1>);
        return;
      }

      // Check for horizontal rule
      if (trimmedLine === '---' || trimmedLine === '***' || trimmedLine === '___') {
        elements.push(<hr key={index} className="my-2 border-gray-300" />);
        return;
      }

      // Check for tables
      if (trimmedLine.includes('|')) {
        const cells = trimmedLine.split('|').filter(c => c.trim());
        
        // Check if it's a table header separator (contains ---)
        if (trimmedLine.includes('---')) {
          inTable = true;
          return;
        }

        if (inTable || cells.length > 1) {
          if (tableHeaders.length === 0 && cells.length > 0) {
            tableHeaders = cells.map(c => c.trim());
            return;
          }
          
          tableRows.push(
            <tr key={`row-${index}`} className="border border-gray-300">
              {cells.map((cell, i) => (
                <td key={`cell-${index}-${i}`} className="border border-gray-300 px-2 py-1">
                  {cell.trim()}
                </td>
              ))}
            </tr>
          );
          
          // If this is the last row, render the table
          if (index === lines.length - 1 && tableRows.length > 0) {
            elements.push(
              <table key="table" className="border-collapse border border-gray-300 my-2 w-full">
                {tableHeaders.length > 0 && (
                  <thead>
                    <tr className="bg-gray-100">
                      {tableHeaders.map((header, i) => (
                        <th key={`th-${i}`} className="border border-gray-300 px-2 py-1 text-left">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>{tableRows}</tbody>
              </table>
            );
            tableHeaders = [];
            tableRows = [];
            inTable = false;
          }
          return;
        }
      }

      // Check for bullet points
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        elements.push(
          <li key={index} className="ml-4 list-disc my-0.5">
            {formatInline(trimmedLine.substring(2))}
          </li>
        );
        return;
      }

      // Check for numbered lists
      if (/^\d+\.\s/.test(trimmedLine)) {
        elements.push(
          <li key={index} className="ml-4 list-decimal my-0.5">
            {formatInline(trimmedLine.replace(/^\d+\.\s/, ''))}
          </li>
        );
        return;
      }

      // Regular paragraph
      elements.push(
        <p key={index} className="my-1">
          {formatInline(trimmedLine)}
        </p>
      );
    });

    return elements;
  };

  // ✅ Format inline elements (bold, italic, code, links)
  const formatInline = (text) => {
    if (!text) return null;

    // Split by **bold** and *italic*
    const parts = [];
    let currentText = text;
    let boldIndex = currentText.indexOf('**');
    let italicIndex = currentText.indexOf('*');

    while (boldIndex !== -1 || italicIndex !== -1) {
      // Handle bold first
      if (boldIndex !== -1 && (italicIndex === -1 || boldIndex < italicIndex)) {
        const before = currentText.substring(0, boldIndex);
        if (before) parts.push(before);
        
        const endBold = currentText.indexOf('**', boldIndex + 2);
        if (endBold !== -1) {
          const boldText = currentText.substring(boldIndex + 2, endBold);
          parts.push(<strong key={`bold-${parts.length}`}>{boldText}</strong>);
          currentText = currentText.substring(endBold + 2);
        } else {
          parts.push(currentText);
          break;
        }
      } 
      // Handle italic
      else if (italicIndex !== -1) {
        const before = currentText.substring(0, italicIndex);
        if (before) parts.push(before);
        
        const endItalic = currentText.indexOf('*', italicIndex + 1);
        if (endItalic !== -1) {
          const italicText = currentText.substring(italicIndex + 1, endItalic);
          parts.push(<em key={`italic-${parts.length}`}>{italicText}</em>);
          currentText = currentText.substring(endItalic + 1);
        } else {
          parts.push(currentText);
          break;
        }
      }

      boldIndex = currentText.indexOf('**');
      italicIndex = currentText.indexOf('*');
    }

    if (currentText) parts.push(currentText);
    
    return parts.length > 0 ? parts : text;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex items-start space-x-2 max-w-[85%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-blue-600' : 'bg-gray-600'
        }`}>
          {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
        </div>
        <div className={`rounded-lg px-4 py-2 ${
          isUser ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border border-gray-200'
        }`}>
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap">{content}</p>
          ) : (
            <div className="text-sm">
              {formatContent(content)}
            </div>
          )}
          {isStreaming && content && (
            <span className="inline-block w-0.5 h-4 ml-0.5 bg-blue-500 animate-pulse"></span>
          )}
          {isStreaming && !content && (
            <span className="inline-flex space-x-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;