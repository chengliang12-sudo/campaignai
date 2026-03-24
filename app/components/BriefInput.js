export default function BriefInput({ brief, setBrief, onSubmit, isGenerating, loading, loadingDirection, loadingScenes }) {
  return (
    <div>
      <textarea
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
        placeholder="Paste your marketing brief here..."
        style={{
          width: '100%', height: '200px', padding: '16px', fontSize: '15px',
          border: '1px solid #ddd', borderRadius: '8px', resize: 'vertical',
          marginBottom: '16px', boxSizing: 'border-box',
        }}
      />
      <button
        onClick={onSubmit}
        disabled={isGenerating}
        style={{
          backgroundColor: isGenerating ? '#999' : '#1a1a1a',
          color: 'white', border: 'none', padding: '12px 28px', fontSize: '15px',
          borderRadius: '8px', cursor: isGenerating ? 'not-allowed' : 'pointer',
          marginBottom: '40px',
        }}
      >
        {loading ? 'Reading your brief...'
          : loadingDirection ? 'Writing creative direction...'
          : loadingScenes ? 'Building your storyboard...'
          : 'Generate Storyboard'}
      </button>
    </div>
  );
}