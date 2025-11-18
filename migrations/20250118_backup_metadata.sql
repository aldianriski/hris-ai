-- Backup Metadata Table
-- Store metadata about database backups

CREATE TABLE IF NOT EXISTS backup_metadata (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('full', 'incremental')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version TEXT NOT NULL,
  tables TEXT[] NOT NULL,
  size BIGINT NOT NULL,
  compression TEXT NOT NULL,
  checksum TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_backup_metadata_timestamp ON backup_metadata(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_backup_metadata_type ON backup_metadata(type);
CREATE INDEX IF NOT EXISTS idx_backup_metadata_status ON backup_metadata(status);

-- RLS Policies
ALTER TABLE backup_metadata ENABLE ROW LEVEL SECURITY;

-- Only service role can access backup metadata
CREATE POLICY "Service role only" ON backup_metadata
  FOR ALL
  USING (auth.role() = 'service_role');

-- Updated at trigger
CREATE TRIGGER update_backup_metadata_updated_at
  BEFORE UPDATE ON backup_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE backup_metadata IS 'Metadata about database backups';
COMMENT ON COLUMN backup_metadata.id IS 'Unique backup identifier';
COMMENT ON COLUMN backup_metadata.type IS 'Backup type: full or incremental';
COMMENT ON COLUMN backup_metadata.timestamp IS 'When the backup was created';
COMMENT ON COLUMN backup_metadata.version IS 'Backup format version';
COMMENT ON COLUMN backup_metadata.tables IS 'List of tables included in backup';
COMMENT ON COLUMN backup_metadata.size IS 'Size of backup file in bytes';
COMMENT ON COLUMN backup_metadata.compression IS 'Compression algorithm used';
COMMENT ON COLUMN backup_metadata.checksum IS 'SHA-256 checksum for integrity verification';
COMMENT ON COLUMN backup_metadata.status IS 'Backup status: pending, completed, or failed';
COMMENT ON COLUMN backup_metadata.error IS 'Error message if backup failed';
