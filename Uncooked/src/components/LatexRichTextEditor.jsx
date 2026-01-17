import { useState, useEffect } from 'react';

/**
 * Component that provides a rich text editor for LaTeX content
 * Parses LaTeX into editable structured text and converts back to LaTeX
 */
function LatexRichTextEditor({ latex, onChange, readOnly = false }) {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    // Parse LaTeX into sections
    const parsed = parseLatexToSections(latex);
    setSections(parsed);
  }, [latex]);

  const parseLatexToSections = (latexContent) => {
    const sectionsList = [];
    
    if (!latexContent) return sectionsList;
    
    // Extract document content (between \begin{document} and \end{document})
    const docMatch = latexContent.match(/\\begin\{document\}([\s\S]*)\\end\{document\}/);
    if (!docMatch) return sectionsList;
    
    const content = docMatch[1];
    
    // Parse header (content in \begin{center}...\end{center})
    const headerMatch = content.match(/\\begin\{center\}([\s\S]*?)\\end\{center\}/);
    if (headerMatch) {
      const rawHeader = headerMatch[1].trim();
      // Split by \\\\ but keep the structure
      const headerLines = rawHeader.split(/\\\\(?:\[\d+mm\])?/).map(l => l.trim()).filter(l => l);
      sectionsList.push({
        type: 'header',
        content: headerLines.map(line => cleanLatexText(line)).filter(l => l),
        rawLines: headerLines // Keep raw for reconstruction
      });
    }
    
    // Parse sections (\section*{Title})
    const sectionRegex = /\\section\*\{([^}]+)\}([\s\S]*?)(?=\\section\*|\\end\{document\}|$)/g;
    let match;
    
    while ((match = sectionRegex.exec(content)) !== null) {
      const title = match[1];
      const sectionContent = match[2].trim();
      
      // Find prefix (content before itemize or end)
      const itemizeStart = sectionContent.indexOf('\\begin{itemize');
      const prefix = itemizeStart > 0 ? sectionContent.substring(0, itemizeStart).trim() : '';
      
      // Parse bullet points
      const itemsMatch = sectionContent.match(/\\begin\{itemize\}(?:\[[^\]]+\])?([\s\S]*?)\\end\{itemize\}/);
      if (itemsMatch) {
        const rawItems = itemsMatch[1].trim();
        const items = rawItems
          .split(/\\item\s+/)
          .map(item => item.trim())
          .filter(item => item.length > 0)
          .map(item => cleanLatexText(item));
        
        sectionsList.push({
          type: 'section',
          title: title,
          items: items,
          prefix: prefix ? cleanLatexText(prefix) : '',
          rawPrefix: prefix
        });
      } else if (sectionContent.trim()) {
        // Non-itemized section
        sectionsList.push({
          type: 'section',
          title: title,
          content: cleanLatexText(sectionContent),
          rawContent: sectionContent
        });
      }
    }
    
    return sectionsList;
  };

  const cleanLatexText = (text) => {
    if (!text) return '';
    return text
      .replace(/\\textbf\{([^}]+)\}/g, '$1')  // Remove \textbf{}
      .replace(/\{\\Large\\textbf\{([^}]+)\}\}/g, '$1')  // Remove {\Large\textbf{}}
      .replace(/\{\\Large/g, '')  // Remove {\Large
      .replace(/\\Large/g, '')
      .replace(/\\textit\{([^}]+)\}/g, '$1')  // Remove \textit{}
      .replace(/\\hfill/g, ' | ')  // Convert hfill to separator
      .replace(/\\\\(?:\[\d+mm\])?/g, ' ')  // Remove line breaks
      .replace(/\[[\d]+mm\]/g, '')  // Remove spacing
      .replace(/[{}]/g, '')  // Remove remaining braces
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .trim();
  };

  const convertSectionsToLatex = (sectionsList) => {
    // Extract preamble from original latex if available
    let preamble = '';
    if (latex) {
      const preambleMatch = latex.match(/([\s\S]*?)\\begin\{document\}/);
      if (preambleMatch) {
        preamble = preambleMatch[1];
      }
    }
    
    // Use extracted preamble or default
    if (!preamble) {
      preamble = '\\documentclass[11pt,a4paper]{article}\n';
      preamble += '\\usepackage[utf8]{inputenc}\n';
      preamble += '\\usepackage[margin=1in]{geometry}\n';
      preamble += '\\usepackage{enumitem}\n';
    }
    
    let output = preamble;
    output += '\\begin{document}\n\n';
    
    sectionsList.forEach(section => {
      if (section.type === 'header') {
        output += '\\begin{center}\n';
        section.content.forEach((line, idx) => {
          if (idx === 0) {
            output += `{\\Large\\textbf{${line}}}\\\\[2mm]\n`;
          } else {
            output += `${line}`;
            if (idx < section.content.length - 1) {
              output += '\\\\\n';
            } else {
              output += '\n';
            }
          }
        });
        output += '\\end{center}\n\n';
      } else if (section.type === 'section') {
        output += `\\section*{${section.title}}\n`;
        
        // Add prefix if exists
        if (section.prefix && section.prefix.trim()) {
          output += `${section.prefix}\n`;
        }
        
        // Add items if exists
        if (section.items && section.items.length > 0) {
          output += '\\begin{itemize}[noitemsep]\n';
          section.items.forEach(item => {
            output += `  \\item ${item}\n`;
          });
          output += '\\end{itemize}\n\n';
        } else if (section.content && section.content.trim()) {
          // Non-itemized content
          output += `${section.content}\n\n`;
        }
      }
    });
    
    output += '\\end{document}';
    return output;
  };

  const handleSectionEdit = (index, field, value) => {
    const newSections = [...sections];
    newSections[index][field] = value;
    setSections(newSections);
    
    // Convert back to LaTeX and notify parent
    const newLatex = convertSectionsToLatex(newSections);
    onChange(newLatex);
  };

  const handleItemEdit = (sectionIndex, itemIndex, value) => {
    const newSections = [...sections];
    newSections[sectionIndex].items[itemIndex] = value;
    setSections(newSections);
    
    const newLatex = convertSectionsToLatex(newSections);
    onChange(newLatex);
  };

  const addItem = (sectionIndex) => {
    const newSections = [...sections];
    if (!newSections[sectionIndex].items) {
      newSections[sectionIndex].items = [];
    }
    newSections[sectionIndex].items.push('New item');
    setSections(newSections);
    
    const newLatex = convertSectionsToLatex(newSections);
    onChange(newLatex);
  };

  const removeItem = (sectionIndex, itemIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].items.splice(itemIndex, 1);
    setSections(newSections);
    
    const newLatex = convertSectionsToLatex(newSections);
    onChange(newLatex);
  };

  // Debug: log if no sections parsed
  if (sections.length === 0 && latex) {
    console.log('No sections parsed from LaTeX:', latex.substring(0, 200));
  }

  return (
    <div style={{
      height: '700px',
      overflow: 'auto',
      padding: '20px',
      backgroundColor: '#fafafa',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {sections.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', color: '#7f8c8d' }}>
          <p>Unable to parse LaTeX content. Switch to LaTeX Code mode to edit directly.</p>
        </div>
      ) : (
        sections.map((section, sectionIndex) => (
        <div key={sectionIndex} style={{ marginBottom: '30px' }}>
          {section.type === 'header' && (
            <div style={{
              textAlign: 'center',
              borderBottom: '2px solid #273E47',
              paddingBottom: '15px',
              marginBottom: '25px'
            }}>
              {section.content.map((line, lineIndex) => (
                <div key={lineIndex} style={{ marginBottom: '8px' }}>
                  {readOnly ? (
                    <div style={{
                      fontSize: lineIndex === 0 ? '24px' : '14px',
                      fontWeight: lineIndex === 0 ? 'bold' : 'normal',
                      color: '#273E47'
                    }}>
                      {line}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={line}
                      onChange={(e) => {
                        const newContent = [...section.content];
                        newContent[lineIndex] = e.target.value;
                        handleSectionEdit(sectionIndex, 'content', newContent);
                      }}
                      style={{
                        width: '100%',
                        fontSize: lineIndex === 0 ? '24px' : '14px',
                        fontWeight: lineIndex === 0 ? 'bold' : 'normal',
                        textAlign: 'center',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        padding: '8px',
                        color: '#273E47'
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          
          {section.type === 'section' && (
            <div style={{
              backgroundColor: 'white',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid #D8973C'
            }}>
              <h3 style={{
                margin: '0 0 12px 0',
                color: '#BD632F',
                fontSize: '20px',
                borderBottom: '2px solid #D8973C',
                paddingBottom: '8px'
              }}>
                {readOnly ? section.title : (
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => handleSectionEdit(sectionIndex, 'title', e.target.value)}
                    style={{
                      width: '100%',
                      fontSize: '20px',
                      fontWeight: 'bold',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      color: '#BD632F'
                    }}
                  />
                )}
              </h3>
              
              {section.prefix && (
                <div style={{ marginBottom: '12px', color: '#273E47' }}>
                  {readOnly ? section.prefix : (
                    <textarea
                      value={section.prefix}
                      onChange={(e) => handleSectionEdit(sectionIndex, 'prefix', e.target.value)}
                      style={{
                        width: '100%',
                        minHeight: '40px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        padding: '8px',
                        fontFamily: 'inherit',
                        fontSize: '14px',
                        color: '#273E47'
                      }}
                    />
                  )}
                </div>
              )}
              
              {section.items && (
                <ul style={{ margin: '0', paddingLeft: '20px' }}>
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'start' }}>
                        {readOnly ? (
                          <div style={{ flex: 1, color: '#273E47' }}>{item}</div>
                        ) : (
                          <>
                            <textarea
                              value={item}
                              onChange={(e) => handleItemEdit(sectionIndex, itemIndex, e.target.value)}
                              style={{
                                flex: 1,
                                minHeight: '32px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                padding: '6px',
                                fontFamily: 'inherit',
                                fontSize: '14px',
                                color: '#273E47',
                                resize: 'vertical'
                              }}
                            />
                            <button
                              onClick={() => removeItem(sectionIndex, itemIndex)}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              ✕
                            </button>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              
              {section.content && !section.items && (
                <div style={{ color: '#273E47' }}>
                  {readOnly ? section.content : (
                    <textarea
                      value={section.content}
                      onChange={(e) => handleSectionEdit(sectionIndex, 'content', e.target.value)}
                      style={{
                        width: '100%',
                        minHeight: '100px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        padding: '8px',
                        fontFamily: 'inherit',
                        fontSize: '14px',
                        color: '#273E47'
                      }}
                    />
                  )}
                </div>
              )}
              
              {!readOnly && section.items && (
                <button
                  onClick={() => addItem(sectionIndex)}
                  style={{
                    marginTop: '10px',
                    padding: '6px 12px',
                    backgroundColor: '#D8973C',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  + Add Item
                </button>
              )}
            </div>
          )}
        </div>
      ))
      )}
    </div>
  );
}

export default LatexRichTextEditor;
