import React, { useState } from 'react';

interface ShareButtonProps {
  onShare: () => Promise<string>;
  disabled?: boolean;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ onShare, disabled = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const handleShare = async () => {
    setIsLoading(true);
    try {
      const url = await onShare();
      setShareUrl(url);
    } catch (error) {
      console.error('共有URLの生成エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('URLをコピーしました！');
    } catch (error) {
      console.error('コピーエラー:', error);
      alert('URLのコピーに失敗しました');
    }
  };

  const closeShareDialog = () => {
    setShareUrl(null);
  };

  return (
    <div className="share-button-container">
      <button
        onClick={handleShare}
        disabled={isLoading || disabled}
        className="share-button"
      >
        {isLoading ? 'URLを生成中...' : '共有URLを作成'}
      </button>

      {shareUrl && (
        <div className="share-dialog-overlay" onClick={closeShareDialog}>
          <div className="share-dialog" onClick={(e) => e.stopPropagation()}>
            <h4>共有URL</h4>
            <p>この文章を共有するためのURLが作成されました！</p>
            <div className="share-url-container">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="share-url-input"
              />
              <button onClick={copyToClipboard} className="copy-url-button">
                コピー
              </button>
            </div>
            <div className="share-dialog-actions">
              <button onClick={closeShareDialog} className="close-button">
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};