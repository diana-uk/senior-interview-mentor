export default function AppSkeleton() {
  return (
    <div className="app-skeleton">
      <div className="app-skeleton__topnav">
        <div className="skeleton-block" style={{ width: 32, height: 32, borderRadius: 8 }} />
        <div className="skeleton-block" style={{ width: 120, height: 16 }} />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <div className="skeleton-block" style={{ width: 80, height: 28 }} />
          <div className="skeleton-block" style={{ width: 28, height: 28, borderRadius: '50%' }} />
        </div>
      </div>
      <div className="app-skeleton__body">
        <div className="app-skeleton__sidebar">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton-block" style={{ width: 28, height: 28, borderRadius: 6 }} />
          ))}
        </div>
        <div className="app-skeleton__chat">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton-block" style={{ height: 56, borderRadius: 8, marginBottom: 12 }} />
          ))}
        </div>
        <div className="app-skeleton__editor">
          <div className="skeleton-block" style={{ height: 32, marginBottom: 12, width: '60%' }} />
          <div className="skeleton-block" style={{ flex: 1, borderRadius: 8 }} />
        </div>
      </div>
    </div>
  );
}
