export default function MagXLandingEmbed() {
  const version = 'drape-session-realtext-17';

  return (
    <iframe
      key={version}
      title="MagXStudio Landing"
      src={`/pages/drape/index.html?v=${version}`}
      style={{
        border: 0,
        width: '100%',
        height: '100vh',
        display: 'block',
        background: '#000'
      }}
    />
  );
}
