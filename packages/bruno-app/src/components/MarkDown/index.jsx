import MarkdownIt from 'markdown-it';
import * as MarkdownItReplaceLink from 'markdown-it-replace-link';
import StyledWrapper from './StyledWrapper';
import { useMemo } from 'react';

const Markdown = ({ collectionPath, onDoubleClick, content }) => {
  const htmlFromMarkdown = useMemo(() => {
    const markdownItOptions = {
      replaceLink: function (link) {
        return link.replace(/^\./, collectionPath);
      }
    };

    const md = new MarkdownIt(markdownItOptions).use(MarkdownItReplaceLink);

    return md.render(content || '');
  }, [collectionPath, content]);

  const handleClick = (event) => {
    if (event.target.href) {
      event.preventDefault();
      window.open(event.target.href, '_blank');
      return;
    }

    if (event?.detail === 2) {
      onDoubleClick();
    }
  };

  return (
    <StyledWrapper>
      <div className="markdown-body" dangerouslySetInnerHTML={{ __html: htmlFromMarkdown }} onClick={handleClick} />
    </StyledWrapper>
  );
};

export default Markdown;
